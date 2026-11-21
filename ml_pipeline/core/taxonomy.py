"""
LunaSafe-AI Pipeline Status Taxonomy & Provenance Governance
Conforming to Combined Research & Implementation Pipeline v4.0 (Section 0.1, 4.6, 12.5, 23.1)
"""

from enum import Enum
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
import datetime
import hashlib
import json

class ImplementationStatus(str, Enum):
    """Implementation-status taxonomy per v4.0 Section 0.1"""
    IMPLEMENTED = "IMPLEMENTED"       # Code exists and has been tested for stated function
    EXPERIMENTAL = "EXPERIMENTAL"     # Implemented, but not adequately validated against independent evidence
    SIMULATED = "SIMULATED"           # Based on synthetic data or simulation; not direct observation
    HEURISTIC = "HEURISTIC"           # Rule-based or proxy score; never presented as posterior probability
    PLANNED = "PLANNED"               # Design requirement not yet implemented
    UNAVAILABLE = "UNAVAILABLE"       # Required input, capability, or service unavailable during run
    UNTRAINED = "UNTRAINED"           # Model has no valid trained checkpoint for requested inference

class OriginCategory(str, Enum):
    """Data origin categories per v4.0 Section 4.6"""
    REAL = "REAL"                     # Sourced observational data with verified provenance
    SYNTHETIC = "SYNTHETIC"           # Artificially generated; quarantined from real-world evaluation
    AUGMENTED = "AUGMENTED"           # Transformed from parent data; restricted to training only
    SIMULATED = "SIMULATED"           # Model or physics simulation output; not an observation
    UNKNOWN = "UNKNOWN"               # Unverified provenance; restricted or rejected

class LifecycleState(str, Enum):
    """Pipeline stage lifecycle states per v4.0 Section 23.1"""
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"
    UNAVAILABLE = "UNAVAILABLE"

class QualityState(str, Enum):
    """Data quality states per v4.0 Section 6.3"""
    ACCEPTED = "ACCEPTED"
    ACCEPTED_WITH_LIMITATION = "ACCEPTED_WITH_LIMITATION"
    RESTRICTED = "RESTRICTED"
    REJECTED = "REJECTED"

class EvidenceDirection(str, Enum):
    SUPPORTS = "SUPPORTS"
    WEAKENS = "WEAKENS"
    NEUTRAL = "NEUTRAL"
    CONTRADICTORY = "CONTRADICTORY"

@dataclass
class EvidenceRecord:
    """Standardized evidence object schema per v4.0 Section 12.5"""
    evidence_id: str
    candidate_id: str
    feature_type: str
    observed_or_derived_value: Any
    status: ImplementationStatus
    origin_category: OriginCategory
    source_ids: List[str]
    method_version: str
    quality_state: QualityState
    uncertainty: Optional[Dict[str, Any]] = None
    calibration_status: str = "unassessed"
    dependencies: List[str] = field(default_factory=list)
    direction: EvidenceDirection = EvidenceDirection.NEUTRAL
    provenance: Dict[str, Any] = field(default_factory=lambda: {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "source_files": [],
        "checksums": []
    })

    def to_dict(self) -> Dict[str, Any]:
        return {
            "evidence_id": self.evidence_id,
            "candidate_id": self.candidate_id,
            "feature_type": self.feature_type,
            "observed_or_derived_value": self.observed_or_derived_value,
            "status": self.status.value,
            "origin_category": self.origin_category.value,
            "source_ids": self.source_ids,
            "method_version": self.method_version,
            "quality_state": self.quality_state.value,
            "uncertainty": self.uncertainty,
            "calibration_status": self.calibration_status,
            "dependencies": self.dependencies,
            "direction": self.direction.value,
            "provenance": self.provenance
        }
