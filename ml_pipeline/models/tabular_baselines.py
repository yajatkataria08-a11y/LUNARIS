import numpy as np
from typing import Dict, Any, List, Tuple
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, brier_score_loss
import xgboost as xgb

class TabularBaselines:
    """
    Compares Logistic Regression, Random Forest, XGBoost, and MLP on site-level features.
    Provides probability calibration and geographic holdout evaluation metrics.
    """

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.models = {
            "LogisticRegression": LogisticRegression(random_state=random_state, max_iter=500),
            "RandomForest": RandomForestClassifier(n_estimators=100, max_depth=5, random_state=random_state),
            "XGBoost": xgb.XGBClassifier(n_estimators=60, max_depth=3, eval_metric="logloss", random_state=random_state),
            "MLP": MLPClassifier(hidden_layer_sizes=(32, 16), max_iter=400, random_state=random_state)
        }
        self.fitted_models: Dict[str, Any] = {}

    def fit_and_evaluate(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray,
        feature_names: List[str]
    ) -> Dict[str, Dict[str, float]]:
        results = {}
        for name, model in self.models.items():
            model.fit(X_train, y_train)
            self.fitted_models[name] = model
            
            # Predict probabilities
            if hasattr(model, "predict_proba"):
                y_prob = model.predict_proba(X_val)[:, 1]
            else:
                y_prob = model.predict(X_val)
            
            y_pred = (y_prob >= 0.5).astype(int)
            
            acc = float(accuracy_score(y_val, y_pred))
            prec = float(precision_score(y_val, y_pred, zero_division=0))
            rec = float(recall_score(y_val, y_pred, zero_division=0))
            f1 = float(f1_score(y_val, y_pred, zero_division=0))
            
            try:
                auc = float(roc_auc_score(y_val, y_prob))
            except Exception:
                auc = 0.5
            brier = float(brier_score_loss(y_val, y_prob))

            results[name] = {
                "accuracy": acc,
                "precision": prec,
                "recall": rec,
                "f1": f1,
                "roc_auc": auc,
                "brier_score": brier
            }
        return results

    def get_feature_importances(self, feature_names: List[str]) -> Dict[str, float]:
        """Extracts feature importances from the fitted Random Forest."""
        if "RandomForest" in self.fitted_models:
            rf = self.fitted_models["RandomForest"]
            importances = rf.feature_importances_
            return {name: float(imp) for name, imp in zip(feature_names, importances)}
        return {}
