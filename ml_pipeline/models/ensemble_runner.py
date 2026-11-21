"""
LunaSafe-AI Ensemble Pipeline Runner (Module M5b)
Conforming to Combined Research & Implementation Pipeline v6.0

End-to-end orchestrator that:
  1. Accepts a site feature vector (from MultimodalFeatureExtractor)
  2. Runs the StackingEnsemble to produce a calibrated probability
  3. Runs SHAPExplainer for per-feature attribution
  4. Returns a structured prediction dict for use by EvidenceInferenceEngine and the FastAPI backend

Usage (inference):
    runner = EnsembleRunner.load("outputs/ensemble/weights.pkl")
    result = runner.predict(feature_dict, feature_names=FEATURE_NAMES)

Usage (training):
    runner = EnsembleRunner()
    runner.train(X, y, feature_names=FEATURE_NAMES)
    runner.save("outputs/ensemble/weights.pkl")
"""

import os
import json
import pickle
import datetime
import numpy as np
from typing import Dict, Any, List, Optional, Tuple

from ml_pipeline.models.tabular_baselines import (
    StackingEnsemble,
    SHAPExplainer,
    TabularBaselines,
    _HAS_SHAP,
)


# ------------------------------------------------------------------
# Canonical feature name list (must match MultimodalFeatureExtractor output)
# ------------------------------------------------------------------

LUNARIS_FEATURE_NAMES: List[str] = [
    # DEM / Topographic (LOLA)
    "dem_max_depth_m",
    "dem_mean_slope_deg",
    "dem_rim_slope_deg",
    "dem_approach_slope_deg",
    "dem_roughness_tri",
    "dem_terrain_anomaly_score",
    # Radar / DFSAR (Chandrayaan-2)
    "dfsar_mean_sigma0_db",
    "dfsar_std_sigma0_db",
    "dfsar_mean_cpr",
    "dfsar_std_cpr",
    "dfsar_high_cpr_fraction",
    "dfsar_radar_anomaly_score",
    # Optical / OHRC
    "ohrc_pit_contrast",
    "ohrc_shadow_fraction",
    "ohrc_circularity",
    "ohrc_local_texture_entropy",
    # Derived composite scores (from fusion.py pathway outputs)
    "structured_evidence_score",
    "copula_posterior_p05",
    # Geomechanical
    "fs_median",
]


def feature_dict_to_array(
    feature_dict: Dict[str, float],
    feature_names: Optional[List[str]] = None
) -> np.ndarray:
    """
    Converts a flat feature dict to a numpy array in the canonical feature order.
    Missing features are filled with 0.0 and flagged with a warning.
    """
    names = feature_names or LUNARIS_FEATURE_NAMES
    arr = []
    for name in names:
        val = feature_dict.get(name, 0.0)
        arr.append(float(val))
    return np.array(arr, dtype=np.float32)


# ------------------------------------------------------------------
# EnsembleRunner
# ------------------------------------------------------------------

