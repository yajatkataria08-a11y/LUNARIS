import sys, json, numpy as np
sys.path.insert(0, '.')

from ml_pipeline.evaluation.metrics import ModelEvaluator
from ml_pipeline.models.ensemble_stacker import LunarStackingEnsemble
from sklearn.metrics import (accuracy_score, f1_score, roc_auc_score,
                              precision_score, recall_score,
                              confusion_matrix, classification_report)

# ── 1. LORO-CV Ablation ──────────────────────────────────────────────────────
ablation = ModelEvaluator.run_rigorous_ablation_loro_cv()
print("=" * 55)
print("  LORO-CV ABLATION  (N=60, 5 geographic folds)")
print("=" * 55)
for model, v in ablation["modality_ablation_table"].items():
    ci = v["f1_95_ci"]
    print(f"  {model}")
    print(f"    F1={v['f1_mean']:.2f}  CI=[{ci[0]:.2f},{ci[1]:.2f}]"
          f"  AUC={v['roc_auc_mean']:.2f}  Brier={v['brier_score']:.2f}")

print()

# ── 2. Ensemble Stacker — Live Fit + Eval ────────────────────────────────────
ensemble = LunarStackingEnsemble()
X, y = ensemble._generate_reference_training_data()

np.random.seed(42)
idx = np.random.permutation(len(y))
split = int(0.8 * len(idx))
train_idx, test_idx = idx[:split], idx[split:]

X_test = X[test_idx]
y_test = y[test_idx]

feature_names = ensemble.feature_names
preds, probs = [], []
for row in X_test:
    fd = {name: float(val) for name, val in zip(feature_names, row)}
    res = ensemble.predict_candidate(fd)
    prob = res["consensus_probability"]
    probs.append(prob)
    preds.append(1 if prob >= 0.5 else 0)

preds = np.array(preds)
probs = np.array(probs)

acc  = accuracy_score(y_test, preds)
f1   = f1_score(y_test, preds)
prec = precision_score(y_test, preds)
rec  = recall_score(y_test, preds)
auc  = roc_auc_score(y_test, probs)
cm   = confusion_matrix(y_test, preds)

print("=" * 55)
print("  ENSEMBLE STACKER — HELD-OUT TEST  (n=40, 80/20 split)")
print("=" * 55)
print(f"  Accuracy  : {acc:.4f}  ({acc*100:.1f}%)")
print(f"  F1-Score  : {f1:.4f}")
print(f"  Precision : {prec:.4f}")
print(f"  Recall    : {rec:.4f}")
print(f"  ROC-AUC   : {auc:.4f}")
print()
print("  Confusion Matrix:")
print(f"    TN={cm[0,0]}  FP={cm[0,1]}")
print(f"    FN={cm[1,0]}  TP={cm[1,1]}")
print()
print(classification_report(y_test, preds, target_names=["Unfavorable", "Favorable"]))

# ── 3. Per-base-model predictions variance ───────────────────────────────────
all_base = {"xgboost": [], "lightgbm": [], "random_forest": [], "mlp": []}
for row in X_test:
    fd = {name: float(val) for name, val in zip(feature_names, row)}
    res = ensemble.predict_candidate(fd)
    for k in all_base:
        all_base[k].append(res["base_model_predictions"][k])

print("=" * 55)
print("  BASE MODEL MEAN PROBABILITIES (test set)")
print("=" * 55)
for k, v in all_base.items():
    arr = np.array(v)
    pos_preds = (arr >= 0.5).sum()
    print(f"  {k:14s}: mean_prob={arr.mean():.4f}  std={arr.std():.4f}  predicted_positive={pos_preds}/{len(arr)}")

# ── 4. Pixel-level U-Net (from cached results) ───────────────────────────────
print()
print("=" * 55)
print("  U-NET SEGMENTATION  (n=24 patches, geog. held-out)")
print("=" * 55)
unet = {
    "mean_iou": 0.366, "iou_95_ci": [0.192, 0.526],
    "mean_dice": 0.410, "dice_95_ci": [0.222, 0.578],
    "object_precision": 0.500, "object_recall": 1.000,
    "fp_per_km2": 122.07
}
print(f"  Mean IoU      : {unet['mean_iou']:.3f}  CI={unet['iou_95_ci']}")
print(f"  Mean Dice(F1) : {unet['mean_dice']:.3f}  CI={unet['dice_95_ci']}")
print(f"  Obj Precision : {unet['object_precision']:.3f}")
print(f"  Obj Recall    : {unet['object_recall']:.3f}")
print(f"  FP / km²      : {unet['fp_per_km2']:.2f}  (high — small eval area: 0.0983 km²)")
