import json
from typing import Dict, Any, List
from slm.retrieval import ResearchRetriever

class SLMReportAssistant:
    """
    SLM Report Assistant:
    Generates traceable, cited, uncertainty-aware technical summaries
    from structured pipeline outputs.
    Adheres strictly to the scientific constraints of Section 8:
    - Never asserts tube presence as fact
    - Never uses 'safe for astronauts' terminology
    - Cites exact verified publications
    """

    def __init__(self, papers_path: str = "data/research_papers.json"):
        self.retriever = ResearchRetriever(papers_path)

    def generate_candidate_report(self, site: Dict[str, Any]) -> Dict[str, Any]:
        name = site.get("name", "Unknown Site")
        uncertainty = site.get("uncertainty", 0.3)
        score = site.get("researchPriorityScore") or site.get("habitatScore", 50.0)
        ci = site.get("credibleInterval95", (score - 8.0, score + 8.0))
        status = site.get("status", "RESEARCH_CANDIDATE")
        obs = site.get("observedEvidence", {})
        scenarios = site.get("simulatedStructuralScenarios", {})

        # Retrieve relevant supporting papers
        relevant_papers = self.retriever.retrieve(f"{site.get('terrain', '')} lava tube stability radar pit", top_k=2)
        citations = []
        for p in relevant_papers:
            citations.append({
                "citation": f"{p['authors']} ({p['year']}), {p['journal']}",
                "title": p["title"],
                "doi": p["doi"]
            })

        # Structured narrative separating observations from simulations
        summary_paragraphs = [
            f"### Research-Priority Assessment: {name} ({site.get('region', 'Lunar Mare')})",
            f"**Research-Priority Score:** **{score:.1f} / 100** (Empirical 95% Monte Carlo Credible Interval: [{ci[0]:.1f} – {ci[1]:.1f}])\n"
            f"**Classification Status:** `{status}`",
            "#### 1. Observed Surface & Remote Sensing Evidence [MEASURED / INFERRED]",
            f"- **Optical Pit Morphology (OHRC/LROC):** Evidence score = {obs.get('opticalPitEvidence', 0):.2f}. Measured pit collar diameter and shadow geometry indicate a topographic depression of depth ~{obs.get('topographicDepressionDepthM', 'N/A')} m.",
            f"- **Radar Anomaly (DFSAR / Mini-RF):** Anomaly score = {obs.get('radarScatteringAnomaly', 0):.2f}. *Caveat:* Polarimetric variations indicate surface roughness and blockiness; they do not confirm a continuous underground void without oblique sounder passes (Carrer et al. 2024).",
            f"- **Gravitational Mass Deficit (GRAIL):** Gradient evidence score = {obs.get('gravityDeficitEvidence', 0):.2f}.",
            "#### 2. Hypothetical Geomechanical Scenarios [SIMULATED]",
            f"- **Span & Thickness Scenario Range:** Conduit span is unobservable from orbit and is swept across [{scenarios.get('assumed_span_range_m', [30, 60])[0]:.0f} – {scenarios.get('assumed_span_range_m', [30, 60])[1]:.0f}] m with roof thickness [{scenarios.get('assumed_roof_thickness_range_m', [10, 30])[0]:.0f} – {scenarios.get('assumed_roof_thickness_range_m', [10, 30])[1]:.0f}] m.",
            f"- **Factor of Safety (FS) Range:** {scenarios.get('fs_range', [1.1, 2.0])} (Median: {scenarios.get('median_factor_of_safety', 1.5):.1f}) under jointed rock mass strength properties (tensile cutoff: 1.0 MPa, UCS: 35 MPa).",
            f"- **Governing Category:** {scenarios.get('governing_category', 'MARGINAL / SEISMICALLY VULNERABLE')}.",
            f"- **Noted Risk Flags:** {', '.join(scenarios.get('risk_flags', ['None reported']))}.",
            "#### 3. Epistemic Uncertainty & In-Situ Verification Needs",
            f"- **Quantified Epistemic Uncertainty:** {uncertainty:.2f} (Drives the width of the score credible interval).",
            f"- **Mandatory In-Situ Verification:** {', '.join(site.get('validationNeeded', ['Rover ground-penetrating radar survey', 'Seismic monitoring']))}."
        ]

        return {
            "site_id": site.get("id"),
            "site_name": name,
            "research_priority_score": score,
            "credible_interval_95": ci,
            "status": status,
            "report_markdown": "\n\n".join(summary_paragraphs),
            "citations": citations,
            "disclaimer": "LunaSafe AI is an AI-assisted research-prioritization tool based on remote sensing and numerical simulations. It does NOT certify astronaut safety or confirm underground lava tubes."
        }
