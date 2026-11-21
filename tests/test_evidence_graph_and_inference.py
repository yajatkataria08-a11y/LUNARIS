"""
Unit Tests for Phase 3:
- Evidence Dependency Graph & Non-Independent Weight Deflation (Module M12)
- Sensor Contradiction Detection
- Pathway A: Structured Evidence Assessment with Missing Data & Scientific Abstention (Module M5)
- Pathway B: Bayesian Copula Joint Likelihoods & Prior Sensitivity Sweep (Module M5b)
"""

import pytest
import numpy as np

from ml_pipeline.core.taxonomy import (
    ImplementationStatus,
    OriginCategory,
    QualityState
)
from ml_pipeline.models.evidence_graph import (
    EvidenceDependencyGraph,
    EvidenceNode,
    DependencyType
)
from ml_pipeline.models.fusion import EvidenceInferenceEngine


class TestEvidenceDependencyGraph:
    def test_weight_deflation_correlated_terrain(self):
        graph = EvidenceDependencyGraph()

        # Add 3 nodes: Optical (independent), DEM sag (correlated), Rille proximity (correlated)
        n_opt = EvidenceNode(
            evidence_id="EV-OPT",
            candidate_id="CAN-01",
            modality="optical",
            feature_name="pit_shadow_collar",
            value=0.85,
            quality_state=QualityState.ACCEPTED,
            status=ImplementationStatus.IMPLEMENTED,
            origin_category=OriginCategory.REAL,
            source_id="OHRC_01",
            nominal_weight=1.0
        )
        n_dem = EvidenceNode(
            evidence_id="EV-DEM",
            candidate_id="CAN-01",
            modality="dem",
            feature_name="dem_surface_sag",
            value=0.70,
            quality_state=QualityState.ACCEPTED,
            status=ImplementationStatus.IMPLEMENTED,
            origin_category=OriginCategory.REAL,
            source_id="TMC2_01",
            nominal_weight=1.0
        )
        n_rille = EvidenceNode(
            evidence_id="EV-RILLE",
            candidate_id="CAN-01",
            modality="geology",
            feature_name="sinuous_rille_axis",
            value=0.75,
            quality_state=QualityState.ACCEPTED,
            status=ImplementationStatus.IMPLEMENTED,
            origin_category=OriginCategory.REAL,
            source_id="LROC_WAC",
            nominal_weight=1.0
        )
        graph.add_evidence(n_opt)
        graph.add_evidence(n_dem)
        graph.add_evidence(n_rille)

        # Mark DEM sag and Rille axis as heavily correlated terrain signals (rho = 0.80)
        graph.add_dependency("EV-DEM", "EV-RILLE", DependencyType.CORRELATED_TERRAIN, correlation=0.80)

        deflated = graph.compute_deflated_weights("CAN-01")
        
        # Correlated nodes must have lower relative weights than the independent optical node
        assert deflated["EV-OPT"] > deflated["EV-DEM"]
        assert deflated["EV-OPT"] > deflated["EV-RILLE"]
        assert pytest.approx(sum(deflated.values()), abs=1e-5) == 1.0

    def test_contradiction_detection(self):
        graph = EvidenceDependencyGraph()
        n1 = EvidenceNode("EV-1", "CAN-02", "optical", "pit_shadow", 0.90, QualityState.ACCEPTED, ImplementationStatus.IMPLEMENTED, OriginCategory.REAL, "OHRC_01")
        n2 = EvidenceNode("EV-2", "CAN-02", "dem", "elevation_profile", 0.10, QualityState.ACCEPTED, ImplementationStatus.IMPLEMENTED, OriginCategory.REAL, "TMC2_01")
        graph.add_evidence(n1)
        graph.add_evidence(n2)
        graph.add_dependency("EV-1", "EV-2", DependencyType.CONTRADICTORY, correlation=1.0)

        conflicts = graph.detect_contradictions("CAN-02")
        assert len(conflicts) >= 1
        assert conflicts[0]["severity"] == "CRITICAL"


