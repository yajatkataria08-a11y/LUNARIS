import numpy as np
try:
    import scipy.ndimage
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False
    scipy = None
from typing import Dict, Any

class DEMFeatureExtractor:
    """
    Extracts geomorphometric terrain features from TMC-2 Digital Elevation Models:
    local slope, terrain roughness index (TRI), relief, and depression depth.
    """

    @staticmethod
    def extract_features(dem_patch: np.ndarray, pixel_scale_m: float = 5.0) -> Dict[str, float]:
        # Spatial gradients
        dy, dx = np.gradient(dem_patch, pixel_scale_m)
        slope_rad = np.arctan(np.sqrt(dx**2 + dy**2))
        slope_deg = np.degrees(slope_rad)
        
        # Terrain Roughness Index (Riley et al. 1999) - std dev in 3x3 local neighborhood
        if HAS_SCIPY and scipy is not None:
            tri = scipy.ndimage.generic_filter(dem_patch, np.std, size=3)
            local_max = scipy.ndimage.maximum_filter(dem_patch, size=15)
        else:
            tri = np.std(dem_patch)
            local_max = np.max(dem_patch)
        
        # Depression depth relative to local regional rim
        depression_depth = local_max - dem_patch
        max_depth_m = float(np.max(depression_depth))
        mean_slope = float(np.mean(slope_deg))
        rim_slope = float(np.percentile(slope_deg, 90))
        mean_tri = float(np.mean(tri))
        
        # Approach slope: flatness of the surrounding terrain (lower slope = safer landing/ingress)
        surrounding_mask = np.ones_like(dem_patch, dtype=bool)
        h, w = dem_patch.shape
        surrounding_mask[h//4:3*h//4, w//4:3*w//4] = False
        approach_slope_deg = float(np.mean(slope_deg[surrounding_mask]))

        return {
            "dem_max_depth_m": max_depth_m,
            "dem_mean_slope_deg": mean_slope,
            "dem_rim_slope_deg": rim_slope,
            "dem_approach_slope_deg": approach_slope_deg,
            "dem_roughness_tri": mean_tri,
            "dem_terrain_anomaly_score": float(np.clip(max_depth_m / 60.0, 0.0, 1.0))
        }
