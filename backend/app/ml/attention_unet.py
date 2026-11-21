"""Attention U-Net architecture with skip-connection attention gates and Test-Time Augmentation (TTA).

References:
    - Oktay, O., et al. (2018). "Attention U-Net: Learning Where to Look for the Pancreas." MIDL.
    - Sinha, R. K., et al. (2024). "Automated Lunar Crater Identification with Chandrayaan-2 TMC-2." Sci Rep.
"""

from typing import List, Tuple
import torch
import torch.nn as nn
import torch.nn.functional as F


class AttentionGate(nn.Module):
    """Attention Gate (AG) mechanism filtering skip connections using deeper gating signals.
    
    Suppresses irrelevant lunar surface noise (impact crater rims, highlands)
    while amplifying distinct pit-crater shadow boundaries.
    """

    def __init__(self, in_channels_x: int, in_channels_g: int, inter_channels: int):
        super().__init__()
        self.Wx = nn.Sequential(
            nn.Conv2d(in_channels_x, inter_channels, kernel_size=1, stride=1, padding=0, bias=False),
            nn.BatchNorm2d(inter_channels),
        )
        self.Wg = nn.Sequential(
            nn.Conv2d(in_channels_g, inter_channels, kernel_size=1, stride=1, padding=0, bias=False),
            nn.BatchNorm2d(inter_channels),
        )
        self.psi = nn.Sequential(
            nn.Conv2d(inter_channels, 1, kernel_size=1, stride=1, padding=0, bias=False),
            nn.BatchNorm2d(1),
            nn.Sigmoid(),
        )
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x: torch.Tensor, g: torch.Tensor) -> torch.Tensor:
        # Resize gating signal g to match spatial dimensions of x if downsampled
        if g.size()[2:] != x.size()[2:]:
            g = F.interpolate(g, size=x.size()[2:], mode="bilinear", align_corners=True)

        theta_x = self.Wx(x)
        phi_g = self.Wg(g)
        f = self.relu(theta_x + phi_g)
        alpha = self.psi(f)
        return x * alpha


class ResidualDoubleConv(nn.Module):
    """Residual (Conv -> BatchNorm -> ReLU -> Conv -> BatchNorm) block with skip projection."""

    def __init__(self, in_channels: int, out_channels: int):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
        )
        self.shortcut = nn.Sequential()
        if in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=1, bias=False),
                nn.BatchNorm2d(out_channels),
            )
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        res = self.shortcut(x)
        out = self.conv(x)
        return self.relu(out + res)