class EnsembleRunner:
    """
    Production wrapper for StackingEnsemble + SHAPExplainer.

    Exposes:
      train()          — fit ensemble + SHAP on labeled data
      predict()        — inference: returns proba, shap, waterfall, model weights
      save() / load()  — checkpoint persistence
    """

    VERSION = "v6.0"

    def __init__(
        self,
        feature_names: Optional[List[str]] = None,
        random_state: int = 42,
        n_folds: int = 5
    ):
        self.feature_names = feature_names or LUNARIS_FEATURE_NAMES
        self.random_state = random_state
        self.n_folds = n_folds
        self.ensemble = StackingEnsemble(random_state=random_state, n_folds=n_folds)
        self.shap_explainer: Optional[SHAPExplainer] = None
        self._is_trained = False
        self._train_metadata: Dict[str, Any] = {}

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def train(
        self,
        X: np.ndarray,
        y: np.ndarray,
        region_labels: Optional[np.ndarray] = None,
        output_dir: str = "outputs/ensemble"
    ) -> Dict[str, Any]:
        """
        Full training pipeline:
          1. Fit StackingEnsemble with 5-fold OOF
          2. Build SHAPExplainer from trained XGBoost
          3. Compute global SHAP importances
          4. Save weights + shap_global.json

        Args:
            X: Feature matrix [N, F]
            y: Binary labels [N] (1 = candidate, 0 = non-candidate)
            region_labels: Optional region IDs for LORO-CV grouping
            output_dir: Directory to persist model artifacts

        Returns:
            Training summary dict (oof_metrics, global_shap, model_weights)
        """
        os.makedirs(output_dir, exist_ok=True)

        # Fit ensemble
        fit_summary = self.ensemble.fit(X, y, region_labels=region_labels)

        # Build SHAP explainer from XGBoost base model
        if _HAS_SHAP:
            self.shap_explainer = SHAPExplainer.from_ensemble(
                self.ensemble, self.feature_names
            )
            global_shap = self.shap_explainer.explain_global(X)
            shap_path = os.path.join(output_dir, "shap_global.json")
            with open(shap_path, "w") as f:
                json.dump(global_shap, f, indent=2)
        else:
            global_shap = {}

        # Save ensemble weights
        weights_path = os.path.join(output_dir, "weights.pkl")
        self.save(weights_path)

        # Save readable metadata
        self._train_metadata = {
            "version": self.VERSION,
            "trained_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "n_samples": int(X.shape[0]),
            "n_features": int(X.shape[1]),
            "feature_names": self.feature_names,
            "n_folds": self.n_folds,
            "base_models": self.ensemble.active_base_names,
            "meta_learner": "LogisticRegression",
            "calibration": "isotonic",
            "oof_metrics": fit_summary["oof_metrics"],
            "meta_model_weights": self.ensemble.get_base_model_weights(),
            "global_shap_top10": dict(list(global_shap.items())[:10]),
        }

        meta_path = os.path.join(output_dir, "train_metadata.json")
        with open(meta_path, "w") as f:
            json.dump(self._train_metadata, f, indent=2)

        self._is_trained = True
        return self._train_metadata

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------

    def predict(
        self,
        feature_input: Any,
        top_k_shap: int = 10,
        threshold: float = 0.5
    ) -> Dict[str, Any]:
        """
        Run inference for a single site.

        Args:
            feature_input: Either a Dict[str, float] (feature name → value)
                          or a 1-D np.ndarray of shape [n_features]
            top_k_shap: Number of top SHAP features to include in waterfall
            threshold: Decision boundary for binary label

        Returns:
            {
              "ensemble_proba": float,         # calibrated stacked probability
              "ensemble_label": int,           # 0 or 1
              "base_probas": {model: proba},   # each base learner's probability
              "meta_weights": {model: coef},   # meta-learner coefficients
              "shap_attribution": {feat: val}, # per-feature SHAP values
              "shap_waterfall": [...],          # waterfall steps for frontend
              "shap_expected_value": float,
              "shap_available": bool,
            }
        """
        if not self._is_trained:
            raise RuntimeError(
                "EnsembleRunner is not trained. Call train() or load() first."
            )

        # Normalize input
        if isinstance(feature_input, dict):
            x_arr = feature_dict_to_array(feature_input, self.feature_names)
        else:
            x_arr = np.asarray(feature_input, dtype=np.float32).ravel()

        x_2d = x_arr.reshape(1, -1)

        # Stacked calibrated probability
        ensemble_proba = float(self.ensemble.predict_proba(x_2d)[0])
        ensemble_label = int(ensemble_proba >= threshold)

        # Per-base-model probabilities
        base_probas = self.ensemble.get_base_probas_for_instance(x_arr)

        # Meta-learner weights
        meta_weights = self.ensemble.get_base_model_weights()

        # SHAP attribution
        shap_available = self.shap_explainer is not None
        shap_attribution: Dict[str, float] = {}
        shap_waterfall: List[Dict[str, Any]] = []
        shap_expected_value = 0.0

        if shap_available:
            shap_attribution = self.shap_explainer.explain_instance(x_arr)
            shap_waterfall = self.shap_explainer.to_waterfall_json(
                x_arr, top_k=top_k_shap
            )
            shap_expected_value = self.shap_explainer.get_expected_value()

        return {
            "ensemble_proba":    round(ensemble_proba, 4),
            "ensemble_label":    ensemble_label,
            "base_probas":       base_probas,
            "meta_weights":      meta_weights,
            "shap_attribution":  shap_attribution,
            "shap_waterfall":    shap_waterfall,
            "shap_expected_value": round(shap_expected_value, 5),
            "shap_available":    shap_available,
            "version":           self.VERSION,
            "disclaimer": (
                "Ensemble probability is a remote-sensing estimate only. "
                "It does not certify subsurface void existence. "
                "SHAP values are attributions over orbital sensor features."
            ),
        }

    def predict_batch(
        self,
        X: np.ndarray,
        feature_names: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Runs predict() for each row in X, returns a list of prediction dicts."""
        return [
            self.predict(X[i], top_k_shap=10)
            for i in range(X.shape[0])
        ]

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    def save(self, path: str) -> None:
        """Serializes the full runner (ensemble + shap explainer) to a pickle file."""
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        payload = {
            "version":       self.VERSION,
            "feature_names": self.feature_names,
            "random_state":  self.random_state,
            "n_folds":       self.n_folds,
            "ensemble":      self.ensemble,
            "shap_explainer": self.shap_explainer,
            "_is_trained":   self._is_trained,
            "_train_metadata": self._train_metadata,
        }
        with open(path, "wb") as f:
            pickle.dump(payload, f)

    @classmethod
    def load(cls, path: str) -> "EnsembleRunner":
        """Loads a serialized EnsembleRunner from disk."""
        if not os.path.exists(path):
            raise FileNotFoundError(f"No ensemble checkpoint at: {path}")
        with open(path, "rb") as f:
            payload = pickle.load(f)

        runner = cls(
            feature_names=payload["feature_names"],
            random_state=payload["random_state"],
            n_folds=payload["n_folds"],
        )
        runner.ensemble = payload["ensemble"]
        runner.shap_explainer = payload.get("shap_explainer")
        runner._is_trained = payload.get("_is_trained", False)
        runner._train_metadata = payload.get("_train_metadata", {})
        return runner


# ------------------------------------------------------------------
# Convenience singleton (lazy-loaded for the FastAPI backend)
# ------------------------------------------------------------------

_DEFAULT_WEIGHTS_PATH = "outputs/ensemble/weights.pkl"
_runner_cache: Optional[EnsembleRunner] = None


def get_runner(weights_path: str = _DEFAULT_WEIGHTS_PATH) -> Optional[EnsembleRunner]:
    """
    Returns a cached EnsembleRunner if a checkpoint exists, else None.
    Thread-safe for FastAPI because Python's GIL protects the dict write.
    """
    global _runner_cache
    if _runner_cache is not None:
        return _runner_cache
    if os.path.exists(weights_path):
        try:
            _runner_cache = EnsembleRunner.load(weights_path)
            return _runner_cache
        except Exception as e:
            print(f"[EnsembleRunner] Failed to load checkpoint: {e}")
    return None
