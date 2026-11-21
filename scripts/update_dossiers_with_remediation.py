"""
Update candidate dossiers in outputs/candidates/ with engineering remediation roadmaps.
"""

import os
import sys
import json
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ml_pipeline.ranking.isro_scoring import ISROChandrayaanScoringEngine

def main():
    sites_path = Path("outputs/predictions/ranked_sites.json")
    if not sites_path.exists():
        print("ranked_sites.json not found!")
        return

    with open(sites_path, "r", encoding="utf-8") as f:
        sites = json.load(f)

    dossier_dir = Path("outputs/candidates")
    updated_count = 0

    for site in sites:
        site_id = site["id"]
        remediation = ISROChandrayaanScoringEngine.compute_remediated_lhi(site)
        matches = list(dossier_dir.glob(f"dossier_{site_id.lower().replace('-', '_')}*.json"))
        if not matches:
            continue

        dossier_file = matches[0]
        with open(dossier_file, "r", encoding="utf-8") as f:
            dossier = json.load(f)

        dossier["engineering_remediation_roadmap"] = remediation
        with open(dossier_file, "w", encoding="utf-8") as f:
            json.dump(dossier, f, indent=2)

        updated_count += 1
        print(f"Updated {site_id} ({site['name']}): Baseline {remediation['baseline_lhi_score']} -> Remediated {remediation['remediated_lhi_score']} (Delta: +{remediation['score_delta']})")

    print(f"\nSuccessfully updated {updated_count} dossiers with engineering remediation roadmaps.")

if __name__ == "__main__":
    main()
