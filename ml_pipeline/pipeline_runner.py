"""
LunaSafe-AI Pipeline Orchestrator & Cryptographic Manifest Generator (Module M8)
Conforming to Combined Research & Implementation Pipeline v4.0 (Sections 23.1, 23.2)

Features:
- Formal stage lifecycle state management:
  PENDING -> RUNNING -> SUCCESS | FAILED | SKIPPED | UNAVAILABLE
- Strict failure propagation (no silent fallback to fabricated data)
- Immutable Cryptographic Run Manifest with SHA-256 checksums
"""

import os
import sys
import json
import hashlib
import datetime
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field

from ml_pipeline.core.taxonomy import (
    LifecycleState,
    ImplementationStatus,
    OriginCategory
)


@dataclass
class StageRecord:
    stage_id: str
    name: str
    state: LifecycleState = LifecycleState.PENDING
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    duration_s: float = 0.0
    output_summary: Dict[str, Any] = field(default_factory=dict)
    error_message: Optional[str] = None
    prerequisites: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "stage_id": self.stage_id,
            "name": self.name,
            "state": self.state.value,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "duration_s": round(self.duration_s, 3),
            "output_summary": self.output_summary,
            "error_message": self.error_message,
            "prerequisites": self.prerequisites
        }


class PipelineRunner:
    """
    Decoupled Pipeline Orchestrator enforcing v4.0 lifecycle governance.
    """

    def __init__(self, run_id: Optional[str] = None, random_seed: int = 42):
        self.run_id = run_id or f"RUN_{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d_%H%M%S')}"
        self.random_seed = random_seed
        self.stages: Dict[str, StageRecord] = {}
        self.stage_order: List[str] = []
        self.artifacts: List[Dict[str, str]] = []
        self.warnings: List[str] = []

    def register_stage(
        self,
        stage_id: str,
        name: str,
        prerequisites: Optional[List[str]] = None
    ) -> None:
        """Registers a pipeline stage with explicit prerequisite tracking."""
        record = StageRecord(
            stage_id=stage_id,
            name=name,
            prerequisites=prerequisites or []
        )
        self.stages[stage_id] = record
        if stage_id not in self.stage_order:
            self.stage_order.append(stage_id)

    def execute_stage(
        self,
        stage_id: str,
        func: Callable[[], Dict[str, Any]]
    ) -> StageRecord:
        """
        Executes a registered stage with strict lifecycle state transitions and failure propagation.
        """
        if stage_id not in self.stages:
            raise KeyError(f"Stage '{stage_id}' is not registered.")

        rec = self.stages[stage_id]

        # Check prerequisite states
        for prereq_id in rec.prerequisites:
            prereq = self.stages.get(prereq_id)
            if not prereq or prereq.state != LifecycleState.SUCCESS:
                rec.state = LifecycleState.SKIPPED
                rec.error_message = f"Prerequisite stage '{prereq_id}' was {prereq.state.value if prereq else 'UNREGISTERED'}."
                return rec

        # Execute stage
        rec.state = LifecycleState.RUNNING
        rec.started_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        t0 = datetime.datetime.now(datetime.timezone.utc)

        try:
            output = func()
            rec.state = LifecycleState.SUCCESS
            rec.output_summary = output or {}
        except Exception as e:
            rec.state = LifecycleState.FAILED
            rec.error_message = str(e)
            self.warnings.append(f"Stage '{stage_id}' failed: {str(e)}")
        finally:
            t1 = datetime.datetime.now(datetime.timezone.utc)
            rec.completed_at = t1.isoformat()
            rec.duration_s = (t1 - t0).total_seconds()

        return rec

    def record_artifact(self, filepath: str, description: str) -> None:
        """Records an output artifact and calculates its SHA-256 checksum."""
        sha256 = "FILE_NOT_FOUND"
        if os.path.exists(filepath):
            h = hashlib.sha256()
            with open(filepath, "rb") as f:
                while chunk := f.read(65536):
                    h.update(chunk)
            sha256 = h.hexdigest()

        self.artifacts.append({
            "path": filepath,
            "description": description,
            "sha256": sha256
        })

    def generate_cryptographic_manifest(self, output_dir: str = "outputs/manifests") -> Dict[str, Any]:
        """
        Generates and saves immutable cryptographic run manifest per v4.0 Section 23.2.
        """
        os.makedirs(output_dir, exist_ok=True)
        manifest_path = os.path.join(output_dir, f"manifest_{self.run_id}.json")

        stages_dict = {s_id: self.stages[s_id].to_dict() for s_id in self.stage_order}
        
        # Manifest data
        manifest = {
            "run_id": self.run_id,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "pipeline_version": "v4.0-AUDITED",
            "random_seed": self.random_seed,
            "python_version": sys.version,
            "platform": sys.platform,
            "stages": stages_dict,
            "artifacts": self.artifacts,
            "warnings": self.warnings,
            "all_stages_successful": all(s.state == LifecycleState.SUCCESS for s in self.stages.values()),
            "status_disclaimer": "Cryptographic run manifest conforming to v4.0 Section 23.2."
        }

        # Calculate self-hash of manifest content
        manifest_str = json.dumps(manifest, sort_keys=True, indent=2)
        manifest_hash = hashlib.sha256(manifest_str.encode("utf-8")).hexdigest()
        manifest["manifest_sha256"] = manifest_hash

        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)

        return manifest
