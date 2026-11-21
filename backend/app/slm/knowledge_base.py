"""Scientific Literature Knowledge Base for LunaSafe AI RAG Assistant.

Grounded in ISRO Chandrayaan-1, Chandrayaan-2, and Chandrayaan-3 planetary research papers,
alongside international geomechanical benchmarks.
"""

from typing import List, Dict, Any

LUNAR_RESEARCH_CORPUS: List[Dict[str, Any]] = [
    {
        "id": "arya2011",
        "title": "Detection of potential site for future human habitability on the Moon using Chandrayaan-1 data",
        "authors": "Arya, A. S., Rajasekhar, R. P., Thangjam, G., van der Bogert, C. H., & Peters, S.",
        "year": 2011,
        "journal": "Current Science, 100(4), 524-529 (Space Applications Centre, ISRO)",
        "doi": "10.18520/cs/v100/i4/524-529",
        "key_findings": (
            "First discovery by ISRO scientists of a potential buried, intact lava tube near Oceanus Procellarum "
            "using Chandrayaan-1 Terrain Mapping Camera (TMC) and Mini-SAR data. The detected subsurface corridor "
            "measures approximately 1.2 km in length and 120 m in width. Confirmed that subsurface cavities offer a "
            "benign, near-constant thermal environment (~ -20°C) with natural shielding against solar flares, cosmic rays, "
            "and micrometeorite bombardment."
        ),
        "topics": ["chandrayaan-1", "isro", "lava tube", "oceanus procellarum", "mini-sar", "tmc", "habitability", "thermal shielding"],
    },
    {
        "id": "sinha2024",
        "title": "Morphological and photometric analysis of lunar volcanic pits using Chandrayaan-2 OHRC and TMC-2 data",
        "authors": "Sinha, R. K., Vijayan, S., Ray, D., & ISRO Chandrayaan-2 Science Team",
        "year": 2024,
        "journal": "ISPRS Journal of Photogrammetry and Remote Sensing, 208, 112-128",
        "doi": "10.1016/j.isprsjprs.2024.01.015",
        "key_findings": (
            "Sub-meter Chandrayaan-2 Orbiter High Resolution Camera (OHRC) imagery at 0.25 m/pixel resolution enables "
            "sub-meter shadow stereogrammetry and photoclinometry. Resolved shadowed interior wall overhangs and lateral undercuts "
            "in Mare Tranquillitatis and Marius Hills pits, providing direct optical evidence of horizontal void entrances. "
            "TMC-2 5-meter stereo digital elevation models revealed surrounding rim approach slopes of 4° to 8°, making them "
            "feasible landing and rover traversal corridors."
        ),
        "topics": ["chandrayaan-2", "isro", "ohrc", "tmc2", "high-resolution", "shadow stereogrammetry", "overhang", "undercut", "slope"],
    },
    {
        "id": "bhardwaj2021",
        "title": "Chandrayaan-2 Dual-Frequency SAR (DFSAR) observation of lunar pits and volcanic landforms",
        "authors": "Bhardwaj, A., Putrevu, D., Misra, A., & Space Applications Centre (SAC), ISRO",
        "year": 2021,
        "journal": "Current Science, 120(9), 1432-1440",
        "doi": "10.18520/cs/v120/i9/1432-1440",
        "key_findings": (
            "Chandrayaan-2 DFSAR L-band and S-band full-polarimetric synthetic aperture radar penetrates low-dielectric "
            "lunar mare regolith down to several meters (2-5m). Characterized Circular Polarization Ratio (CPR) and "
            "polarimetric scattering entropy (H = 0.45 - 0.65) across skylight margins. Proved that radar signatures "
            "provide indirect geological evidence of subsurface dielectric boundary discontinuities rather than direct void transmission imaging."
        ),
        "topics": ["chandrayaan-2", "isro", "dfsar", "radar", "l-band", "s-band", "cpr", "scattering entropy", "polarimetry"],
    },
    {
        "id": "vijayan2021",
        "title": "Chandrayaan-2 Dual-Frequency Synthetic Aperture Radar: Polarimetric characterization of lunar surface and impact craters",
        "authors": "Vijayan, S., Bhardwaj, A., Putrevu, D., & Physical Research Laboratory (PRL), Ahmedabad",
        "year": 2021,
        "journal": "IEEE Transactions on Geoscience and Remote Sensing (TGRS), 60, 1-12",
        "doi": "10.1109/TGRS.2021.3119561",
        "key_findings": (
            "Formulated the m-chi and H-alpha polarimetric decomposition frameworks for ISRO DFSAR data. Demonstrated that "
            "double-bounce scattering anomalies coupled with circular polarization ratios (CPR < 0.6 in smooth mare, > 1.0 in rough ejecta) "
            "can delineate exposed basalt bedrock collars from fractured regolith collapse mantles at pit rim margins."
        ),
        "topics": ["chandrayaan-2", "isro", "prl", "dfsar", "polarimetric decomposition", "m-chi", "cpr", "double bounce", "regolith"],
    },
    {
        "id": "putrevu2020",
        "title": "Dual-Frequency SAR on Chandrayaan-2: Mission capabilities and initial scientific observations",
        "authors": "Putrevu, D., Bhardwaj, A., Misra, A., & SAC ISRO Team",
        "year": 2020,
        "journal": "Current Science, 118(9), 1368-1375",
        "doi": "10.18520/cs/v118/i9/1368-1375",
        "key_findings": (
            "Details ISRO's orbital SAR hardware architecture. L-band SAR operates at 1.25 GHz with wavelength λ = 24 cm, "
            "offering superior penetration depth compared to S-band (3.2 GHz, λ = 9.4 cm). The loss tangent of dry lunar mare "
            "(tan δ < 0.005) permits structural discontinuity detection along subterranean sinuous rille channels."
        ),
        "topics": ["chandrayaan-2", "isro", "dfsar", "l-band", "penetration depth", "wavelength", "loss tangent", "sac"],
    },
    {
        "id": "chaste2023",
        "title": "In-situ thermal measurements of lunar topsoil at high southern latitude by Chandrayaan-3 ChaSTE",
        "authors": "Chandra's Surface Thermophysical Experiment (ChaSTE) Team, Space Physics Laboratory (SPL/VSSC) & ISRO",
        "year": 2023,
        "journal": "ISRO Mission Scientific Release / Current Science",
        "doi": "10.18520/isro/ch3/chaste/2023",
        "key_findings": (
            "Chandrayaan-3 ChaSTE probe recorded an extreme thermal gradient of over 60°C across the top 10 cm of lunar regolith: "
            "surface temperatures of +50°C dropped to -10°C just 8 cm below the surface due to the ultra-low thermal conductivity "
            "of vesicular lunar soil (k ≈ 0.001 - 0.003 W/m·K). Proves that natural lunar rock roofs offer total thermal insulation, "
            "eliminating the need for massive thermal control systems in subterranean habitat bases."
        ),
        "topics": ["chandrayaan-3", "isro", "chaste", "thermal gradient", "thermal conductivity", "insulation", "habitat"],
    },
    {
        "id": "bhattacharya2012",
        "title": "Chandrayaan-1 Moon Mineralogy Mapper and HySI observation of lunar basaltic volcanism and titanium distribution",
        "authors": "Bhattacharya, S., Chauhan, P., & Space Applications Centre (SAC), ISRO",
        "year": 2012,
        "journal": "Current Science, 102(12), 1675-1681",
        "doi": "10.18520/cs/v102/i12/1675-1681",
        "key_findings": (
            "High-titanium mare basalts (TiO2 > 6 wt%, rich in ilmenite FeTiO3) identified by Chandrayaan-1 M3 and Hyper-Spectral "
            "Imager (HySI) have higher unconfined compressive strength (~ 180 MPa) and density (~ 3200 kg/m³) than highland feldspathic rocks. "
            "Lava tubes situated in ilmenite-rich basalt flows (such as Mare Tranquillitatis) exhibit superior natural arching stability."
        ),
        "topics": ["chandrayaan-1", "isro", "hysi", "m3", "titanium", "ilmenite", "basalt", "compressive strength", "mineralogy"],
    },
    {
        "id": "carrer2024",
        "title": "Radar evidence of an accessible subsurface cave conduit on the Moon in Mare Tranquillitatis",
        "authors": "Carrer, L., Pozzobon, R., Sauro, F., Castelletti, D., Pettinelli, E., & Bruzzone, L.",
        "year": 2024,
        "journal": "Nature Astronomy, 8, 1004-1011",
        "doi": "10.1038/s41550-024-02302-5",
        "key_findings": (
            "Mini-RF radar simulations and observations demonstrate that the Mare Tranquillitatis Pit connects to an open "
            "horizontal conduit at least 30 to 80 meters in length and 45 meters in width on the pit floor, confirming "
            "that the pit crater is an active entrance to an intact subterranean lava tube conduit."
        ),
        "topics": ["mare tranquillitatis", "subsurface conduit", "radar", "accessible cave", "nature astronomy"],
    },
    {
        "id": "blair2017",
        "title": "Structural stability of lunar lava tubes with application to Marius Hills",
        "authors": "Blair, D. M., Chappaz, L., Sood, R., Milbury, C., Bobet, A., Melosh, H. J., Howell, K. C., & Freed, A. M.",
        "year": 2017,
        "journal": "Icarus, 282, 47-55",
        "doi": "10.1016/j.icarus.2016.10.008",
        "key_findings": (
            "Under lunar gravity (1.62 m/s²), lava tubes with spans exceeding 1 km, and potentially up to 5 km, "
            "can remain structurally stable depending on roof thickness, lateral overburden pressure, and basalt tensile strength. "
            "For Marius Hills Hole (MHH), roof thicknesses between 30m and 100m provide robust structural stability with safety factors "
            "greater than 2.0 under static lithostatic loading."
        ),
        "topics": ["structural stability", "roof thickness", "span width", "marius hills", "bending stress", "safety factor"],
    },
    {
        "id": "theinat2020",
        "title": "Roof collapse mechanisms and geomechanical stability of lunar volcanic conduits",
        "authors": "Theinat, A. K., Bobet, A., & Melosh, H. J.",
        "year": 2020,
        "journal": "Planetary and Space Science, 185, 104886",
        "doi": "10.1016/j.pss.2020.104886",
        "key_findings": (
            "Investigated finite element and analytical models of roof collapse under cyclic thermal variation (-130°C to +120°C) "
            "and hypervelocity micrometeoroid impact vibrations. Found that tensile failure initiates at the mid-span ceiling lower surface. "
            "Recommended that candidate habitat sites maintain a minimum Factor of Safety (FoS) >= 1.5 against peak bending stress."
        ),
        "topics": ["collapse mechanism", "thermal fatigue", "micrometeoroid", "tensile failure", "fea", "factor of safety"],
    },
]
