"""
LunaSafe-AI Evidence Inference Engine (Modules M5 & M5b)
Conforming to Combined Research & Implementation Pipeline v4.0 (Sections 13, 14, 20)

Implements:
- Pathway A: Structured Evidence Assessment (Primary default, non-probabilistic)
- Pathway B: Bayesian Copula Inference (Joint likelihoods with explicit dependency covariance)
- Explicit missing-data distinction: Unavailable/Restricted != Negative Evidence
- Anti-Double-Counting via EvidenceDependencyGraph integration
- Scientific Stop, Pause, and Abstain Conditions (Section 20)
"""

from typing import Dict, Any, List, Optional, Tuple
import numpy as np

try:
    import scipy.stats
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False
    scipy = None

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


class EvidenceInferenceEngine:
    """
    Multimodal Evidence Inference Engine supporting Pathways A & B.
    """

    def __init__(self, graph: Optional[EvidenceDependencyGraph] = None):
        self.graph = graph or EvidenceDependencyGraph()

    def evaluate_pathway_a_structured(
        self,
        candidate_id: str,
        base_weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Pathway A — Structured Evidence Assessment (v4.0 Section 13.2)
        Does NOT output an unverified posterior probability.
        Integrates deflated weights from the Evidence Dependency Graph.
        """
        nodes = self.graph.get_candidate_nodes(candidate_id)
        if not nodes:
            return {
                "candidate_id": candidate_id,
                "pathway": "STRUCTURED_EVIDENCE",
                "status": ImplementationStatus.UNAVAILABLE.value,
                "abstain": True,
                "abstain_reason": "No evidence records found for candidate.",
                "structured_score": None,
                "uncertainty": 1.0
            }

        # Check missing vs available modalities
        available = [n for n in nodes if n.value is not None and n.quality_state != QualityState.REJECTED]
        missing = [n for n in nodes if n.value is None]
        rejected = [n for n in nodes if n.quality_state == QualityState.REJECTED]

        # Scientific Abstention Rule 1: Must have at least optical or high-res DEM
        has_primary_vision = any(n.modality in {"optical", "dem"} for n in available)
        if not has_primary_vision:
            return {
                "candidate_id": candidate_id,
                "pathway": "STRUCTURED_EVIDENCE",
                "status": ImplementationStatus.HEURISTIC.value,
                "abstain": True,
                "abstain_reason": "Lacks primary visual/topographic observation (both optical and DEM are missing or rejected).",
                "available_modalities": [n.modality for n in available],
                "missing_modalities": [n.modality for n in missing],
                "rejected_observations": [n.source_id for n in rejected],
                "structured_score": None,
                "uncertainty": 0.95
            }

        # Check for Critical Contradictions
        contradictions = self.graph.detect_contradictions(candidate_id)
        critical_conflicts = [c for c in contradictions if c["severity"] == "CRITICAL"]
        if critical_conflicts:
            return {
                "candidate_id": candidate_id,
                "pathway": "STRUCTURED_EVIDENCE",
                "status": ImplementationStatus.HEURISTIC.value,
                "abstain": True,
                "abstain_reason": f"Direct sensor contradiction detected: {critical_conflicts[0]['description']}",
                "contradictions": contradictions,
                "structured_score": None,
                "uncertainty": 0.90
            }

        # Compute deflated weights to avoid double-counting correlated terrain cues
        deflated_weights = self.graph.compute_deflated_weights(candidate_id)

        values = []
        eff_weights = []
        drivers = []

        for n in available:
            w = deflated_weights.get(n.evidence_id, 0.0)
            val = float(n.value)
            values.append(val)
            eff_weights.append(w)
            drivers.append({
                "evidence_id": n.evidence_id,
                "modality": n.modality,
                "feature": n.feature_name,
                "raw_value": round(val, 3),
                "deflated_weight": round(w, 3),
                "contribution": round(w * val * 100, 2),
                "quality_state": n.quality_state.value
            })

        # Weighted composite score
        composite_score = float(np.sum(np.array(values) * np.array(eff_weights)))
        
        # Inter-sensor variance & epistemic uncertainty
        variance = float(np.var(values)) if len(values) > 1 else 0.25
        missing_penalty = 0.15 * len(missing)
        uncertainty = float(np.clip(np.sqrt(variance) * 0.7 + missing_penalty, 0.05, 0.90))

        confidence_interval = (
            round(float(np.clip(composite_score - 1.96 * uncertainty * 0.5, 0.0, 1.0)), 3),
            round(float(np.clip(composite_score + 1.96 * uncertainty * 0.5, 0.0, 1.0)), 3)
        )

        return {
            "candidate_id": candidate_id,
            "pathway": "STRUCTURED_EVIDENCE",
            "status": ImplementationStatus.HEURISTIC.value,
            "abstain": False,
            "abstain_reason": None,
            "structured_evidence_score": round(composite_score, 3),
            "uncertainty": round(uncertainty, 3),
            "confidence_interval_95": confidence_interval,
            "available_evidence_count": len(available),
            "missing_evidence_count": len(missing),
            "evidence_drivers": drivers,
            "contradictions_detected": contradictions,
            "scientific_disclaimer": "Structured evidence index synthesizes multimodal orbital anomalies; it does NOT assert ground truth or certify subsurface void continuity."
        }

    def evaluate_pathway_b_copula(
        self,
        candidate_id: str,
        priors: Optional[List[float]] = None
    ) -> Dict[str, Any]:
        """
        Pathway B — Bayesian Joint Inference with Gaussian Copula (v4.0 Section 13.3)
        Models dependency structure between sensors rather than naive independent multiplication.
        Runs a sensitivity sweep across plausible lunar priors: [0.01, 0.05, 0.10, 0.20].
        """
        priors = priors or [0.01, 0.05, 0.10, 0.20]
        nodes = self.graph.get_candidate_nodes(candidate_id)
        available = [n for n in nodes if n.value is not None and n.quality_state != QualityState.REJECTED]

        if len(available) < 3:
            return {
                "candidate_id": candidate_id,
                "pathway": "PROBABILISTIC_COPULA",
                "status": ImplementationStatus.EXPERIMENTAL.value,
                "abstain": True,
                "abstain_reason": f"Insufficient multimodal coverage for joint copula fitting (requires >= 3 modalities, found {len(available)}).",
                "posterior_probabilities": {}
            }

        # Build correlation matrix Sigma among available modalities
        k = len(available)
        sigma = np.eye(k)
        for i in range(k):
            for j in range(i + 1, k):
                # Look up edges in dependency graph
                rho = 0.20  # default mild background correlation
                for target_id, dep_type, edge_rho in self.graph.edges.get(available[i].evidence_id, []):
                    if target_id == available[j].evidence_id:
                        rho = edge_rho
                        break
                sigma[i, j] = rho
                sigma[j, i] = rho

        # Compute Copula log-likelihood ratio
        # Likelihood ratio under H1 (void present) vs H0 (surface/crater only)
        # Using deflated joint density under Gaussian copula
        vals = np.array([float(n.value) for n in available])
        if HAS_SCIPY:
            z_scores = scipy.stats.norm.ppf(np.clip(vals, 1e-4, 1.0 - 1e-4))
        else:
            import statistics
            nd = statistics.NormalDist()
            z_scores = np.array([nd.inv_cdf(float(p)) for p in np.clip(vals, 1e-4, 1.0 - 1e-4)], dtype=np.float32)
        
        try:
            inv_sigma = np.linalg.inv(sigma)
            # Log copula density: c(u) = -0.5 * (z^T (inv_sigma - I) z) - 0.5 * log(det(sigma))
            sign, logdet = np.linalg.slogdet(sigma)
            copula_correction = -0.5 * float(z_scores.T @ (inv_sigma - np.eye(k)) @ z_scores) - 0.5 * logdet
        except np.linalg.LinAlgError:
            copula_correction = 0.0

        # Marginal log-likelihood ratios for each sensor
        # LLR_i = log( P(E_i | Void) / P(E_i | NonVoid) )
        marginal_llrs = []
        for v in vals:
            # High evidence score indicates strong likelihood ratio
            llr = float(np.log((v + 1e-3) / (1.0 - v + 1e-3)))
            marginal_llrs.append(llr)

        total_joint_log_lr = float(np.sum(marginal_llrs) + copula_correction * 0.5)
        joint_likelihood_ratio = float(np.exp(np.clip(total_joint_log_lr, -8.0, 8.0)))

        # Posterior sweep across priors
        posterior_sweep = {}
        for p0 in priors:
            prior_odds = p0 / (1.0 - p0)
            post_odds = prior_odds * joint_likelihood_ratio
            post_prob = float(post_odds / (1.0 + post_odds))
            posterior_sweep[str(p0)] = round(post_prob, 4)

        return {
            "candidate_id": candidate_id,
            "pathway": "PROBABILISTIC_COPULA",
            "status": ImplementationStatus.EXPERIMENTAL.value,
            "abstain": False,
            "joint_likelihood_ratio": round(joint_likelihood_ratio, 3),
            "copula_correlation_determinant": round(float(np.exp(logdet)), 3) if 'logdet' in locals() else 1.0,
            "posterior_probabilities": posterior_sweep,
            "governing_prior_p0_05_posterior": posterior_sweep.get("0.05", None),
            "sensitivity_note": (
                f"Posterior spans from {posterior_sweep.get('0.01')} (at 1% prior) to "
                f"{posterior_sweep.get('0.2')} (at 20% prior). Sensitivity demonstrates heavy dependence on unverified lunar priors."
            )
        }
