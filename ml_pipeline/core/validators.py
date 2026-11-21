"""
LunaSafe-AI Pydantic Validation Engine
Conforming to Combined Research & Implementation Pipeline v5.0 (Core Spec Section 3 & docs/pipeline_engineering.md)

Enforces:
- Automated schema validation for evidence records and candidate dossiers.
- Formal taxonomic bounds on Status, Origin, and Quality.
- Strict Two-Claim separation (Observable Pit Detection vs Unobservable Subsurface Void).
"""

from typing import Dict, Any, List, Optional, Literal
from pydantic import BaseModel, Field, field_validator


class EvidenceItemSchema(BaseModel):
    """Schema for individual evidence items entering the Evidence Ledger."""
    evidence_id: str
    modality: Literal["optical", "dem", "radar", "thermal", "gravity", "geology"]
    feature_name: str
    observed_value: Optional[float] = None
    status: Literal[
        "IMPLEMENTED", "EXPERIMENTAL", "SIMULATED",
        "HEURISTIC", "PLANNED", "UNAVAILABLE", "UNTRAINED"
    ]
    origin_category: Literal[
        "REAL", "SYNTHETIC", "AUGMENTED/ANALOG", "SIMULATED", "UNKNOWN"
    ]
    quality_state: Literal[
        "ACCEPTED", "ACCEPTED_WITH_LIMITATION", "RESTRICTED", "REJECTED"
    ]
    source_id: str
    nominal_weight: float = Field(default=1.0, ge=0.0, le=10.0)

    @field_validator("observed_value")
    @classmethod
    def check_observed_value(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and (v < 0.0 or v > 1.0):
            raise ValueError(f"Normalized observed evidence must be in [0.0, 1.0], got {v}")
        return v


class CandidateDossierSchema(BaseModel):
    """
    Standardized Candidate Dossier Schema (v5.0 Core Spec).
    Separates Claim 1 (Observable Pit) from Claim 2 (Unobservable Subsurface Void).
    """
    candidate_id: str
    region_name: str
    coordinates: Dict[str, float]  # lat, lon
    claim_type: Literal["CLAIM_1_OBSERVABLE_PIT", "CLAIM_2_UNOBSERVABLE_VOID"]
    detection_summary: Dict[str, Any]
    evidence_ledger: List[EvidenceItemSchema]
    active_contradictions: List[Dict[str, Any]] = Field(default_factory=list)
    missing_modalities: List[str] = Field(default_factory=list)
    abstain: bool = False
    abstain_reason: Optional[str] = None
    status: str
    scientific_disclaimer: str

    @field_validator("claim_type")
    @classmethod
    def check_claim_boundaries(cls, v: str) -> str:
        if v not in {"CLAIM_1_OBSERVABLE_PIT", "CLAIM_2_UNOBSERVABLE_VOID"}:
            raise ValueError(f"Invalid claim type '{v}'. Must be CLAIM_1_OBSERVABLE_PIT or CLAIM_2_UNOBSERVABLE_VOID.")
        return v


def validate_candidate_dossier(data: Dict[str, Any]) -> CandidateDossierSchema:
    """Validates a candidate dossier dictionary against CandidateDossierSchema."""
    return CandidateDossierSchema(**data)


def validate_evidence_item(data: Dict[str, Any]) -> EvidenceItemSchema:
    """Validates an evidence item against EvidenceItemSchema."""
    return EvidenceItemSchema(**data)
