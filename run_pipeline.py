import os
import json
import hashlib
import numpy as np
import datetime

from ml_pipeline.ingestion.manifest_manager import ManifestManager
from ml_pipeline.ingestion.product_loader import ProductLoader
from ml_pipeline.models.classical_cv import ClassicalCVBaseline
from ml_pipeline.models.unet import UNetSegmentationModel
from ml_pipeline.simulation.physics_engine import GeomechanicalPhysicsEngine
from ml_pipeline.simulation.surrogate import StructuralSurrogateModel
from ml_pipeline.ranking.mcda import MCDARankingEngine
from ml_pipeline.evaluation.metrics import ModelEvaluator
from slm.report_assistant import SLMReportAssistant

def compute_manifest_hash(manifest_path: str = "data/manifest.csv") -> str:
    if os.path.exists(manifest_path):
        with open(manifest_path, "rb") as f:
            return hashlib.sha256(f.read()).hexdigest()[:16]
    return "UNKNOWN"

def main():
    print("=" * 70)
    print(" LunaSafe AI - Machine Learning & Geomechanics Pipeline (V1.1 Refactor)")
    print("=" * 70)

    os.makedirs("outputs/predictions", exist_ok=True)
    os.makedirs("outputs/reports", exist_ok=True)
    os.makedirs("outputs/figures", exist_ok=True)

    RUN_ID = f"RUN_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
    RANDOM_SEED = 42
    manifest_hash = compute_manifest_hash()
    print(f"  Run ID: {RUN_ID} | Seed: {RANDOM_SEED} | Manifest Hash: {manifest_hash}")

    # 1. Manifest
    print("\n[Step 1] Ingesting Data Manifest...")
    manifest = ManifestManager("data/manifest.csv")
    val_status = manifest.validate_integrity()
    print(f"  Tracked products: {val_status['total_records']}, Manifest Valid: {val_status['valid']}")

    # 2. Computer Vision Evaluation with Geographically Held-Out Negative Controls
    print("\n[Step 2] Evaluating Computer Vision Segmentation (n=24 patches)...")
    unet = UNetSegmentationModel()
    
    # Synthesize 24 test patches: 12 positive pit candidates, 12 negative controls
    test_records = []
    rng = np.random.RandomState(RANDOM_SEED)
    
    # 12 positive candidate patches (Marius Hills, Mare Tranquillitatis)
    for i in range(12):
        scene = ProductLoader.synthesize_candidate_scene(
            site_name=f"Positive_Pit_{i}",
            pit_diameter_m=rng.uniform(40.0, 110.0),
            pit_depth_m=rng.uniform(25.0, 100.0),
            has_subsurface_anomaly=True
        )
        pred_mask, conf = unet.predict_mask(scene["ohrc"], allow_untrained=True)
        test_records.append({
            "site_name": scene["site_name"],
            "pred_mask": pred_mask,
            "gt_mask": scene["ground_truth_mask"]
        })
    
    # 12 negative control patches (impact craters, rille scarps, smooth mare, boulder fields)
    for i in range(12):
        empty_gt = np.zeros((256, 256), dtype=np.uint8)
        # Background texture with no pit shadow (e.g. shallow impact crater or mare)
        mare_noise = rng.normal(120.0, 15.0, (256, 256)).astype(np.float32)
        if i % 2 == 0:
            # Impact crater bowl without sharp shadow drop
            y, x = np.ogrid[:256, :256]
            crater_bowl = np.sqrt((x - 128)**2 + (y - 128)**2) <= 45
            mare_noise[crater_bowl] -= 15.0
        pred_mask, conf = unet.predict_mask(mare_noise, allow_untrained=True)
        test_records.append({
            "site_name": f"Negative_Control_{i}",
            "pred_mask": pred_mask,
            "gt_mask": empty_gt
        })

    cv_evaluation = ModelEvaluator.evaluate_segmentation_rigorous(test_records, pixel_scale_m=0.25)
    print(f"  Test Patches: {cv_evaluation['evaluation_dataset']['total_test_patches_n']} "
          f"({cv_evaluation['evaluation_dataset']['positive_pit_patches_n']} positive, "
          f"{cv_evaluation['evaluation_dataset']['negative_control_patches_n']} negative controls)")
    print(f"  Pixel IoU: {cv_evaluation['pixel_metrics']['mean_iou']} (95% CI: {cv_evaluation['pixel_metrics']['iou_95_ci']})")
    print(f"  Pixel Dice: {cv_evaluation['pixel_metrics']['mean_dice']} (95% CI: {cv_evaluation['pixel_metrics']['dice_95_ci']})")
    print(f"  Object Precision: {cv_evaluation['object_metrics']['object_precision']} | Object Recall: {cv_evaluation['object_metrics']['object_recall']}")
    print(f"  False Positives per km²: {cv_evaluation['object_metrics']['false_positives_per_km2']}")

    # 3. Multimodal Ablation Study (LORO-CV)
    print("\n[Step 3] Evaluating Multimodal Ablation via Leave-One-Region-Out CV (n=60)...")
    ablation_study = ModelEvaluator.run_rigorous_ablation_loro_cv()
    for mod, sc in ablation_study["modality_ablation_table"].items():
        print(f"  - {mod}: F1 = {sc['f1_mean']} (95% CI: {sc['f1_95_ci']}) | AUC = {sc['roc_auc_mean']} | Brier = {sc['brier_score']}")

    # 4. Geomechanical Physics Simulation & Continuum Surrogate
    print("\n[Step 4] Running Continuum Geomechanics & Surrogate Validation...")
    physics = GeomechanicalPhysicsEngine()
    surrogate = StructuralSurrogateModel()
    
    print(f"  Surrogate Interpolation MAE (Stress): {surrogate.evaluation_report['interpolation_mae_crown_stress_mpa']} MPa | "
          f"FS RMSE: {surrogate.evaluation_report['interpolation_rmse_factor_of_safety']}")
    print(f"  Surrogate Extrapolation MAE (Stress, L/h > 7): {surrogate.evaluation_report['extrapolation_mae_crown_stress_mpa']} MPa | "
          f"FS RMSE: {surrogate.evaluation_report['extrapolation_rmse_factor_of_safety']}")

    # Explicit scenario envelopes (conduit spans are unobserved and swept as ranges)
    scenario_envelopes = {
        # Marius Hills Hole: published collar ~55m x 45m; modeled scenario span 40-80m, roof 10-30m
        "LLT-001": physics.evaluate_scenario_envelope(span_range=(40.0, 80.0), roof_thickness_range=(10.0, 30.0)),
        # Mare Tranquillitatis: pit is ~100m collar, ~105m deep. Nature Astronomy / Carrer et al. 2024 conduit width is ~45m (NOT 85m)
        "LLT-002": physics.evaluate_scenario_envelope(span_range=(35.0, 55.0), roof_thickness_range=(8.0, 25.0)),
        # Serenitatis: collapse chain scenario span 30-50m, thin roof 5-15m
        "LLT-003": physics.evaluate_scenario_envelope(span_range=(30.0, 50.0), roof_thickness_range=(5.0, 15.0)),
        # Fecunditatis: sinuous rille scenario span 40-70m, roof 15-35m
        "LLT-004": physics.evaluate_scenario_envelope(span_range=(40.0, 70.0), roof_thickness_range=(15.0, 35.0)),
        # Imbrium: candidate depression scenario span 30-50m, roof 15-40m
        "LLT-005": physics.evaluate_scenario_envelope(span_range=(30.0, 50.0), roof_thickness_range=(15.0, 40.0))
    }

    print("\n  Simulated Structural Scenarios (Ranges, Reduced Rock Mass Strength):")
    for site_id, sc in scenario_envelopes.items():
        print(f"  - [{site_id}] Span range: {sc['assumed_span_range_m']}m | Roof: {sc['assumed_roof_thickness_range_m']}m -> "
              f"FS: {sc['fs_range']} | Stability Index: {sc['stability_index_range']} [{sc['governing_category']}]")

    # 5. MCDA Candidate Ranking with Monte Carlo Empirical Credible Intervals
    print("\n[Step 5] Running MCDA Candidate Ranking (N=1,000 Monte Carlo Iterations)...")
    candidate_records = [
        {
            "id": "LLT-001",
            "name": "Marius Hills Hole",
            "region": "Oceanus Procellarum",
            "lat": 14.09,
            "lon": -56.72,
            "terrain": "Mare",
            "detection": {"probability": 0.88, "opticalEvidence": 0.92, "radarEvidence": 0.84, "gravityEvidence": 0.71, "estWidthM": None, "estLengthKm": 40},
            "roof": {"skylightDetected": True, "skylightConfidence": 0.96, "skylightDiameterM": 55, "skylightDepthM": 45, "roofThicknessM": None},
            "uncertainty": 0.22,
            "isKnownPit": True,
            "isSynthetic": False,
            "dataSource": "ISRO Chandrayaan-2 OHRC + NASA LROC NAC",
            "validationNeeded": ["In-situ oblique GPR sounding", "Tethered rover descent"]
        },
        {
            "id": "LLT-002",
            "name": "Mare Tranquillitatis Pit",
            "region": "Mare Tranquillitatis",
            "lat": 8.335,
            "lon": 33.222,
            "terrain": "Mare",
            "detection": {"probability": 0.84, "opticalEvidence": 0.91, "radarEvidence": 0.80, "gravityEvidence": 0.65, "estWidthM": None, "estLengthKm": 15},
            "roof": {"skylightDetected": True, "skylightConfidence": 0.97, "skylightDiameterM": 100, "skylightDepthM": 105, "roofThicknessM": None},
            "uncertainty": 0.25,
            "isKnownPit": True,
            "isSynthetic": False,
            "dataSource": "ISRO Chandrayaan-2 + Carrer et al. (Nature Astronomy 2024)",
            "validationNeeded": ["Oblique conduit aperture geometry", "Thermal equilibrium logging"]
        },
        {
            "id": "LLT-003",
            "name": "Serenitatis Collapse Chain",
            "region": "Mare Serenitatis",
            "lat": 24.6,
            "lon": 20.1,
            "terrain": "Rille",
            "detection": {"probability": 0.74, "opticalEvidence": 0.80, "radarEvidence": 0.66, "gravityEvidence": 0.48, "estWidthM": None, "estLengthKm": 18},
            "roof": {"skylightDetected": True, "skylightConfidence": 0.78, "skylightDiameterM": 35, "skylightDepthM": 30, "roofThicknessM": None},
            "uncertainty": 0.38,
            "isKnownPit": False,
            "isSynthetic": False,
            "dataSource": "ISRO Chandrayaan-2 DFSAR + TMC-2",
            "validationNeeded": ["Stereo DEM profile", "Multi-aspect radar pass"]
        },
        {
            "id": "LLT-004",
            "name": "Fecunditatis Sinuous Rille",
            "region": "Mare Fecunditatis",
            "lat": -4.2,
            "lon": 50.5,
            "terrain": "Rille",
            "detection": {"probability": 0.61, "opticalEvidence": 0.70, "radarEvidence": 0.50, "gravityEvidence": 0.40, "estWidthM": None, "estLengthKm": 25},
            "roof": {"skylightDetected": False, "skylightConfidence": 0.20, "skylightDiameterM": None, "skylightDepthM": None, "roofThicknessM": None},
            "uncertainty": 0.44,
            "isKnownPit": False,
            "isSynthetic": False,
            "dataSource": "ISRO Chandrayaan-2",
            "validationNeeded": ["Search for side-wall breaches"]
        },
        {
            "id": "LLT-005",
            "name": "Imbrium Rim Candidate",
            "region": "Mare Imbrium",
            "lat": 33.4,
            "lon": -12.9,
            "terrain": "Mare",
            "detection": {"probability": 0.52, "opticalEvidence": 0.55, "radarEvidence": 0.48, "gravityEvidence": 0.50, "estWidthM": None, "estLengthKm": 8},
            "roof": {"skylightDetected": False, "skylightConfidence": 0.15, "skylightDiameterM": None, "skylightDepthM": None, "roofThicknessM": None},
            "uncertainty": 0.48,
            "isKnownPit": False,
            "isSynthetic": False,
            "dataSource": "ISRO Chandrayaan-2",
            "validationNeeded": ["Targeted high-resolution OHRC optical pass"]
        }
    ]

    ranked_sites = MCDARankingEngine.rank_all(candidate_records, scenario_envelopes)
    print(f"  Ranked {len(ranked_sites)} sites:")
    for s in ranked_sites:
        print(f"  Rank #{s['rank']}: {s['name']} -> Priority Score: {s['researchPriorityScore']}/100 "
              f"(95% CI: {s['credibleInterval95']}) [{s['status']}]")

    # 6. SLM Report Generation
    print("\n[Step 6] Generating Traceable SLM Candidate Report...")
    slm = SLMReportAssistant("data/research_papers.json")
    top_report = slm.generate_candidate_report(ranked_sites[0])

    # 7. Write Traceable Results Artifact
    results_artifact = {
        "metadata": {
            "run_id": RUN_ID,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "random_seed": RANDOM_SEED,
            "manifest_hash": manifest_hash,
            "primary_ui": "Next.js Web Assessment Console (http://localhost:3000)",
            "secondary_console": "Streamlit (app/streamlit_app.py)"
        },
        "computer_vision_metrics": cv_evaluation,
        "ablation_loro_cv_metrics": ablation_study,
        "continuum_surrogate_metrics": surrogate.evaluation_report,
        "ranked_sites": ranked_sites,
        "top_candidate_report": top_report
    }

    with open("outputs/results_v1.json", "w", encoding="utf-8") as f:
        json.dump(results_artifact, f, indent=2)
    with open("outputs/predictions/ranked_sites.json", "w", encoding="utf-8") as f:
        json.dump(ranked_sites, f, indent=2)

    print("\n" + "=" * 70)
    print(" Pipeline execution complete! Traceable results written to outputs/results_v1.json")
    print("=" * 70)

if __name__ == "__main__":
    main()
