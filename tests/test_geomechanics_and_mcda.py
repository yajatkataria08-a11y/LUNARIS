"""
Unit Tests for Phase 4:
- M6 Exploratory Geomechanical Structural Screening (physics_engine.py)
- M7 Multi-Profile Non-Compensatory Decision Funnel (mcda.py)
- Non-Compensatory 5-Gate Sequential Elimination
- Monte Carlo Credible Intervals & Rank Ordering
"""

import pytest
import numpy as np

from ml_pipeline.simulation.physics_engine import GeomechanicalPhysicsEngine
from ml_pipeline.ranking.mcda import (
    DecisionProfile,
    MCDARankingEngine
)


class TestGeomechanicalPhysicsEngine:
    def test_reduced_rock_mass_parameters(self):
        engine = GeomechanicalPhysicsEngine(
            density_kg_m3=2800.0,
            rock_mass_modulus_gpa=12.0,
            rock_mass_tensile_mpa=1.0,
            rock_mass_compressive_mpa=35.0
        )
        assert engine.sigma_tm_allow == 1.0e6
        assert engine.sigma_cm_allow == 35.0e6

    def test_scenario_envelope_ranges(self):
        engine = GeomechanicalPhysicsEngine()
        # Sweep span 40m - 80m, roof thickness 10m - 25m
        env = engine.evaluate_scenario_envelope(
            span_range=(40.0, 80.0),
            roof_thickness_range=(10.0, 25.0)
        )
        assert env["is_simulated_scenario"] is True
        fs_min, fs_max = env["fs_range"]
        assert fs_min <= fs_max
        assert 0.1 <= fs_min <= 10.0
        assert "crown_tension_range_mpa" in env
        assert "stability_index_range" in env


class TestMCDARankingEngine:
    def test_non_compensatory_gate_elimination(self):
        # Site 1: Highland crater -> Must fail Gate 2
        site_highland = {
            "id": "SITE-HIGH",
            "name": "Highland Crater Rim",
            "terrain": "Highland",
            "uncertainty": 0.20,
            "detection": {"opticalEvidence": 0.95, "radarEvidence": 0.90},
            "roof": {"skylightDepthM": 40.0}
        }
        res_h = MCDARankingEngine.evaluate_candidate(site_highland, {})
        assert res_h["passed_gates"] is False
        assert "Gate 2 Failure" in res_h["disqualification_reason"]
        assert res_h["ranking_status"] == "ELIMINATED_BY_GATE"

        # Site 2: Structurally unstable scenario (FS < 1.0) -> Must fail Gate 3
        site_unstable = {
            "id": "SITE-UNSTABLE",
            "name": "Fragile Overhang",
            "terrain": "Mare",
            "uncertainty": 0.20,
            "detection": {"opticalEvidence": 0.99, "radarEvidence": 0.99},
            "roof": {"skylightDepthM": 40.0}
        }
        sc_unstable = {
            "fs_range": (0.6, 1.2),
            "assumed_roof_thickness_range_m": (2.0, 5.0)
        }
        res_u = MCDARankingEngine.evaluate_candidate(site_unstable, sc_unstable)
        assert res_u["passed_gates"] is False
        assert "Gate 3 Failure" in res_u["disqualification_reason"]
        assert res_u["ranking_status"] == "ELIMINATED_BY_GATE"

    def test_multi_profile_ranking(self):
        site_valid = {
            "id": "CAN-MARIUS",
            "name": "Marius Hills Pit",
            "terrain": "Mare",
            "uncertainty": 0.25,
            "detection": {
                "opticalEvidence": 0.88,
                "radarEvidence": 0.82,
                "gravityEvidence": 0.65
            },
            "roof": {
                "skylightDetected": True,
                "skylightConfidence": 0.90,
                "skylightDepthM": 45.0,
                "roofThicknessM": 15.0
            }
        }
        sc_stable = {
            "fs_range": (1.4, 2.6),
            "median_factor_of_safety": 1.9,
            "assumed_roof_thickness_range_m": (10.0, 25.0)
        }

        # Evaluate across all 3 profiles
        p_sci = MCDARankingEngine.evaluate_candidate(
            site_valid, sc_stable, DecisionProfile.SCIENTIFIC_INVESTIGATION
        )
        p_speleo = MCDARankingEngine.evaluate_candidate(
            site_valid, sc_stable, DecisionProfile.SPELEOLOGICAL_EXPLORATION
        )
        p_robot = MCDARankingEngine.evaluate_candidate(
            site_valid, sc_stable, DecisionProfile.ROBOTIC_INGRESS
        )

        assert p_sci["passed_gates"] is True
        assert p_speleo["passed_gates"] is True
        assert p_robot["passed_gates"] is True

        # Each profile computes a positive score
        assert 40.0 <= p_sci["research_priority_score"] <= 100.0
        assert 40.0 <= p_speleo["research_priority_score"] <= 100.0
        assert 40.0 <= p_robot["research_priority_score"] <= 100.0

        low, high = p_sci["credible_interval_95"]
        assert low < p_sci["research_priority_score"] < high

    def test_rank_candidates_ordering(self):
        sites = [
            {
                "id": "CAN-POOR",
                "name": "Highland Failure",
                "terrain": "Highland",
                "uncertainty": 0.3,
                "detection": {"opticalEvidence": 0.2},
                "roof": {}
            },
            {
                "id": "CAN-TOP",
                "name": "Top Mare Candidate",
                "terrain": "Mare",
                "uncertainty": 0.2,
                "detection": {"opticalEvidence": 0.9, "radarEvidence": 0.85},
                "roof": {"skylightDepthM": 40.0}
            }
        ]
        scenario_map = {
            "CAN-TOP": {"fs_range": (1.5, 2.8), "assumed_roof_thickness_range_m": (12.0, 25.0)},
            "CAN-POOR": {"fs_range": (1.2, 2.0), "assumed_roof_thickness_range_m": (10.0, 20.0)}
        }
        ranked = MCDARankingEngine.rank_candidates(sites, scenario_map)
        assert len(ranked) == 2
        assert ranked[0]["id"] == "CAN-TOP"
        assert ranked[0]["rank"] == 1
        assert ranked[1]["id"] == "CAN-POOR"
        assert ranked[1]["rank"] is None
        assert ranked[1]["passed_gates"] is False
