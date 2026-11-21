import numpy as np
import cv2
from typing import Dict, Any

class OHRCFeatureExtractor:
    """
    Extracts physically meaningful optical morphology features from OHRC imagery:
    shadow geometry, rim eccentricity, circularity, and pit boundary properties.
    """

    @staticmethod
    def extract_features(ohrc_patch: np.ndarray, pixel_scale_m: float = 0.25) -> Dict[str, float]:
        patch_norm = cv2.normalize(ohrc_patch, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        
        # 1. Shadow detection via Otsu thresholding in lower intensity range
        blur = cv2.GaussianBlur(patch_norm, (5, 5), 0)
        _, thresh = cv2.threshold(blur, 40, 255, cv2.THRESH_BINARY_INV)
        
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        diameter_m = 0.0
        eccentricity = 0.0
        solidity = 0.0
        shadow_area_m2 = 0.0
        contrast_ratio = float(np.mean(ohrc_patch) / (np.min(ohrc_patch) + 1e-4))
        
        if contours:
            largest = max(contours, key=cv2.contourArea)
            area_px = cv2.contourArea(largest)
            shadow_area_m2 = float(area_px * (pixel_scale_m ** 2))
            
            if len(largest) >= 5:
                # Fit ellipse
                (x, y), (d1, d2), angle = cv2.fitEllipse(largest)
                major = max(d1, d2)
                minor = min(d1, d2)
                diameter_m = float(major * pixel_scale_m)
                eccentricity = float(np.sqrt(1.0 - (minor / (major + 1e-5))**2))
            
            hull = cv2.convexHull(largest)
            hull_area = cv2.contourArea(hull)
            solidity = float(area_px / (hull_area + 1e-5))

        return {
            "ohrc_diameter_m": diameter_m,
            "ohrc_shadow_area_m2": shadow_area_m2,
            "ohrc_eccentricity": eccentricity,
            "ohrc_solidity": solidity,
            "ohrc_contrast_ratio": contrast_ratio,
            "ohrc_feature_presence_score": float(np.clip(shadow_area_m2 / 1000.0, 0.0, 1.0))
        }
