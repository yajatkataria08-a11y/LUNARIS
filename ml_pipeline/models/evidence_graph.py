"""
LunaSafe-AI Evidence Ledger & Dependency Graph (Module M12)
Conforming to Combined Research & Implementation Pipeline v4.0 (Section 12, 12.1-12.5)

Features:
- Directed evidence relationship graph (shares_source, correlated_terrain, contradictory, independent)
- Non-independent evidence weight deflation:
  Prevents double-counting when multiple indicators (rille proximity, collapse-chain alignment,
  DEM sag, volcanic unit) originate from the same underlying terrain structure.
- Explicit contradiction detection between sensors.
- Standard EvidenceRecord serialization.
"""

from typing import Dict, Any, List, Optional, Set, Tuple
from dataclasses import dataclass, field
from enum import Enum
import numpy as np

from ml_pipeline.core.taxonomy import (
    ImplementationStatus,
    OriginCategory,
    QualityState,
    EvidenceDirection,
    EvidenceRecord
)


class DependencyType(str, Enum):
    SHARES_RAW_SOURCE = "SHARES_RAW_SOURCE"                 # e.g. pit diameter and shadow depth both from OHRC
    DERIVED_FROM_SAME_SOURCE = "DERIVED_FROM_SAME_SOURCE"   # derivative products from same raw stream
    CORRELATED_TERRAIN = "CORRELATED_TERRAIN"               # e.g. rille proximity, DEM sag, collapse chain from same volcanic flow
    CONTRADICTORY = "CONTRADICTORY"                         # e.g. optical void cue vs DEM flat solid floor
    INDEPENDENT = "INDEPENDENT"                             # e.g. GRAIL gravimetry vs OHRC optical


@dataclass
class EvidenceNode:
    evidence_id: str
    candidate_id: str
    modality: str                       # optical, dem, radar, thermal, gravity, geology
    feature_name: str
    value: Optional[float]              # None if observation is missing/unavailable
    quality_state: QualityState
    status: ImplementationStatus
    origin_category: OriginCategory
    source_id: str
    nominal_weight: float = 1.0


class EvidenceDependencyGraph:
    """
    Dependency graph managing evidence lineage and anti-double-counting deflation.
    """
    def __init__(self):
        self.nodes: Dict[str, EvidenceNode] = {}
        # adjacency list: evidence_id -> list of (target_evidence_id, DependencyType, correlation_coef)
        self.edges: Dict[str, List[Tuple[str, DependencyType, float]]] = {}

    def add_evidence(self, node: EvidenceNode) -> None:
        self.nodes[node.evidence_id] = node
        if node.evidence_id not in self.edges:
            self.edges[node.evidence_id] = []

    def add_dependency(
        self,
        source_id: str,
        target_id: str,
        dep_type: DependencyType,
        correlation: float = 0.5
    ) -> None:
        """Adds a directed dependency edge with correlation strength in [0, 1]."""
        if source_id not in self.edges:
            self.edges[source_id] = []
        if target_id not in self.edges:
            self.edges[target_id] = []
        self.edges[source_id].append((target_id, dep_type, correlation))
        # Dependencies are symmetric for correlation
        self.edges[target_id].append((source_id, dep_type, correlation))

    def get_candidate_nodes(self, candidate_id: str) -> List[EvidenceNode]:
        return [n for n in self.nodes.values() if n.candidate_id == candidate_id]

    def compute_deflated_weights(self, candidate_id: str) -> Dict[str, float]:
        """
        Computes dependency-deflated weights to eliminate double-counting of correlated signals.
        If node i is strongly correlated with node j (e.g. rho = 0.75 for rille + DEM sag),
        their marginal contributions are deflated by:
        w_i_eff = w_i / (1.0 + sum_{j != i} rho_{ij} * w_j)
        """
        nodes = self.get_candidate_nodes(candidate_id)
        if not nodes:
            return {}

        weights = {n.evidence_id: n.nominal_weight for n in nodes}
        deflated = {}

        for n in nodes:
            eid = n.evidence_id
            if n.value is None or n.quality_state == QualityState.REJECTED:
                deflated[eid] = 0.0
                continue

            correlation_sum = 0.0
            neighbors = self.edges.get(eid, [])
            for target_id, dep_type, rho in neighbors:
                if target_id in weights and dep_type in {
                    DependencyType.CORRELATED_TERRAIN,
                    DependencyType.SHARES_RAW_SOURCE,
                    DependencyType.DERIVED_FROM_SAME_SOURCE
                }:
                    correlation_sum += rho * weights[target_id]

            # Deflation formula
            deflated[eid] = weights[eid] / (1.0 + correlation_sum)

        # Normalize so active deflated weights sum to 1.0
        total = sum(deflated.values())
        if total > 1e-6:
            deflated = {k: v / total for k, v in deflated.items()}
        return deflated

    def detect_contradictions(self, candidate_id: str) -> List[Dict[str, Any]]:
        """
        Identifies conflicting evidence streams.
        E.g. High optical void score (>0.75) alongside low DEM depth or flat slope (<0.20).
        """
        nodes = self.get_candidate_nodes(candidate_id)
        node_map = {n.evidence_id: n for n in nodes}
        contradictions = []

        checked_pairs: Set[Tuple[str, str]] = set()

        for eid, edges in self.edges.items():
            if eid not in node_map:
                continue
            for target_id, dep_type, _ in edges:
                if target_id not in node_map:
                    continue
                pair = tuple(sorted([eid, target_id]))
                if pair in checked_pairs:
                    continue
                checked_pairs.add(pair)

                n1 = node_map[eid]
                n2 = node_map[target_id]

                if dep_type == DependencyType.CONTRADICTORY:
                    contradictions.append({
                        "node_a": n1.evidence_id,
                        "modality_a": n1.modality,
                        "value_a": n1.value,
                        "node_b": n2.evidence_id,
                        "modality_b": n2.modality,
                        "value_b": n2.value,
                        "severity": "CRITICAL",
                        "description": f"Direct sensor contradiction between {n1.modality} and {n2.modality}."
                    })
                elif n1.value is not None and n2.value is not None:
                    # Check for large divergence between optical and topographic depth cues
                    if abs(n1.value - n2.value) > 0.50 and n1.modality != n2.modality:
                        contradictions.append({
                            "node_a": n1.evidence_id,
                            "modality_a": n1.modality,
                            "value_a": n1.value,
                            "node_b": n2.evidence_id,
                            "modality_b": n2.modality,
                            "value_b": n2.value,
                            "severity": "WARNING",
                            "description": f"High inter-sensor divergence ({round(abs(n1.value - n2.value), 2)}) between {n1.modality} and {n2.modality}."
                        })

        return contradictions
