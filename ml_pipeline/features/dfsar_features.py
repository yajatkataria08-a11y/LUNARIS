"""
Chandrayaan-2 Dual-Frequency Synthetic Aperture Radar (DFSAR) Polarimetric Feature Extractor.
Implements m-chi Decomposition, Circular Polarization Ratio (CPR), and Stokes Parameter Inversion.

References:
- Bhardwaj, A., et al. (2021). "Chandrayaan-2 Dual-Frequency SAR: Polarimetric calibration and initial lunar surface observations." IEEE TGRS.
- Raney, R. K. (2007). "Hybrid-Polarity SAR Architecture." IEEE TGRS.
- Vijayan, S., et al. (2021). "DFSAR Polarimetric scattering over lunar impact craters and candidate volcanic features." Curr. Sci.
"""

import numpy as np
from typing import Dict, Any, Tuple, Optional


class DFSARFeatureExtractor:
    """
    Extracts calibrated radar polarimetric features from Chandrayaan-2 DFSAR products:
    - Stokes parameters (S0, S1, S2, S3)
    - Circular Polarization Ratio (CPR)
    - m-chi decomposition (Double-bounce, Volume/diffuse, Surface/Bragg scattering)
    - Cavity roof intactness indicator
    """

    @staticmethod
    def extract_features(
        sigma0_db: np.ndarray,
        cpr: np.ndarray,
        stokes_s3: Optional[np.ndarray] = None
    ) -> Dict[str, float]:
        """
        Extracts foundational and advanced polarimetric metrics from DFSAR backscatter grids.
        """
        mean_sigma0 = float(np.mean(sigma0_db))
        std_sigma0 = float(np.std(sigma0_db))
        mean_cpr = float(np.mean(cpr))
        std_cpr = float(np.std(cpr))
        high_cpr_fraction = float(np.mean(cpr > 1.0))

        # Reconstruct total backscattered power S0 in linear scale
        s0_linear = np.power(10.0, sigma0_db / 10.0)

        # Estimate Stokes S3 (circular Stokes component) from CPR if not explicitly provided
        # CPR = (S0 - S3) / (S0 + S3)  =>  S3 = S0 * (1 - CPR) / (1 + CPR)
        if stokes_s3 is None:
            safe_cpr = np.clip(cpr, 0.01, 10.0)
            s3 = s0_linear * ((1.0 - safe_cpr) / (1.0 + safe_cpr))
        else:
            s3 = stokes_s3

        # Degree of polarization m (typically 0.65 - 0.95 for lunar surface)
        m = np.clip(np.sqrt(np.maximum(0.0, s0_linear**2 - s3**2)) / (s0_linear + 1e-7), 0.1, 0.99)

        # m-chi polarimetric decomposition (Raney 2007)
        # chi: Poincare ellipticity angle, sin(2*chi) = -S3 / (m * S0)
        sin_2chi = np.clip(-s3 / (m * s0_linear + 1e-7), -1.0, 1.0)

        # 1. Double-bounce power (steep vertical basalt cliff walls / pit rim blocks)
        p_double = 0.5 * m * s0_linear * (1.0 - sin_2chi)

        # 2. Volume/diffuse scattering power (subsurface cavity rubble / multi-bounce void roof)
        p_volume = s0_linear * (1.0 - m)

        # 3. Surface/Bragg scattering power (diffuse mare regolith)
        p_surface = 0.5 * m * s0_linear * (1.0 + sin_2chi)

        tot_p = p_double + p_volume + p_surface + 1e-7
        frac_double = float(np.mean(p_double / tot_p))
        frac_volume = float(np.mean(p_volume / tot_p))
        frac_surface = float(np.mean(p_surface / tot_p))

        # Cavity roof intactness indicator: high volume scattering coupled with localized double bounce
        intact_roof_indicator = float(np.clip((frac_volume * 2.2) + (frac_double * 1.5) - (frac_surface * 0.8), 0.0, 1.0))

        # Overall radar anomaly score combining CPR, power, and decomposition
        radar_anomaly_score = float(np.clip(
            (mean_cpr - 0.3) / 0.7 * 0.4 +
            (mean_sigma0 + 18.0) / 10.0 * 0.3 +
            intact_roof_indicator * 0.3,
            0.0, 1.0
        ))

        return {
            "dfsar_mean_sigma0_db": mean_sigma0,
            "dfsar_std_sigma0_db": std_sigma0,
            "dfsar_mean_cpr": mean_cpr,
            "dfsar_std_cpr": std_cpr,
            "dfsar_high_cpr_fraction": high_cpr_fraction,
            "dfsar_radar_anomaly_score": radar_anomaly_score,
            "dfsar_m_chi_frac_volume": frac_volume,
            "dfsar_m_chi_frac_double": frac_double,
            "dfsar_m_chi_frac_surface": frac_surface,
            "dfsar_cavity_roof_intactness": intact_roof_indicator,
        }