class AttentionUNet(nn.Module):
    """Attention U-Net for high-resolution lunar remote sensing segmentation."""

    def __init__(self, in_channels: int = 1, num_classes: int = 1, base_filters: int = 32):
        super().__init__()
        # Encoder
        self.conv1 = ResidualDoubleConv(in_channels, base_filters)
        self.pool1 = nn.MaxPool2d(2)

        self.conv2 = ResidualDoubleConv(base_filters, base_filters * 2)
        self.pool2 = nn.MaxPool2d(2)

        self.conv3 = ResidualDoubleConv(base_filters * 2, base_filters * 4)
        self.pool3 = nn.MaxPool2d(2)

        self.conv4 = ResidualDoubleConv(base_filters * 4, base_filters * 8)
        self.pool4 = nn.MaxPool2d(2)

        # Bottleneck
        self.bottleneck = ResidualDoubleConv(base_filters * 8, base_filters * 16)

        # Attention Gates & Decoder
        self.up4 = nn.Upsample(scale_factor=2, mode="bilinear", align_corners=True)
        self.ag4 = AttentionGate(base_filters * 8, base_filters * 16, base_filters * 4)
        self.dec4 = ResidualDoubleConv(base_filters * 16 + base_filters * 8, base_filters * 8)

        self.up3 = nn.Upsample(scale_factor=2, mode="bilinear", align_corners=True)
        self.ag3 = AttentionGate(base_filters * 4, base_filters * 8, base_filters * 2)
        self.dec3 = ResidualDoubleConv(base_filters * 8 + base_filters * 4, base_filters * 4)

        self.up2 = nn.Upsample(scale_factor=2, mode="bilinear", align_corners=True)
        self.ag2 = AttentionGate(base_filters * 2, base_filters * 4, base_filters)
        self.dec2 = ResidualDoubleConv(base_filters * 4 + base_filters * 2, base_filters * 2)

        self.up1 = nn.Upsample(scale_factor=2, mode="bilinear", align_corners=True)
        self.ag1 = AttentionGate(base_filters, base_filters * 2, base_filters // 2)
        self.dec1 = ResidualDoubleConv(base_filters * 2 + base_filters, base_filters)

        self.final = nn.Conv2d(base_filters, num_classes, kernel_size=1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Encoder path
        c1 = self.conv1(x)
        p1 = self.pool1(c1)

        c2 = self.conv2(p1)
        p2 = self.pool2(c2)

        c3 = self.conv3(p2)
        p3 = self.pool3(c3)

        c4 = self.conv4(p3)
        p4 = self.pool4(c4)

        # Bottleneck
        b = self.bottleneck(p4)

        # Decoder with Attention Gates
        d4 = self.up4(b)
        x4_attn = self.ag4(x=c4, g=b)
        cat4 = torch.cat([x4_attn, d4], dim=1)
        d4_conv = self.dec4(cat4)

        d3 = self.up3(d4_conv)
        x3_attn = self.ag3(x=c3, g=d4_conv)
        cat3 = torch.cat([x3_attn, d3], dim=1)
        d3_conv = self.dec3(cat3)

        d2 = self.up2(d3_conv)
        x2_attn = self.ag2(x=c2, g=d3_conv)
        cat2 = torch.cat([x2_attn, d2], dim=1)
        d2_conv = self.dec2(cat2)

        d1 = self.up1(d2_conv)
        x1_attn = self.ag1(x=c1, g=d2_conv)
        cat1 = torch.cat([x1_attn, d1], dim=1)
        d1_conv = self.dec1(cat1)

        logits = self.final(d1_conv)
        return logits


class CompoundFocalDiceLoss(nn.Module):
    """Compound loss combining Focal Loss (for class imbalance) and Soft Dice Loss."""

    def __init__(self, gamma: float = 2.0, alpha: float = 0.75, dice_weight: float = 1.0):
        super().__init__()
        self.gamma = gamma
        self.alpha = alpha
        self.dice_weight = dice_weight

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        probs = torch.sigmoid(logits)
        bce = F.binary_cross_entropy_with_logits(logits, targets, reduction="none")
        p_t = probs * targets + (1 - probs) * (1 - targets)
        focal_loss = (self.alpha * (1 - p_t) ** self.gamma * bce).mean()

        # Soft Dice Loss
        smooth = 1.0
        p_flat = probs.view(-1)
        t_flat = targets.view(-1)
        intersection = (p_flat * t_flat).sum()
        dice_loss = 1.0 - (2.0 * intersection + smooth) / (p_flat.sum() + t_flat.sum() + smooth)

        return focal_loss + self.dice_weight * dice_loss


def predict_with_tta(model: nn.Module, tensor_image: torch.Tensor) -> torch.Tensor:
    """Test-Time Augmentation (TTA) applying 4-fold dihedral rotation and flip averaging.
    
    Improves boundary sharpness and robustness on circular/elliptical lunar pits.
    """
    model.eval()
    with torch.no_grad():
        # 1. Original
        p1 = torch.sigmoid(model(tensor_image))

        # 2. Horizontal flip
        p2 = torch.sigmoid(model(torch.flip(tensor_image, dims=[3])))
        p2 = torch.flip(p2, dims=[3])

        # 3. Vertical flip
        p3 = torch.sigmoid(model(torch.flip(tensor_image, dims=[2])))
        p3 = torch.flip(p3, dims=[2])

        # 4. Horizontal + Vertical flip (180 deg)
        p4 = torch.sigmoid(model(torch.flip(tensor_image, dims=[2, 3])))
        p4 = torch.flip(p4, dims=[2, 3])

        # Average ensemble predictions
        tta_probs = (p1 + p2 + p3 + p4) / 4.0
        return tta_probs
