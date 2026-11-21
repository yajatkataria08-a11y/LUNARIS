"""
Execute Track 1 Inversion across all candidate sites and save results.
"""

import os
import sys
import json
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ml_pipeline.inversion.track1_pipeline import Track1InversionEngine

def main():
    sites_path = Path("outputs/predictions/ranked_sites.json")
    if not sites_path.exists():
        print("ranked_sites.json not found!")
        return

    with open(sites_path, "r", encoding="utf-8") as f:
        sites = json.load(f)

    print(f"Running Track 1 Inversion on {len(sites)} candidate sites...")
    track1_results = Track1InversionEngine.run_full_catalog(sites)

    out_file = Path("outputs/predictions/track1_inversion_results.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(track1_results, f, indent=2)

    print(f"Saved Track 1 Inversion results to {out_file}")

    # Enrich dossiers
    dossier_dir = Path("outputs/candidates")
    for res in track1_results:
        site_id = res["site_id"]
        matches = list(dossier_dir.glob(f"dossier_{site_id.lower().replace('-', '_')}*.json"))
        if not matches:
            continue
        dossier_file = matches[0]
        with open(dossier_file, "r", encoding="utf-8") as f:
            dossier = json.load(f)

        dossier["track1_inversion_assessment"] = res
        with open(dossier_file, "w", encoding="utf-8") as f:
            json.dump(dossier, f, indent=2)
        print(f"Updated dossier for {site_id} ({res['site_name']}): Track 1 Score = {res['track1_inversion_score']} ({res['track1_status']})")

    print("\nTrack 1 Pipeline Run Complete!")

if __name__ == "__main__":
    main()
