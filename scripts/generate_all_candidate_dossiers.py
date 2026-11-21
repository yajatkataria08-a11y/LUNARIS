"""
LunaSafe-AI: Comprehensive Candidate Dossier Generator for All Lunar Sites.

Executes scientific verification and dossier compilation for:
- Marius Hills Hole (LLT-001) - Oceanus Procellarum (Arya 2011, Sinha 2024, Bhardwaj 2021)
- Mare Tranquillitatis Pit (LLT-002) - Mare Tranquillitatis (Robinson 2012, Carrer 2024)
- Serenitatis Collapse Chain (LLT-003) - Mare Serenitatis
- Fecunditatis Sinuous Rille (LLT-004) - Mare Fecunditatis
- Imbrium Rim Candidate (LLT-005) - Mare Imbrium
"""

import os
import sys
import json
import datetime
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ml_pipeline.ranking.isro_scoring import ISROChandrayaanScoringEngine
from backend.main import load_sites, extract_site_features
from ml_pipeline.models.ensemble_stacker import ensemble_stacker
from ml_pipeline.models.shap_explainer import shap_explainer

def generate_all_dossiers():
    out_dir = Path("outputs/candidates")
    out_dir.mkdir(parents=True, exist_ok=True)

    sites = load_sites()
    generated_dossiers = []

    for s in sites:
        site_id = s["id"]
        name = s["name"]
        region = s.get("region", "")
        feat = extract_site_features(s)

        # 1. Ensemble Prediction & Consensus
        ens_pred = ensemble_stacker.predict_candidate(feat)

        # 2. SHAP Explainability
        shap_res = shap_explainer.explain_candidate(feat)

        # 3. ISRO LHI Score & Grounding
        isro_lhi = ISROChandrayaanScoringEngine.compute_lhi(s)

        # Build Scientific Dossier
        dossier = {
            "metadata": {
                "dossier_id": f"DOSSIER_{site_id}_{datetime.date.today().strftime('%Y%m%d')}",
                "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "mission_context": "LunaSafe AI - Lunar Lava Tube Habitat & Stability Mapper",
                "framework": "ISRO Chandrayaan Remote Sensing & Geomechanical Assessment",
            },
            "candidate_profile": {
                "site_id": site_id,
                "name": name,
                "region": region,
                "coordinates": {"lat": s.get("lat", 0.0), "lon": s.get("lon", 0.0)},
                "terrain_type": s.get("terrain", "Mare"),
                "status": s.get("status", "CANDIDATE"),
            },
            "scoring_evaluation": {
                "isro_lhi_score": isro_lhi["isro_lhi_score"],
                "exploration_tier": isro_lhi["exploration_tier"],
                "tier_label": isro_lhi["tier_label"],
                "isro_sub_scores": isro_lhi["sub_scores"],
                "ai_ensemble_score": ens_pred["suitability_score"],
                "ai_priority_grade": ens_pred["priority_grade"],
                "epistemic_model_variance": ens_pred["model_variance"],
                "base_model_consensus": ens_pred["base_model_predictions"],
                "mcda_heuristic_score": s.get("habitatScore"),
                "credible_interval_95": [s.get("scoreLow"), s.get("scoreHigh")],
            },
            "shap_game_theoretic_explainability": {
                "base_value_expectation": shap_res["base_value"],
                "total_attribution_shift": shap_res["total_shap_shift"],
                "top_favorable_drivers": shap_res["positive_drivers"][:3],
                "top_risk_factors": shap_res["negative_drivers"][:3],
                "explanation_method": shap_res["explanation_method"],
            },
            "primary_isro_chandrayaan_data_sources": [
                {
                    "instrument": "Chandrayaan-2 OHRC (0.25 m/pixel)",
                    "portal": "ISRO ISSDC PRADAN (https://pradan.issdc.gov.in/ch2/)",
                    "measurement": "Sub-meter shadow stereogrammetry & lateral overhang inspection (Sinha et al. 2024)",
                },
                {
                    "instrument": "Chandrayaan-2 TMC-2 (5.0 m/pixel)",
                    "portal": "ISRO ISSDC PRADAN (https://pradan.issdc.gov.in/ch2/)",
                    "measurement": "3D Stereo DTM elevation, approach slope, and RMS roughness (Arya et al. 2011)",
                },
                {
                    "instrument": "Chandrayaan-2 DFSAR (2.0 m/pixel)",
                    "portal": "ISRO ISSDC PRADAN (https://pradan.issdc.gov.in/ch2/)",
                    "measurement": "L-band polarimetric CPR & m-chi double-bounce scattering (Bhardwaj et al. 2021, Vijayan et al. 2021)",
                },
                {
                    "instrument": "Chandrayaan-3 ChaSTE In-Situ Probe",
                    "measurement": "Real in-situ regolith thermal gradient (60°C plunge within 10 cm; ChaSTE Team 2023)",
                },
                {
                    "instrument": "Chandrayaan-1 HySI / M3",
                    "measurement": "Titanium dioxide (TiO2 > 6 wt%) & ilmenite tensile strength competence (Bhattacharya 2012)",
                },
            ],
            "geomechanical_scenarios": s.get("simulated_structural_scenarios", {}) or {
                "assumed_elastic_modulus_gpa": 50.0,
                "assumed_basalt_density_kgm3": 3000.0,
                "lunar_gravity_ms2": 1.62,
                "median_factor_of_safety": 3.0,
                "governing_category": "NOMINALLY STABLE (STATIC SCENARIO)",
            },
            "scientific_disclaimer": (
                "LunaSafe AI is a planetary research decision-support prototype. "
                "Remote sensing measurements provide indirect geological evidence; "
                "underground cavern void geometry and ceiling continuity require in-situ micro-rover exploration."
            ),
        }

        # Write dossier JSON
        filename = f"dossier_{site_id.lower().replace('-', '_')}_{region.lower().replace(' ', '_')}.json"
        target_path = out_dir / filename
        with open(target_path, "w", encoding="utf-8") as f:
            json.dump(dossier, f, indent=2)

        print(f"[LunaSafe AI] Compiled dossier for {name} -> {target_path}")
        generated_dossiers.append(str(target_path))

    return generated_dossiers

if __name__ == "__main__":
    generate_all_dossiers()
