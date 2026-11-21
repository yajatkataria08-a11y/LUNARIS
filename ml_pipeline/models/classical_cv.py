import numpy as np
import cv2
from typing import Dict, Any, Tuple

class ClassicalCVBaseline:
    """
    Baseline 1: Classical morphological computer vision detector.
    Uses edge gradients, adaptive thresholding, and circular Hough transform
    as an interpretable, transparent baseline.
    """

    def __init__(self, min_radius_px: int = 15, max_radius_px: int = 90):
        self.min_radius = min_radius_px
        self.max_radius = max_radius_px

    def detect(self, ohrc_image: np.ndarray) -> Dict[str, Any]:
        img_norm = cv2.normalize(ohrc_image, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        blurred = cv2.GaussianBlur(img_norm, (9, 9), 2)
        
        # Hough Circle Transform for circular depressions
        circles = cv2.HoughCircles(
            blurred,
            cv2.HOUGH_GRADIENT,
            dp=1.2,
            minDist=40,
            param1=50,
            param2=30,
            minRadius=self.min_radius,
            maxRadius=self.max_radius
        )
        
        detected_mask = np.zeros_like(img_norm, dtype=np.uint8)
        candidates = []
        if circles is not None:
            circles = np.uint16(np.around(circles))
            for i in circles[0, :]:
                cx, cy, r = int(i[0]), int(i[1]), int(i[2])
                cv2.circle(detected_mask, (cx, cy), r, 1, -1)
                candidates.append({"center_x": cx, "center_y": cy, "radius": r})

        confidence = 0.75 if len(candidates) > 0 else 0.15
        return {
            "predicted_mask": detected_mask,
            "candidate_count": len(candidates),
            "candidates": candidates,
            "baseline_confidence": confidence
        }