class TestEvidenceInferenceEngine:
    def test_pathway_a_missing_data_and_abstention(self):
        graph = EvidenceDependencyGraph()
        engine = EvidenceInferenceEngine(graph)

        # Scenario 1: No nodes at all -> Abstain
        res_empty = engine.evaluate_pathway_a_structured("CAN-NONE")
        assert res_empty["abstain"] is True
        assert "No evidence records" in res_empty["abstain_reason"]

        # Scenario 2: Only regional gravity available (no optical, no DEM) -> Abstain per Section 20
        n_grav = EvidenceNode("EV-G", "CAN-GRAV", "gravity", "grail_bouguer", 0.65, QualityState.ACCEPTED, ImplementationStatus.IMPLEMENTED, OriginCategory.REAL, "GRAIL")
        graph.add_evidence(n_grav)
        res_no_vision = engine.evaluate_pathway_a_structured("CAN-GRAV")
        assert res_no_vision["abstain"] is True
        assert "Lacks primary visual" in res_no_vision["abstain_reason"]

        # Scenario 3: Valid optical + DEM with missing radar -> NOT abstained, missing handled explicitly
        n_opt = EvidenceNode("EV-O", "CAN-VALID", "optical", "shadow", 0.80, QualityState.ACCEPTED, ImplementationStatus.IMPLEMENTED, OriginCategory.REAL, "OHRC")
        n_dem = EvidenceNode("EV-D", "CAN-VALID", "dem", "depth", 0.75, QualityState.ACCEPTED, ImplementationStatus.IMPLEMENTED, OriginCategory.REAL, "TMC2")
        n_rad_missing = EvidenceNode("EV-R", "CAN-VALID", "radar", "cpr", None, QualityState.ACCEPTED, ImplementationStatus.UNAVAILABLE, OriginCategory.REAL, "DFSAR")
        graph.add_evidence(n_opt)
        graph.add_evidence(n_dem)
        graph.add_evidence(n_rad_missing)

        res_valid = engine.evaluate_pathway_a_structured("CAN-VALID")
        assert res_valid["abstain"] is False
        assert res_valid["available_evidence_count"] == 2
        assert res_valid["missing_evidence_count"] == 1
        assert 0.0 <= res_valid["structured_evidence_score"] <= 1.0

    def test_pathway_b_copula_prior_sensitivity(self):
        graph = EvidenceDependencyGraph()
        engine = EvidenceInferenceEngine(graph)

        # 3 modalities available: Optical, DEM, Radar
        n1 = EvidenceNode("EV-O", "CAN-MARIUS", "optical", "collar", 0.85, QualityState.ACCEPTED, ImplementationStatus.IMPLEMENTED, OriginCategory.REAL, "OHRC")
        n2 = EvidenceNode("EV-D", "CAN-MARIUS", "dem", "sag", 0.70, QualityState.ACCEPTED, ImplementationStatus.IMPLEMENTED, OriginCategory.REAL, "TMC2")
        n3 = EvidenceNode("EV-R", "CAN-MARIUS", "radar", "backscatter", 0.75, QualityState.ACCEPTED, ImplementationStatus.IMPLEMENTED, OriginCategory.REAL, "DFSAR")
        graph.add_evidence(n1)
        graph.add_evidence(n2)
        graph.add_evidence(n3)
        graph.add_dependency("EV-O", "EV-D", DependencyType.CORRELATED_TERRAIN, correlation=0.35)

        res_copula = engine.evaluate_pathway_b_copula("CAN-MARIUS")
        assert res_copula["abstain"] is False
        assert "posterior_probabilities" in res_copula
        
        posteriors = res_copula["posterior_probabilities"]
        # Posterior must monotonically increase with the prior
        p_01 = posteriors["0.01"]
        p_05 = posteriors["0.05"]
        p_20 = posteriors["0.2"]
        assert p_01 < p_05 < p_20
        assert "Sensitivity demonstrates heavy dependence" in res_copula["sensitivity_note"]
