"""
LunaSafe-AI PyTorch U-Net Segmentation Architecture
Conforming to Combined Research & Implementation Pipeline v4.0 (Section 7, 23.4)

Implements:
- Genuine PyTorch nn.Module with encoder-decoder and skip connections
- DoubleConv blocks with BatchNorm and ReLU
- DiceLoss + BCEWithLogitsLoss
- True checkpoint serialization and deserialization
- Explicit UNTRAINED lifecycle status handling (Zero-Fabrication Policy)
"""

import os
from typing import Dict, Any, Tuple, Optional, Union
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

from ml_pipeline.core.taxonomy import ImplementationStatus


class DoubleConv(nn.Module):
    """(Conv2D -> BatchNorm -> ReLU) * 2"""
    def __init__(self, in_channels: int, out_channels: int, mid_channels: Optional[int] = None):
        super().__init__()
        if mid_channels is None:
            mid_channels = out_channels
        self.double_conv = nn.Sequential(
            nn.Conv2d(in_channels, mid_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(mid_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(mid_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.double_conv(x)


class Down(nn.Module):
    """Downscaling with MaxPool2D then DoubleConv"""
    def __init__(self, in_channels: int, out_channels: int):
        super().__init__()
        self.maxpool_conv = nn.Sequential(
            nn.MaxPool2d(2),
            DoubleConv(in_channels, out_channels)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.maxpool_conv(x)


class Up(nn.Module):
    """Upscaling then DoubleConv with skip connection concatenation"""
    def __init__(self, in_channels: int, out_channels: int, bilinear: bool = False):
        super().__init__()
        if bilinear:
            self.up = nn.Upsample(scale_factor=2, mode='bilinear', align_corners=True)
            self.conv = DoubleConv(in_channels, out_channels, in_channels // 2)
        else:
            self.up = nn.ConvTranspose2d(in_channels, in_channels // 2, kernel_size=2, stride=2)
            self.conv = DoubleConv(in_channels, out_channels)

    def forward(self, x1: torch.Tensor, x2: torch.Tensor) -> torch.Tensor:
        x1 = self.up(x1)
        # Pad x1 to match x2 if dimensions differ slightly due to odd resolutions
        diff_y = x2.size()[2] - x1.size()[2]
        diff_x = x2.size()[3] - x1.size()[3]

        x1 = F.pad(x1, [diff_x // 2, diff_x - diff_x // 2,
                        diff_y // 2, diff_y - diff_y // 2])
        x = torch.cat([x2, x1], dim=1)
        return self.conv(x)


class LunarUNet(nn.Module):
    """
    Trainable Convolutional U-Net for Lunar Surface Feature & Pit Segmentation.
    Outputs unnormalized logits.
    """
    def __init__(self, in_channels: int = 1, out_channels: int = 1, base_filters: int = 16, bilinear: bool = False):
        super().__init__()
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.bilinear = bilinear

        self.inc = DoubleConv(in_channels, base_filters)
        self.down1 = Down(base_filters, base_filters * 2)
        self.down2 = Down(base_filters * 2, base_filters * 4)
        self.down3 = Down(base_filters * 4, base_filters * 8)
        factor = 2 if bilinear else 1
        self.down4 = Down(base_filters * 8, (base_filters * 16) // factor)
        
        self.up1 = Up(base_filters * 16, (base_filters * 8) // factor, bilinear)
        self.up2 = Up(base_filters * 8, (base_filters * 4) // factor, bilinear)
        self.up3 = Up(base_filters * 4, (base_filters * 2) // factor, bilinear)
        self.up4 = Up(base_filters * 2, base_filters, bilinear)
        self.outc = nn.Conv2d(base_filters, out_channels, kernel_size=1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x1 = self.inc(x)
        x2 = self.down1(x1)
        x3 = self.down2(x2)
        x4 = self.down3(x3)
        x5 = self.down4(x4)
        
        x = self.up1(x5, x4)
        x = self.up2(x, x3)
        x = self.up3(x, x2)
        x = self.up4(x, x1)
        logits = self.outc(x)
        return logits


class DiceLoss(nn.Module):
    """Soft Dice Loss for binary segmentation"""
    def __init__(self, smooth: float = 1.0):
        super().__init__()
        self.smooth = smooth

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        probs = torch.sigmoid(logits)
        probs_flat = probs.view(-1)
        targets_flat = targets.view(-1)
        
        intersection = (probs_flat * targets_flat).sum()
        dice_coeff = (2.0 * intersection + self.smooth) / (probs_flat.sum() + targets_flat.sum() + self.smooth)
        return 1.0 - dice_coeff


class CombinedLoss(nn.Module):
    """Weighted sum of BCE with Logits Loss and Soft Dice Loss"""
    def __init__(self, dice_weight: float = 0.5, pos_weight: Optional[float] = None):
        super().__init__()
        self.dice_weight = dice_weight
        self.dice_loss = DiceLoss()
        pos_weight_tensor = torch.tensor([pos_weight]) if pos_weight is not None else None
        self.bce_loss = nn.BCEWithLogitsLoss(pos_weight=pos_weight_tensor)

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> Tuple[torch.Tensor, Dict[str, float]]:
        bce = self.bce_loss(logits, targets)
        dice = self.dice_loss(logits, targets)
        total = (1.0 - self.dice_weight) * bce + self.dice_weight * dice
        
        with torch.no_grad():
            probs = torch.sigmoid(logits)
            p_flat = probs.view(-1)
            t_flat = targets.view(-1)
            intersection = (p_flat * t_flat).sum()
            dice_coeff = float((2.0 * intersection + 1.0) / (p_flat.sum() + t_flat.sum() + 1.0))

        return total, {
            "total_loss": float(total.item()),
            "bce_loss": float(bce.item()),
            "dice_loss": float(dice.item()),
            "dice_coefficient": dice_coeff
        }


class PredictionResult(dict):
    """
    Result dictionary that supports 2-tuple unpacking (binary_mask, confidence)
    for backward compatibility while providing full schema access.
    """
    def __iter__(self):
        yield self["binary_mask"]
        yield self["confidence"]


class UNetSegmentationModel:
    """
    Production wrapper for LunarUNet conforming to v4.0 Zero-Fabrication Policy.
    - Manages training, evaluation, checkpointing, and prediction.
    - If no checkpoint is loaded, status is UNTRAINED and predictions return explicit refusal.
    """
    def __init__(
        self,
        in_channels: int = 1,
        out_channels: int = 1,
        base_filters: int = 16,
        device: Optional[str] = None,
        checkpoint_path: Optional[str] = None
    ):
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.base_filters = base_filters
        
        if device is None:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = torch.device(device)
            
        self.net = LunarUNet(
            in_channels=in_channels,
            out_channels=out_channels,
            base_filters=base_filters
        ).to(self.device)
        
        self.loss_fn = CombinedLoss()
        self.status = ImplementationStatus.UNTRAINED
        self.checkpoint_metadata: Dict[str, Any] = {}
        
        if checkpoint_path and os.path.exists(checkpoint_path):
            self.load_checkpoint(checkpoint_path)

    def load_checkpoint(self, checkpoint_path: str) -> None:
        """Loads model weights and metadata from checkpoint"""
        checkpoint = torch.load(checkpoint_path, map_location=self.device)
        if "model_state_dict" in checkpoint:
            self.net.load_state_dict(checkpoint["model_state_dict"])
            self.checkpoint_metadata = checkpoint.get("metadata", {})
        else:
            self.net.load_state_dict(checkpoint)
        self.status = ImplementationStatus.IMPLEMENTED

    def save_checkpoint(
        self,
        save_path: str,
        optimizer: Optional[torch.optim.Optimizer] = None,
        epoch: Optional[int] = None,
        metrics: Optional[Dict[str, float]] = None
    ) -> None:
        """Saves current state dict and training metadata to disk"""
        os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
        payload = {
            "model_state_dict": self.net.state_dict(),
            "in_channels": self.in_channels,
            "out_channels": self.out_channels,
            "base_filters": self.base_filters,
            "metadata": {
                "epoch": epoch,
                "metrics": metrics or {},
                "status": self.status.value
            }
        }
        if optimizer:
            payload["optimizer_state_dict"] = optimizer.state_dict()
        torch.save(payload, save_path)

    def forward(self, x: Union[np.ndarray, torch.Tensor]) -> torch.Tensor:
        """Direct forward pass returning logits"""
        self.net.eval()
        if isinstance(x, np.ndarray):
            if x.ndim == 2:
                x = x[np.newaxis, np.newaxis, :, :]
            elif x.ndim == 3:
                x = x[np.newaxis, :, :, :]
            x = torch.from_numpy(x).float().to(self.device)
        with torch.no_grad():
            return self.net(x)

    def predict_mask(
        self,
        patch: np.ndarray,
        threshold: float = 0.5,
        allow_untrained: bool = False
    ) -> Dict[str, Any]:
        """
        Inference interface conforming to Zero-Fabrication Policy.
        If status is UNTRAINED and allow_untrained is False, refuses to fabricate prediction.
        """
        if self.status == ImplementationStatus.UNTRAINED and not allow_untrained:
            return PredictionResult({
                "status": ImplementationStatus.UNTRAINED.value,
                "prediction_available": False,
                "binary_mask": np.zeros(patch.shape[-2:], dtype=np.uint8),
                "confidence": 0.0,
                "prob_map": None,
                "message": "Model status is UNTRAINED. Checkpoint not loaded. Refusing to generate fabricated prediction per v4.0 Zero-Fabrication policy."
            })

        # Normalize patch
        std = np.std(patch)
        norm_patch = (patch - np.mean(patch)) / (std if std > 1e-6 else 1.0)
        
        logits = self.forward(norm_patch)
        probs = torch.sigmoid(logits).squeeze().cpu().numpy()
        
        binary_mask = (probs >= threshold).astype(np.uint8)
        
        if np.sum(binary_mask) > 0:
            confidence = float(np.mean(probs[binary_mask == 1]))
        else:
            confidence = float(np.max(probs)) if probs.size > 0 else 0.0

        return PredictionResult({
            "status": self.status.value,
            "prediction_available": True,
            "binary_mask": binary_mask,
            "confidence": confidence,
            "prob_map": probs,
            "message": "Prediction generated from active model weights."
        })

    def train_epoch(
        self,
        dataloader: torch.utils.data.DataLoader,
        optimizer: torch.optim.Optimizer
    ) -> Dict[str, float]:
        """Executes one real training epoch"""
        self.net.train()
        total_loss = 0.0
        total_dice = 0.0
        steps = 0

        for images, targets in dataloader:
            images = images.to(self.device).float()
            targets = targets.to(self.device).float()
            if targets.ndim == 3:
                targets = targets.unsqueeze(1)

            optimizer.zero_grad()
            logits = self.net(images)
            loss, metrics = self.loss_fn(logits, targets)
            loss.backward()
            optimizer.step()

            total_loss += metrics["total_loss"]
            total_dice += metrics["dice_coefficient"]
            steps += 1

        self.status = ImplementationStatus.EXPERIMENTAL
        return {
            "train_loss": total_loss / max(1, steps),
            "train_dice": total_dice / max(1, steps)
        }
