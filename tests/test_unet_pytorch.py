"""
Unit and Integration Tests for Phase 1:
- PyTorch U-Net Architecture & DoubleConv
- Loss Functions (Dice + BCE)
- Checkpoint Serialization/Deserialization
- Zero-Fabrication UNTRAINED Lifecycle State
- Core Taxonomy & Evidence Schema Serialization
"""

import os
import tempfile
import numpy as np
import pytest
import torch
from torch.utils.data import TensorDataset, DataLoader

from ml_pipeline.core.taxonomy import (
    ImplementationStatus,
    OriginCategory,
    LifecycleState,
    QualityState,
    EvidenceDirection,
    EvidenceRecord
)
from ml_pipeline.models.unet import (
    LunarUNet,
    DoubleConv,
    DiceLoss,
    CombinedLoss,
    UNetSegmentationModel
)


class TestCoreTaxonomy:
    """Verifies compliance with v4.0 Section 0.1, 4.6, 12.5"""
    def test_status_taxonomy_values(self):
        expected_statuses = {
            "IMPLEMENTED", "EXPERIMENTAL", "SIMULATED",
            "HEURISTIC", "PLANNED", "UNAVAILABLE", "UNTRAINED"
        }
        actual_statuses = {s.value for s in ImplementationStatus}
        assert expected_statuses == actual_statuses

    def test_origin_categories(self):
        expected_origins = {"REAL", "SYNTHETIC", "AUGMENTED", "SIMULATED", "UNKNOWN"}
        actual_origins = {o.value for o in OriginCategory}
        assert expected_origins == actual_origins

    def test_evidence_record_serialization(self):
        rec = EvidenceRecord(
            evidence_id="EV-001",
            candidate_id="CAN-MARIUS-01",
            feature_type="optical_pit_depression",
            observed_or_derived_value=65.4,
            status=ImplementationStatus.IMPLEMENTED,
            origin_category=OriginCategory.REAL,
            source_ids=["OHRC_20230514_01"],
            method_version="unet_v4.0",
            quality_state=QualityState.ACCEPTED,
            uncertainty={"std_error_m": 2.1},
            dependencies=["REG-OHRC-TMC2"],
            direction=EvidenceDirection.SUPPORTS
        )
        data = rec.to_dict()
        assert data["evidence_id"] == "EV-001"
        assert data["status"] == "IMPLEMENTED"
        assert data["origin_category"] == "REAL"
        assert data["direction"] == "SUPPORTS"
        assert "timestamp" in data["provenance"]


class TestPyTorchUNet:
    """Verifies PyTorch U-Net neural network architecture"""
    def test_forward_dimensions(self):
        device = torch.device("cpu")
        net = LunarUNet(in_channels=1, out_channels=1, base_filters=8).to(device)
        
        # Test batch size 2, 64x64 resolution
        x = torch.randn(2, 1, 64, 64, device=device)
        out = net(x)
        assert out.shape == (2, 1, 64, 64)

        # Test batch size 1, 128x128 resolution
        x2 = torch.randn(1, 1, 128, 128, device=device)
        out2 = net(x2)
        assert out2.shape == (1, 1, 128, 128)

    def test_dice_loss_bounds(self):
        loss_fn = DiceLoss(smooth=1e-5)
        # Perfect match: logits large where targets are 1
        targets = torch.tensor([[[[1.0, 0.0], [0.0, 1.0]]]])
        perfect_logits = torch.tensor([[[[10.0, -10.0], [-10.0, 10.0]]]])
        loss_perfect = loss_fn(perfect_logits, targets)
        assert loss_perfect.item() < 0.05

        # Inverted match
        inverted_logits = torch.tensor([[[[-10.0, 10.0], [10.0, -10.0]]]])
        loss_worst = loss_fn(inverted_logits, targets)
        assert loss_worst.item() > 0.95

    def test_combined_loss_backward(self):
        loss_fn = CombinedLoss(dice_weight=0.5)
        net = LunarUNet(in_channels=1, out_channels=1, base_filters=8)
        optimizer = torch.optim.Adam(net.parameters(), lr=1e-3)

        x = torch.randn(2, 1, 32, 32)
        targets = torch.randint(0, 2, (2, 1, 32, 32)).float()

        optimizer.zero_grad()
        logits = net(x)
        loss, metrics = loss_fn(logits, targets)
        loss.backward()
        optimizer.step()

        assert "total_loss" in metrics
        assert "dice_coefficient" in metrics
        assert 0.0 <= metrics["dice_coefficient"] <= 1.0


class TestZeroFabricationAndWrapper:
    """Verifies strict adherence to Zero-Fabrication Policy"""
    def test_untrained_status_refusal(self):
        model = UNetSegmentationModel(in_channels=1, out_channels=1, base_filters=8)
        assert model.status == ImplementationStatus.UNTRAINED

        patch = np.random.randn(64, 64).astype(np.float32)
        result = model.predict_mask(patch, allow_untrained=False)

        # Must refuse prediction
        assert result["status"] == "UNTRAINED"
        assert result["prediction_available"] is False
        assert result["confidence"] == 0.0
        assert np.all(result["binary_mask"] == 0)
        assert "Zero-Fabrication policy" in result["message"]

    def test_checkpoint_lifecycle_and_prediction(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            ckpt_path = os.path.join(tmpdir, "unet_test_checkpoint.pt")
            
            # Step 1: Instantiate & train for 1 mini-epoch
            model = UNetSegmentationModel(in_channels=1, out_channels=1, base_filters=8)
            images = torch.randn(4, 1, 32, 32)
            masks = torch.randint(0, 2, (4, 1, 32, 32)).float()
            dataset = TensorDataset(images, masks)
            loader = DataLoader(dataset, batch_size=2)
            
            optimizer = torch.optim.Adam(model.net.parameters(), lr=1e-3)
            metrics = model.train_epoch(loader, optimizer)
            assert "train_loss" in metrics
            assert model.status == ImplementationStatus.EXPERIMENTAL

            # Step 2: Save checkpoint
            model.save_checkpoint(ckpt_path, optimizer=optimizer, epoch=1, metrics=metrics)
            assert os.path.exists(ckpt_path)

            # Step 3: Load into a fresh model instance
            fresh_model = UNetSegmentationModel(
                in_channels=1,
                out_channels=1,
                base_filters=8,
                checkpoint_path=ckpt_path
            )
            assert fresh_model.status == ImplementationStatus.IMPLEMENTED

            # Step 4: Verify prediction is now legitimately enabled
            patch = np.random.randn(32, 32).astype(np.float32)
            pred = fresh_model.predict_mask(patch)
            assert pred["status"] == "IMPLEMENTED"
            assert pred["prediction_available"] is True
            assert pred["binary_mask"].shape == (32, 32)
            assert 0.0 <= pred["confidence"] <= 1.0
