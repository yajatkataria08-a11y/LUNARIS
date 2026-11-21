import numpy as np
from typing import Dict, Any, Tuple

class ProductLoader:
    """
    Loads and parses remote-sensing products (OHRC, TMC-2, DFSAR).
    Handles calibration offsets, nodata masking, and metadata extraction.
    """

    @staticmethod
    def synthesize_candidate_scene(
        site_name: str,
        pit_diameter_m: float = 80.0,
        pit_depth_m: float = 40.0,
        has_subsurface_anomaly: bool = True,
        grid_dim: int = 256
    ) -> Dict[str, Any]:
        """
        Synthesizes a physically consistent multi-sensor test tile
        matching Chandrayaan-2 instrument characteristics for testing the pipeline.
        - OHRC: 0.25 m/pixel optical reflectance
        - TMC-2: 5.0 m/pixel elevation (DEM)
        - DFSAR: 2.0 m/pixel radar backscatter (dB) and CPR
        """
        rng = np.random.RandomState(abs(hash(site_name)) % (2**31))
        
        # 1. OHRC Optical Image (256x256, 0.25m/px -> 64m x 64m region)
        # Deep shadow within pit, illuminated basalt wall, surrounding regolith
        ohrc = rng.normal(loc=120.0, scale=12.0, size=(grid_dim, grid_dim))
        y, x = np.ogrid[:grid_dim, :grid_dim]
        center = (grid_dim // 2, grid_dim // 2)
        radius_px = int((pit_diameter_m / 2.0) / 0.25)
        dist_from_center = np.sqrt((x - center[0])**2 + (y - center[1])**2)
        
        # Pit shadow interior (low DN) and bright sunlit rim wall
        pit_mask = dist_from_center <= radius_px
        sun_direction = (1.0, 0.5)  # azimuth from NW
        sun_proj = (x - center[0]) * sun_direction[0] + (y - center[1]) * sun_direction[1]
        
        ohrc[pit_mask & (sun_proj < 0)] = rng.normal(loc=15.0, scale=3.0, size=np.sum(pit_mask & (sun_proj < 0)))  # shadow
        ohrc[pit_mask & (sun_proj >= 0)] = rng.normal(loc=185.0, scale=15.0, size=np.sum(pit_mask & (sun_proj >= 0))) # illuminated wall
        ohrc = np.clip(ohrc, 0, 255).astype(np.float32)

        # 2. TMC-2 DEM (Elevation in meters, relative datum)
        # Regional slope + sharp depression where the pit exists
        base_elevation = -1200.0 + (x * 0.1) - (y * 0.05)
        dem = base_elevation.astype(np.float32) + rng.normal(0, 0.4, (grid_dim, grid_dim))
        # Excavate pit depression
        dem[pit_mask] -= (pit_depth_m * (1.0 - (dist_from_center[pit_mask] / (radius_px + 1e-5))**2))

        # 3. DFSAR L-band & S-band Backscatter & CPR
        # Background regolith: sigma0 ~ -16 dB, CPR ~ 0.35
        # Rough blocky pit rim / talus: sigma0 ~ -8 dB, CPR ~ 0.85
        # Subsurface void / dielectric anomaly: diffuse polarimetric response
        radar_sigma0_db = rng.normal(-16.0, 1.5, (grid_dim, grid_dim)).astype(np.float32)
        radar_cpr = rng.normal(0.35, 0.08, (grid_dim, grid_dim)).astype(np.float32)
        
        rim_ring = (dist_from_center >= radius_px - 8) & (dist_from_center <= radius_px + 8)
        radar_sigma0_db[rim_ring] += 7.0  # high backscatter from collapsed blocks
        radar_cpr[rim_ring] = np.clip(radar_cpr[rim_ring] + 0.45, 0.1, 1.8)

        if has_subsurface_anomaly:
            # Linear conduit anomaly extending from pit along rille axis
            conduit_mask = (np.abs(y - center[1]) < 12) & (x > center[0]) & (x < center[0] + 80)
            radar_cpr[conduit_mask] += 0.25
            radar_sigma0_db[conduit_mask] += 3.5

        return {
            "site_name": site_name,
            "ohrc": ohrc,
            "dem": dem,
            "dfsar_sigma0": radar_sigma0_db,
            "dfsar_cpr": radar_cpr,
            "ground_truth_mask": pit_mask.astype(np.uint8),
            "metadata": {
                "crs": "IAU2000:30100",
                "pixel_size_ohrc_m": 0.25,
                "pixel_size_dem_m": 5.0,
                "pixel_size_dfsar_m": 2.0,
                "pit_diameter_m": pit_diameter_m,
                "pit_depth_m": pit_depth_m,
                "has_subsurface_anomaly": has_subsurface_anomaly
            }
        }
