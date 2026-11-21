"""
Unit and Integration Tests for MOSDAC Terrestrial Analog Ingestion
and Cross-Domain Transfer Learning Pipeline.
"""

import pytest
import numpy as np
import torch

from ml_pipeline.ingestion.mosdac_loader import (
    mosdac_loader,
    MOSDACAnalogLoader,
    TERRESTRIAL_VOLCANIC_ANALOGS,
)
from ml_pipeline.models.transfer_learner import (
    transfer_learner,
    compute_mmd,
    GeomechanicalPhysicsRegularizer,
    HardNegativeShadowDiscriminator,
    MultistageTransferLearner,
)
from ml_pipeline.features.dfsar_features import DFSARFeatureExtractor
from ml_pipeline.ranking.isro_scoring import ISROChandrayaanScoringEngine


class TestMOSDACAnalogLoader:
    def test_list_analog_sites(self):
        sites = mosdac_loader.list_analog_sites()
        assert len(sites) >= 3
        site_ids = [s["site_id"] for s in sites]
        assert "DECCAN_TRAPS_WESTERN_GHATS" in site_ids
        assert "LONAR_CRATER_BASALT" in site_ids
        assert "KUTCH_VOLCANIC_PLUGS" in site_ids

    def test_analog_site_physics_metadata(self):
        deccan = mosdac_loader.get_site_metadata("DECCAN_TRAPS_WESTERN_GHATS")
        assert 6.0 <= deccan.dielectric_permittivity_real <= 9.0
        assert deccan.dielectric_loss_tangent > 0.0
        assert "RISAT-1/1A C-band SAR" in deccan.primary_sensors

    def test_synthesize_calibrated_analog_tile(self):
        tile = mosdac_loader.synthesize_calibrated_analog_tile("LONAR_CRATER_BASALT", tile_dim=64, pit_probability=1.0)
        tensor = tile["tensor"]
        mask = tile["mask"]

        assert tensor.shape == (4, 64, 64)
        assert mask.shape == (64, 64)
        assert np.all(tensor >= -0.5) and np.all(tensor <= 1.5)  # normalized ranges
        assert np.sum(mask) > 0  # pit present

    def test_generate_pretraining_batch(self):
        X, y, meta = mosdac_loader.generate_pretraining_batch(batch_size=4, tile_dim=64)
        assert X.shape == (4, 4, 64, 64)
        assert y.shape == (4, 1, 64, 64)
        assert meta["batch_size"] == 4
        assert len(meta["channels"]) == 4


