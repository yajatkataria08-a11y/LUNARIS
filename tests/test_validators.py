"""
Unit Tests for Pydantic Validation Engine
Conforming to Combined Research & Implementation Pipeline v5.0 (Core Spec Section 3 & docs/pipeline_engineering.md)

Verifies:
1. Candidate dossier schema validation on real candidate records.
2. Two-Claim boundary enforcement (rejects unscientific operational claims).
3. Value bounds on evidence observations [0.0, 1.0].
4. Strict taxonomic enum validation on Status, Origin, and Quality.
"""

import json
import pytest
from pydantic import ValidationError

from ml_pipeline.core.validators import (
    EvidenceItemSchema,
    CandidateDossierSchema,
    validate_candidate_dossier,
    validate_evidence_item
)


class TestPydanticValidators:
    def test_valid_evidence_item(self):
        item = validate_evidence_item({
            "evidence_id": "EV-TEST-01",
            "modality": "optical",
            "feature_name": "pit_shadow_collar",
            "observed_value": 0.85,
            "status": "IMPLEMENTED",
            "origin_category": "REAL",
            "quality_state": "ACCEPTED",
            "source_id": "LROC_NAC_M126710873R",
            "nominal_weight": 1.0
        })
        assert item.evidence_id == "EV-TEST-01"
        assert item.observed_value == 0.85
        assert item.origin_category == "REAL"

    def test_out_of_bounds_observed_value_rejected(self):
        with pytest.raises(ValidationError) as exc_info:
            validate_evidence_item({
                "evidence_id": "EV-TEST-FAIL",
                "modality": "optical",
                "feature_name": "pit_shadow_collar",
                "observed_value": 1.45,  # Invalid: > 1.0
                "status": "IMPLEMENTED",
                "origin_category": "REAL",
                "quality_state": "ACCEPTED",
                "source_id": "SRC_01"
            })
        assert "Normalized observed evidence must be in [0.0, 1.0]" in str(exc_info.value)

    def test_invalid_taxonomy_status_rejected(self):
        with pytest.raises(ValidationError):
            validate_evidence_item({
                "evidence_id": "EV-TEST-FAIL",
                "modality": "optical",
                "feature_name": "pit_shadow_collar",
                "observed_value": 0.5,
                "status": "UNOFFICIAL_STATUS",  # Invalid enum value
                "origin_category": "REAL",
                "quality_state": "ACCEPTED",
                "source_id": "SRC_01"
            })

    def test_two_claim_boundary_validation(self):
        valid_dossier = {
            "candidate_id": "LLT-002",
            "region_name": "Mare Tranquillitatis",
            "coordinates": {"lat": 8.335, "lon": 33.222},
            "claim_type": "CLAIM_1_OBSERVABLE_PIT",
            "detection_summary": {"collar_diameter_m": 98.4},
            "evidence_ledger": [
                {
                    "evidence_id": "EV-1",
                    "modality": "optical",
                    "feature_name": "collar",
                    "observed_value": 0.9,
                    "status": "IMPLEMENTED",
                    "origin_category": "REAL",
                    "quality_state": "ACCEPTED",
                    "source_id": "OHRC"
                }
            ],
            "active_contradictions": [],
            "missing_modalities": [],
            "abstain": False,
            "abstain_reason": None,
            "status": "VALIDATED_OBSERVABLE_PIT_CANDIDATE",
            "scientific_disclaimer": "Validated against Robinson 2012."
        }
        dossier = validate_candidate_dossier(valid_dossier)
        assert dossier.candidate_id == "LLT-002"
        assert dossier.claim_type == "CLAIM_1_OBSERVABLE_PIT"

        # Attempt to inject unscientific claim type -> Must be rejected
        invalid_dossier = dict(valid_dossier)
        invalid_dossier["claim_type"] = "CLAIM_3_CERTIFIED_SAFE_FOR_HUMANS"
        with pytest.raises(ValidationError):
            validate_candidate_dossier(invalid_dossier)
