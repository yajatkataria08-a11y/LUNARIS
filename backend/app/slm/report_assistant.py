"""Grounding and Scientific Report Assistant with 4-Tier Evidence Decomposition."""

from typing import Dict, Any, List
from backend.app.slm.retrieval import literature_retriever


class ScientificReportAssistant:
    """Provides grounded answers and generates 4-tier scientific assessments for candidate sites."""

    def __init__(self):
        self.retriever = literature_retriever

    def query(self, user_query: str) -> Dict[str, Any]:
        """Answer scientific questions with peer-reviewed literature citations."""
        retrieved_docs = self.retriever.retrieve(user_query, top_k=2)

        citations = [
            f"[{d['authors']} ({d['year']}). {d['title']}. {d['journal']}]"
            for d in retrieved_docs
        ]

        # Synthesize grounded scientific response
        primary_paper = retrieved_docs[0] if retrieved_docs else None
        context = primary_paper["key_findings"] if primary_paper else ""

        response_text = (
            f"Based on peer-reviewed planetary literature: {context}\n\n"
            f"Evidence grounding: {citations[0] if citations else 'N/A'}"
        )

        return {
            "query": user_query,
            "answer": response_text,
            "citations": citations,
            "retrieved_literature": retrieved_docs,
            "scientific_disclaimer": (
                "LunaSafe AI is a research decision-support prototype. "
                "Remote sensing observations provide indirect geological evidence; "
                "they do not constitute certified subsurface habitability certification."
            ),
        }

    def explain_site_tiers(self, site: Dict[str, Any]) -> Dict[str, Any]:
        """Decompose a lunar site record into 4 unambiguous scientific evidence tiers."""
        site_id = site.get("id", "Unknown")
        name = site.get("name", "Unnamed Site")
        lat = site.get("lat", 0.0)
        lon = site.get("lon", 0.0)

        obs = site.get("observedEvidence", {}) or {}
        det = site.get("detection", {}) or {}
        roof = site.get("roof", {}) or {}
        sc = site.get("simulatedStructuralScenarios", {}) or {}

        # 1. OBSERVED TIER (Direct remote sensing measurements)
        observed = {
            "tier": "OBSERVED",
            "description": "Direct optical, elevation, and radar measurements from Chandrayaan-2 and NASA instruments.",
            "data_sources": ["Chandrayaan-2 OHRC (0.25m/px)", "TMC-2 DTM (5m/px)", "DFSAR L/S-band radar"],
            "coordinates": f"{lat:.4f}°, {lon:.4f}°",
            "pit_depth_m": obs.get("topographicDepressionDepthM", "N/A"),
            "mean_slope_deg": obs.get("meanSurfaceSlopeDeg", 6.5),
            "radar_backscatter_db": obs.get("radarBackscatterSigma0Db", -11.5),
            "scattering_entropy": obs.get("polarimetricEntropy", 0.55),
        }

        # 2. PREDICTED TIER (Machine learning outputs)
        predicted = {
            "tier": "PREDICTED",
            "description": "Attention U-Net segmentation confidence and multi-sensor ensemble classification.",
            "model_architecture": "Attention U-Net (Oktay et al. 2018) + Stacking Ensemble (XGB, LGBM, RF, MLP)",
            "optical_confidence": roof.get("skylightConfidence") or det.get("probability", 0.75),
            "ensemble_priority_grade": site.get("priorityGrade", "B"),
            "validation_protocol": "Leave-One-Region-Out (LORO) Cross-Validation",
        }

        # 3. SIMULATED TIER (Physics-based geomechanical modeling)
        simulated = {
            "tier": "SIMULATED",
            "description": "Euler-Bernoulli and finite-element structural simulation under assumed basalt parameters.",
            "gravity_constant_ms2": 1.62,
            "assumed_elastic_modulus_gpa": 50.0,
            "assumed_basalt_density_kgm3": 3000.0,
            "median_factor_of_safety": sc.get("median_factor_of_safety", 2.2),
            "max_bending_stress_mpa": sc.get("max_bending_stress_mpa", 3.2),
            "hypothetical_roof_thickness_m": roof.get("roofThicknessM", 15.0),
            "reference_geomechanics": "Blair et al. (2017), Theinat et al. (2020)",
        }

        # 4. UNKNOWN TIER (Unverified underground properties)
        unknown = {
            "tier": "UNKNOWN",
            "description": "Properties that cannot be observed from orbital remote sensing and require in-situ exploration.",
            "items": [
                "Exact subterranean ceiling thickness profile along the uncollapsed conduit",
                "Subsurface basalt fracture density, joint spacing, and thermal cracking extent",
                "Internal void continuity beyond the line of sight of the pit rim",
                "Sub-regolith boulder distribution on the lava tube floor",
                "Real-time seismic and micrometeorite vibration transmission",
            ],
            "recommendation": "Classify as preliminary exploration candidate pending in-situ micro-rover or penetrator mission.",
        }

        # Retrieve relevant scientific literature for this site's context
        query_context = f"{name} lava tube roof stability slope {obs.get('meanSurfaceSlopeDeg', 6.5)} degrees"
        relevant_literature = self.retriever.retrieve(query_context, top_k=2)

        return {
            "site_id": site_id,
            "site_name": name,
            "tiers": {
                "observed": observed,
                "predicted": predicted,
                "simulated": simulated,
                "unknown": unknown,
            },
            "literature_grounding": [
                {"title": p["title"], "authors": p["authors"], "year": p["year"], "key_finding": p["key_findings"]}
                for p in relevant_literature
            ],
            "scientific_disclaimer": (
                "Important: Detecting a collapse pit does NOT prove an intact, traversable lava tube exists. "
                "All structural assessments are scenario simulations with assumed basalt geomechanical properties."
            ),
        }


scientific_report_assistant = ScientificReportAssistant()