class TestTransferLearner:
    def test_mmd_computation(self):
        x = torch.randn(4, 16, 8, 8)
        y = torch.randn(4, 16, 8, 8)
        mmd_diff = compute_mmd(x, y)
        assert mmd_diff.item() >= 0.0

        # Identical distribution should yield near-zero MMD
        mmd_same = compute_mmd(x, x)
        assert mmd_same.item() < 1e-5

    def test_physics_regularizer(self):
        regularizer = GeomechanicalPhysicsRegularizer(weight=0.2)
        pred_masks = torch.ones(2, 1, 32, 32) * 5.0  # high confidence pit
        steep_slopes = torch.ones(2, 1, 32, 32) * 0.8  # > 42/90 deg normalized
        gentle_slopes = torch.zeros(2, 1, 32, 32)

        pen_steep = regularizer(pred_masks, steep_slopes)
        pen_gentle = regularizer(pred_masks, gentle_slopes)

        assert pen_steep.item() > pen_gentle.item()
        assert pen_gentle.item() == 0.0

    def test_pretraining_and_finetuning_steps(self):
        learner = MultistageTransferLearner(device="cpu")
        res_pretrain = learner.run_terrestrial_pretraining(steps=2, batch_size=2)
        assert res_pretrain["phase"] == "PHASE_1_MOSDAC_PRETRAIN"
        assert learner.is_pretrained is True

        res_finetune = learner.run_pradan_finetuning(steps=2, batch_size=2)
        assert res_finetune["phase"] == "PHASE_3_PRADAN_FINETUNED"
        assert learner.is_finetuned is True

    def test_comparative_performance_evaluation(self):
        learner = MultistageTransferLearner(device="cpu")
        eval_report = learner.evaluate_comparative_performance()

        baseline = eval_report["baseline"]
        transfer = eval_report["transfer_learned"]
        lift = eval_report["lift_analysis"]

        # Assert precision improves significantly
        assert transfer["object_precision"] > baseline["object_precision"]
        assert lift["precision_gain_absolute"] >= 0.20

        # Assert false alarms drop
        assert transfer["false_positive_density_per_km2"] < baseline["false_positive_density_per_km2"]
        assert lift["false_alarm_reduction_pct"] > 60.0

        # Assert Dice improves
        assert transfer["mean_dice"] > baseline["mean_dice"]
        assert transfer["dielectric_calibrated"] is True

        # Assert enhanced model with Lever 1 reaches >90% precision and <10 FP/km²
        enhanced = eval_report["enhanced_model"]
        assert enhanced["object_precision"] >= 0.90
        assert enhanced["false_positive_density_per_km2"] < 10.0
        assert enhanced["shadow_mining_active"] is True
        assert lift["transfer_to_enhanced_precision_gain"] > 0.05

    def test_hard_negative_shadow_discriminator(self):
        discriminator = HardNegativeShadowDiscriminator()
        
        # Test 1: Authentic pit with steep rim slope and high radar CPR
        pit_res = discriminator.discriminate(
            optical_shadow=0.92,
            dem_slope_deg=22.5,
            dfsar_cpr=0.85,
            dfsar_volume_ratio=0.45
        )
        assert pit_res["is_authentic_cavity"] is True
        assert pit_res["false_alarm_flag"] is False
        assert pit_res["cavity_probability"] > 0.70

        # Test 2: Benign shallow impact depression with flat floor and low CPR
        shallow_res = discriminator.discriminate(
            optical_shadow=0.88,
            dem_slope_deg=4.2,
            dfsar_cpr=0.25,
            dfsar_volume_ratio=0.15
        )
        assert shallow_res["is_authentic_cavity"] is False
        assert shallow_res["false_alarm_flag"] is True

        # Test 3: PyTorch forward pass shape test
        dummy_tensor = torch.randn(2, 4, 32, 32)
        logits = discriminator(dummy_tensor)
        assert logits.shape == (2, 1)

    def test_dfsar_m_chi_polarimetric_decomposition(self):
        sigma0 = np.full((32, 32), -15.0)
        cpr = np.full((32, 32), 0.85)
        feats = DFSARFeatureExtractor.extract_features(sigma0, cpr)
        
        assert "dfsar_m_chi_frac_volume" in feats
        assert "dfsar_m_chi_frac_double" in feats
        assert "dfsar_m_chi_frac_surface" in feats
        assert "dfsar_cavity_roof_intactness" in feats
        assert feats["dfsar_cavity_roof_intactness"] > 0.0
        assert 0.0 <= feats["dfsar_m_chi_frac_volume"] <= 1.0

    def test_isro_lhi_scoring_engine_enhancements(self):
        candidate_site = {
            "id": "LLT-002",
            "name": "Mare Tranquillitatis Pit",
            "terrain": "Mare",
            "isKnownPit": True,
            "profile_inputs": {
                "optical_pit_evidence": 0.95,
                "radar_scattering_anomaly": 0.92
            },
            "observedEvidence": {
                "opticalPitEvidence": 0.95,
                "radarScatteringAnomaly": 0.92,
                "meanSurfaceSlopeDeg": 5.2,
                "cpr_mean": 0.82
            },
            "simulated_structural_scenarios": {
                "median_factor_of_safety": 7.3,
                "assumed_roof_thickness_range_m": [15.0, 30.0]
            },
            "roof": {
                "roofThicknessM": 18.0
            }
        }
        res = ISROChandrayaanScoringEngine.compute_lhi(candidate_site)
        assert res["isro_lhi_score"] >= 90.0
        assert res["exploration_tier"] == "TIER_1_PRIORITY_CANDIDATE"
        assert "chaste_thermal_diagnostics" in res
        assert "dfsar_polarimetric_diagnostics" in res
        assert res["chaste_thermal_diagnostics"]["thermal_damping_ratio"] > 0.99
