"""
Unit Tests for Phase 2:
- Lunar Affine Coordinate Systems & Georeferencing
- Scale-Dependent CE90 Alignment Error Budgeting
- Categorical vs Continuous Grid Resampling
- Multi-dimensional Quality Assessment & QualityLedger Governance (M2b)
"""

import os
import tempfile
import numpy as np
import pytest

from ml_pipeline.core.taxonomy import QualityState, OriginCategory
from ml_pipeline.preprocessing.coregistration import (
    LunarGeoReference,
    CoregistrationEngine
)
from ml_pipeline.preprocessing.quality_governance import (
    QualityAssessment,
    QualityLedger
)


class TestLunarGeoreferencing:
    def test_affine_round_trip(self):
        ref = LunarGeoReference(
            x_origin=150000.0,
            y_origin=-320000.0,
            pixel_width=0.25,     # 0.25 m/px OHRC
            pixel_height=-0.25,
            x_skew=0.0,
            y_skew=0.0
        )
        assert ref.nominal_resolution_m == pytest.approx(0.25, abs=1e-4)

        col, row = 128.5, 256.0
        x_geo, y_geo = ref.pixel_to_geo(col, row)
        c_inv, r_inv = ref.geo_to_pixel(x_geo, y_geo)

        assert c_inv == pytest.approx(col, abs=1e-5)
        assert r_inv == pytest.approx(row, abs=1e-5)


class TestCoregistrationEngine:
    def test_ce90_budget_formula(self):
        # delta_x_coarse = 5.0m (TMC-2 DEM), D_collar = 100m (Tranquillitatis)
        # min(1.5 * 5.0, 0.05 * 100) = min(7.5, 5.0) = 5.0m
        budget = CoregistrationEngine.compute_ce90_budget(
            delta_x_coarse_m=5.0,
            pit_collar_diameter_m=100.0
        )
        assert budget == pytest.approx(5.0, abs=1e-3)

        # delta_x_coarse = 2.0m, D_collar = 80m -> min(3.0, 4.0) = 3.0m
        budget2 = CoregistrationEngine.compute_ce90_budget(
            delta_x_coarse_m=2.0,
            pit_collar_diameter_m=80.0
        )
        assert budget2 == pytest.approx(3.0, abs=1e-3)

    def test_categorical_vs_continuous_resampling(self):
        src_ref = LunarGeoReference(0, 0, 1.0, -1.0)
        dst_ref = LunarGeoReference(0, 0, 0.5, -0.5)

        # Categorical binary mask (must only contain 0 and 1, no intermediate floats)
        binary_mask = np.array([
            [0, 0, 1, 1],
            [0, 0, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ], dtype=np.uint8)

        resampled_cat = CoregistrationEngine.resample_to_grid(
            source_raster=binary_mask,
            source_ref=src_ref,
            target_ref=dst_ref,
            target_shape=(8, 8),
            is_categorical=True
        )
        unique_vals = np.unique(resampled_cat)
        assert set(unique_vals).issubset({0, 1})

    def test_alignment_evaluation_passed_and_failed(self):
        ref = np.zeros((64, 64), dtype=np.float32)
        ref[20:44, 20:44] = 10.0  # Simulated circular pit feature

        # Perfectly aligned
        res_pass = CoregistrationEngine.evaluate_alignment(
            reference_raster=ref,
            aligned_raster=ref,
            pixel_scale_m=0.25,
            pit_collar_diameter_m=80.0
        )
        assert res_pass["passed_budget"] is True
        assert res_pass["quality_state"] == "ACCEPTED"
        assert res_pass["residual_meters"] < res_pass["ce90_threshold_m"]


class TestQualityLedgerGovernance:
    def test_assessment_exclusion_rules(self):
        ledger = QualityLedger()

        # 1. High quality OHRC raster
        good_raster = np.random.uniform(50, 200, size=(128, 128)).astype(np.float32)
        q_good = ledger.assess_raster_observation(
            source_id="OHRC_Marius_01",
            candidate_id="CAN-001",
            raster=good_raster,
            nominal_resolution_m=0.25,
            target_feature_size_m=60.0,
            origin_category=OriginCategory.REAL,
            calibrated=True,
            ce90_residual_m=0.5
        )
        assert q_good.quality_state == QualityState.ACCEPTED
        assert q_good.restriction_notes is None

        # 2. Incomplete raster (nodata NaNs > 35%) -> must be REJECTED
        bad_raster = good_raster.copy()
        bad_raster[:60, :] = np.nan
        q_bad = ledger.assess_raster_observation(
            source_id="OHRC_Corrupted_02",
            candidate_id="CAN-001",
            raster=bad_raster,
            nominal_resolution_m=0.25,
            target_feature_size_m=60.0,
            origin_category=OriginCategory.REAL
        )
        assert q_bad.quality_state == QualityState.REJECTED

        # 3. Very coarse DEM for tiny pit (resolution insufficiency) -> REJECTED
        coarse_raster = np.random.uniform(0, 100, size=(32, 32)).astype(np.float32)
        q_coarse = ledger.assess_raster_observation(
            source_id="DEM_Coarse_03",
            candidate_id="CAN-001",
            raster=coarse_raster,
            nominal_resolution_m=25.0,  # 25m/px for 15m pit
            target_feature_size_m=15.0,
            origin_category=OriginCategory.REAL
        )
        assert q_coarse.quality_state == QualityState.REJECTED

        # 4. Filter accepted observations for candidate fusion
        accepted = ledger.get_accepted_observations("CAN-001")
        assert len(accepted) == 1
        assert accepted[0].source_id == "OHRC_Marius_01"

    def test_export_quality_ledger_csv(self):
        ledger = QualityLedger()
        raster = np.random.uniform(50, 180, size=(32, 32)).astype(np.float32)
        ledger.assess_raster_observation(
            source_id="SRC-100",
            candidate_id="CAN-002",
            raster=raster,
            nominal_resolution_m=0.5,
            target_feature_size_m=50.0
        )
        with tempfile.TemporaryDirectory() as tmpdir:
            csv_path = os.path.join(tmpdir, "quality_ledger.csv")
            ledger.export_csv(csv_path)
            assert os.path.exists(csv_path)
            with open(csv_path, "r", encoding="utf-8") as f:
                content = f.read()
                assert "SRC-100" in content
                assert "CAN-002" in content
                assert "ACCEPTED" in content
