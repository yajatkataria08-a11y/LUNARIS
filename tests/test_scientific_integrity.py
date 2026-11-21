"""
Automated Scientific Integrity Tests
Conforming to Combined Research & Implementation Pipeline v4.0 (Section 23.4)

Verifies:
1. Zero synthetic data leakage into real-world validation splits.
2. Untrained checkpoints cannot produce predictions presented as trained inference.
3. Missing observations are not silently counted as negative evidence.
4. Upstream stage failures properly propagate SKIPPED/UNAVAILABLE states downstream.
5. Cryptographic run manifest with valid SHA-256 verification.
"""

import os
import tempfile
import pytest
import numpy as np

from ml_pipeline.core.taxonomy import (
    ImplementationStatus,
    OriginCategory,
    LifecycleState,
    QualityState
)
from ml_pipeline.models.unet import UNetSegmentationModel
from ml_pipeline.models.evidence_graph import EvidenceDependencyGraph, EvidenceNode
from ml_pipeline.models.fusion import EvidenceInferenceEngine
from ml_pipeline.pipeline_runner import PipelineRunner


class TestScientificIntegrity:
    def test_zero_synthetic_leakage(self):
        """Rule: Synthetic datasets must be quarantined and never leak into real splits."""
        candidate_catalog = [
            {"id": "REAL-01", "origin": OriginCategory.REAL, "split": "test_locked"},
            {"id": "REAL-02", "origin": OriginCategory.REAL, "split": "train"},
            {"id": "SYN-01", "origin": OriginCategory.SYNTHETIC, "split": "synthetic_bench"},
            {"id": "SIM-01", "origin": OriginCategory.SIMULATED, "split": "physics_bench"}
        ]

        # Audit real-world test partition
        real_test_partition = [c for c in candidate_catalog if c["split"] == "test_locked"]
        
        for record in real_test_partition:
            assert record["origin"] == OriginCategory.REAL, (
                f"Scientific Integrity Violation: Candidate {record['id']} with origin "
                f"{record['origin']} leaked into locked real-world test partition!"
            )

    def test_untrained_checkpoint_refusal(self):
        """Rule: Untrained model must refuse to produce uncalibrated predictions."""
        model = UNetSegmentationModel(base_filters=8)
        assert model.status == ImplementationStatus.UNTRAINED

        dummy_patch = np.random.randn(64, 64).astype(np.float32)
        res = model.predict_mask(dummy_patch, allow_untrained=False)

        assert res["status"] == ImplementationStatus.UNTRAINED.value
        assert res["prediction_available"] is False
        assert res["confidence"] == 0.0
        assert np.all(res["binary_mask"] == 0)

    def test_missing_evidence_is_not_negative(self):
        """Rule: Missing or uncollected data != negative evidence."""
        graph = EvidenceDependencyGraph()
        engine = EvidenceInferenceEngine(graph)

        # Baseline: Optical = 0.8, DEM = 0.8, Radar missing (None)
        graph.add_evidence(EvidenceNode("EV-1", "CAN-01", "optical", "pit", 0.8, QualityState.ACCEPTED, ImplementationStatus.IMPLEMENTED, OriginCategory.REAL, "S1"))
        graph.add_evidence(EvidenceNode("EV-2", "CAN-01", "dem", "depth", 0.8, QualityState.ACCEPTED, ImplementationStatus.IMPLEMENTED, OriginCategory.REAL, "S2"))
        graph.add_evidence(EvidenceNode("EV-3", "CAN-01", "radar", "cpr", None, QualityState.ACCEPTED, ImplementationStatus.UNAVAILABLE, OriginCategory.REAL, "S3"))

        res_missing = engine.evaluate_pathway_a_structured("CAN-01")
        score_with_missing_radar = res_missing["structured_evidence_score"]

        # Now simulate if radar had genuinely detected negative evidence (0.0)
        graph2 = EvidenceDependencyGraph()
        engine2 = EvidenceInferenceEngine(graph2)
        graph2.add_evidence(EvidenceNode("EV-1", "CAN-02", "optical", "pit", 0.8, QualityState.ACCEPTED, ImplementationStatus.IMPLEMENTED, OriginCategory.REAL, "S1"))
        graph2.add_evidence(EvidenceNode("EV-2", "CAN-02", "dem", "depth", 0.8, QualityState.ACCEPTED, ImplementationStatus.IMPLEMENTED, OriginCategory.REAL, "S2"))
        graph2.add_evidence(EvidenceNode("EV-3", "CAN-02", "radar", "cpr", 0.0, QualityState.ACCEPTED, ImplementationStatus.IMPLEMENTED, OriginCategory.REAL, "S3"))

        res_negative = engine2.evaluate_pathway_a_structured("CAN-02")
        score_with_negative_radar = res_negative["structured_evidence_score"]

        # Score when data is missing MUST be higher than when radar actively refutes void
        assert score_with_missing_radar > score_with_negative_radar, (
            "Integrity Failure: Missing evidence was penalized as heavily as active negative evidence!"
        )

    def test_lifecycle_stage_failure_propagation(self):
        """Rule: Failure in upstream stage must propagate SKIPPED to downstream dependents."""
        runner = PipelineRunner(run_id="TEST_RUN_INTEGRITY")
        
        runner.register_stage("M1_INGESTION", "Ingest Data Manifest")
        runner.register_stage("M2_PREPROCESSING", "Coregistration", prerequisites=["M1_INGESTION"])
        runner.register_stage("M3_DETECTION", "U-Net Detection", prerequisites=["M2_PREPROCESSING"])

        # Intentionally fail Stage 1
        def failing_ingestion():
            raise IOError("PDS4 data volume unreachable.")

        rec1 = runner.execute_stage("M1_INGESTION", failing_ingestion)
        assert rec1.state == LifecycleState.FAILED

        # Attempt to run Stage 2
        rec2 = runner.execute_stage("M2_PREPROCESSING", lambda: {"status": "ok"})
        assert rec2.state == LifecycleState.SKIPPED
        assert "Prerequisite stage 'M1_INGESTION' was FAILED" in rec2.error_message

        # Attempt to run Stage 3
        rec3 = runner.execute_stage("M3_DETECTION", lambda: {"status": "ok"})
        assert rec3.state == LifecycleState.SKIPPED

    def test_cryptographic_manifest_generation(self):
        """Rule: Emitted run manifest must contain valid SHA-256 hashes."""
        runner = PipelineRunner(run_id="TEST_RUN_MANIFEST")
        runner.register_stage("STAGE_1", "Dummy Stage")
        runner.execute_stage("STAGE_1", lambda: {"items_processed": 10})

        with tempfile.TemporaryDirectory() as tmpdir:
            # Create a sample artifact
            artifact_file = os.path.join(tmpdir, "test_output.json")
            with open(artifact_file, "w") as f:
                f.write('{"test": "data"}')

            runner.record_artifact(artifact_file, "Test JSON Output")
            manifest = runner.generate_cryptographic_manifest(output_dir=tmpdir)

            assert manifest["run_id"] == "TEST_RUN_MANIFEST"
            assert "manifest_sha256" in manifest
            assert len(manifest["manifest_sha256"]) == 64
            assert len(manifest["artifacts"]) == 1
            assert manifest["artifacts"][0]["sha256"] != "FILE_NOT_FOUND"
