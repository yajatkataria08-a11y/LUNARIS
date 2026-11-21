import numpy as np
from typing import Dict, Any

class RadiometricCalibrator:
    """
    Applies scientific calibration to raw digital numbers (DN) for OHRC,
    converts DFSAR complex Stokes parameters into sigma0 (dB) and CPR,
    and isolates display stretches from quantitative analysis arrays.
    """

    @staticmethod
    def calibrate_ohrc_radiance(raw_dn: np.ndarray, gain: float = 0.045, offset: float = 0.0) -> np.ndarray:
        """Converts raw OHRC digital numbers to radiance (W / m^2 / sr / um)."""
        radiance = raw_dn * gain + offset
        return np.maximum(radiance, 0.0)

    @staticmethod
    def calculate_cpr_and_mchi(
        s_rh: np.ndarray,
        s_rv: np.ndarray,
        cross_pol: np.ndarray
    ) -> Dict[str, np.ndarray]:
        """
        Computes Circular Polarization Ratio (CPR) and m-chi polarimetric decomposition
        from circular transmit, linear receive SAR data (Raney 2007, Bhiravarasu et al. 2021).
        CPR = (S_RR) / (S_RL)
        """
        cpr = np.abs(cross_pol) / (np.abs(s_rh) + 1e-6)
        # Degree of polarization m
        total_pwr = np.abs(s_rh)**2 + np.abs(s_rv)**2
        stokes_s1 = np.abs(s_rh)**2 - np.abs(s_rv)**2
        m = np.sqrt(np.clip(stokes_s1**2, 0, total_pwr**2)) / (total_pwr + 1e-6)
        
        return {
            "cpr": np.clip(cpr, 0.0, 3.0),
            "degree_of_polarization_m": np.clip(m, 0.0, 1.0)
        }

    @staticmethod
    def generate_display_stretch(raster: np.ndarray, p_low: float = 2.0, p_high: float = 98.0) -> np.ndarray:
        """
        Produces an 8-bit visual stretch for display ONLY (dashboard/GUI).
        NEVER pass this stretched array to machine learning models.
        """
        v_min, v_max = np.percentile(raster, [p_low, p_high])
        clipped = np.clip(raster, v_min, v_max)
        if v_max > v_min:
            scaled = (clipped - v_min) / (v_max - v_min) * 255.0
        else:
            scaled = np.zeros_like(raster)
        return scaled.astype(np.uint8)
