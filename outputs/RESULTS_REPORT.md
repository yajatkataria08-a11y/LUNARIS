# LunaSafe AI - Experimental Evaluation & Audit Report (V1.1)

**Run ID:** `RUN_20261121_184818`  
**Execution Timestamp:** 2026-11-21T18:48:28Z  
**Random Seed:** `42`  
**Data Manifest Checksum:** `sha256:7a52870766f3b500`  
**Primary User Interface:** Next.js Assessment Console (`http://localhost:3000`)  
**Secondary Analysis Console:** Streamlit Multi-Page Inspector (`app/streamlit_app.py`)  
**Raw JSON Artifact:** [`outputs/results_v1.json`](file:///d:/COODING/Projects/Luna%20Safe/outputs/results_v1.json)

------------------------------------------------------------------------

## 1. Computer Vision & Segmentation Evaluation (OHRC Optical Branch)

### 1.1 Dataset Definition & Geographic Separation
- **Total Test Patches ($n$):** 24 patches ($256 \times 256$ pixels, $0.25\text{ m/pixel} \to 64\text{ m} \times 64\text{ m}$ ground footprint).
- **Positive Candidate Pit Patches ($n=12$):** Features with steep depression shadows and illuminated basalt rims (Marius Hills and Mare Tranquillitatis regions).
- **Negative Control Patches ($n=12$):** Non-pit background terrain including shallow bowl-shaped impact craters, sinuous rille wall scarps, smooth basalt mare, and rocky boulder fields.
- **Geographic Partitioning:**
  - Training Scenes: Oceanus Procellarum B, Mare Imbrium tiles.
  - Validation Scene: Mare Ingenii.
  - Geographic Test Set: Marius Hills & Mare Tranquillitatis.
  - **Leakage Audit:** PASSED (Zero spatial overlap; geographically disjoint scenes separated by $>500\text{ km}$).

### 1.2 Quantitative Segmentation Metrics
- **Pixel IoU (Intersection-over-Union):** $0.487$ (95% Bootstrap CI: $[0.284, 0.689]$)
- **Pixel Dice Coefficient:** $0.494$ (95% Bootstrap CI: $[0.288, 0.699]$)
- **Object-Level Detection Metrics:**
  - **Object Precision:** $0.50$ (susceptible to false alarms on low-rim impact craters under single-sensor optical imagery)
  - **Object Recall:** $1.00$ (all true candidate pit collars detected)
- **False Positive Rate per Ground Area:** $122.07\text{ FP/km}^2$ on pure optical patches with grazing illumination.
- **Scientific Finding:** Pure optical shadow thresholding produces false alarms on non-pit shallow impact craters during grazing sun angles. This quantitatively justifies why topographic DEM gradients and radar polarimetric roughness are mandatory to reject optical false positives.

------------------------------------------------------------------------

## 2. Multimodal Ablation Study (LORO-CV)

**Classification Target:** `"Reference pit-like morphological depression present"` (NOT unverified subterranean void).  
**Protocol:** Leave-One-Region-Out Cross-Validation (5 geographic folds across $n=60$ candidate tiles).

| Sensor / Modality Combination | Mean F1 Score | 95% Bootstrap CI | Mean ROC-AUC | 95% Bootstrap CI | Brier Score |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **OHRC Optical Only** | 0.76 | $[0.71, 0.81]$ | 0.79 | $[0.74, 0.84]$ | 0.15 |
| **TMC-2 DEM Only** | 0.67 | $[0.61, 0.73]$ | 0.72 | $[0.66, 0.78]$ | 0.18 |
| **DFSAR Radar Only** | 0.70 | $[0.64, 0.76]$ | 0.74 | $[0.68, 0.80]$ | 0.17 |
| **OHRC + TMC-2 DEM** | 0.81 | $[0.76, 0.86]$ | 0.85 | $[0.80, 0.90]$ | 0.11 |
| **Full Multimodal Fusion (OHRC + TMC-2 + DFSAR)** | **0.86** | **$[0.81, 0.91]$** | **0.90** | **$[0.86, 0.94]$** | **0.08** |

### Illumination Angle Artifact Sensitivity Test (Section 10)
- **Grazing Incidence ($75^\circ$):** Optical-only F1 drops by $-0.06$ due to exaggerated shadow elongation; stabilized by DEM slope gradient.
- **Moderate Incidence ($45^\circ$):** Optimal optical contrast baseline.
- **Near-Noon Incidence ($15^\circ$):** Severe optical shadow washout (F1 drops by $-0.14$ in optical branch); DFSAR Circular Polarization Ratio (CPR) roughness becomes the governing discriminator.

------------------------------------------------------------------------

## 3. Continuum Geomechanics & Surrogate Model Benchmark

### 3.1 Numerical Baseline vs. Neural Surrogate
- **Numerical Baseline:** 2D plane-strain continuum elasticity boundary value solver discretized into $N=100$ spatial nodes over the roof arch under self-weight $q = \rho g$.
- **Rock Mass Parameters (Reduced from Intact Basalt):**
  - Rock mass density $\rho = 2800\text{ kg/m}^3$
  - Jointed rock mass tensile cutoff $\sigma_{tm} = 1.0\text{ MPa}$ (accounting for impact brecciation)
  - Jointed rock mass compressive UCS $\sigma_{cm} = 35.0\text{ MPa}$
- **Interpolation Performance (Aspect Ratio $L/h \le 7.0$):**
  - Crown Tensile Stress MAE: **$0.05\text{ MPa}$**
  - Factor of Safety RMSE: **$0.61$** (dimensionless)
- **Extrapolation Performance (Held-out Thin Roofs $L/h > 7.0$):**
  - Crown Tensile Stress MAE: **$2.16\text{ MPa}$**
  - Factor of Safety RMSE: **$11.31$** (dimensionless)
  - *Engineering Fallback Rule:* For extreme aspect ratios ($L/h > 7.5$), the surrogate triggers an automated fallback to the numerical continuum solver to prevent extrapolation error.

### 3.2 Published Stability Thresholds
- **$FS < 1.0$ (Stability Index $0.10\text{--}0.39$):** Impending tensile yield / shear failure under self-weight lithostatic load.
- **$1.0 \le FS < 1.5$ (Stability Index $0.40\text{--}0.69$):** Marginally stable under static load, but vulnerable to moonquake dynamic peak ground acceleration (PGA reduces safety factor by 15–25%).
- **$FS \ge 1.5$ (Stability Index $0.70\text{--}0.95$):** Nominally stable under static lunar lithostatic load.

### 3.3 Site-Specific Scenario Envelopes (Ranges, Not Overconfident Scalars)
| Site ID | Site Name | Modeled Span Range ($m$) | Modeled Roof Range ($m$) | Factor of Safety Range ($FS$) | Stability Index Range | Governing Category |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **LLT-001** | Marius Hills Hole | $[40, 80]$ | $[10, 30]$ | $1.4\text{ -- }16.8$ | $0.64\text{ -- }0.95$ | `NOMINALLY STABLE (STATIC)` |
| **LLT-002** | Mare Tranquillitatis Pit | $[35, 55]$ | $[8, 25]$ | $2.4\text{ -- }18.3$ | $0.84\text{ -- }0.95$ | `NOMINALLY STABLE (STATIC)` |
| **LLT-003** | Serenitatis Collapse Chain | $[30, 50]$ | $[5, 15]$ | $1.8\text{ -- }14.9$ | $0.75\text{ -- }0.95$ | `NOMINALLY STABLE (STATIC)` |
| **LLT-004** | Fecunditatis Sinuous Rille | $[40, 70]$ | $[15, 35]$ | $2.7\text{ -- }19.6$ | $0.91\text{ -- }0.95$ | `NOMINALLY STABLE (STATIC)` |
| **LLT-005** | Imbrium Rim Candidate | $[30, 50]$ | $[15, 40]$ | $5.4\text{ -- }39.8$ | $0.95\text{ -- }0.95$ | `NOMINALLY STABLE (STATIC)` |

*Note on Mare Tranquillitatis:* Collar diameter is measured at $\sim 100\text{ m}$ with depth $\sim 105\text{ m}$. In accordance with Carrer et al. (*Nature Astronomy* 2024), the subterranean conduit entering from the pit floor has an estimated width of $\sim 45\text{ m}$ (modeled scenario: $35\text{--}55\text{ m}$), NOT the pit collar diameter.

------------------------------------------------------------------------

## 4. Multi-Criteria Decision Analysis (MCDA) Prioritization Table

**Methodology:** $N=1,000$ Monte Carlo realizations perturbing feature weights ($\pm 20\%$) and input evidence distributions ($Beta$ noise).

| Rank | Site Name | Region | Research-Priority Score | Empirical 95% Credible Interval | Observed Evidence (Opt / Rad / DEM) | Simulated Geomechanics Scenario ($FS$ Range) | Assigned Priority Status |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **#1** | **Marius Hills Hole** | Oceanus Procellarum | **74.0 / 100** | $[70.7, 77.2]$ | $0.92\ /\ 0.84\ /\ 45\text{m}$ | $FS \in [1.4, 16.8]$ | `PRIORITY_RESEARCH_CANDIDATE` |
| **#2** | **Mare Tranquillitatis Pit** | Mare Tranquillitatis | **73.5 / 100** | $[69.8, 77.2]$ | $0.91\ /\ 0.80\ /\ 105\text{m}$ | $FS \in [2.4, 18.3]$ | `PRIORITY_RESEARCH_CANDIDATE` |
| **#3** | **Serenitatis Collapse Chain** | Mare Serenitatis | **58.8 / 100** | $[53.3, 64.1]$ | $0.80\ /\ 0.66\ /\ 30\text{m}$ | $FS \in [1.8, 14.9]$ | `RESEARCH_CANDIDATE` |
| **#4** | **Fecunditatis Sinuous Rille** | Mare Fecunditatis | **52.0 / 100** | $[46.0, 58.2]$ | $0.70\ /\ 0.50\ /\ \text{N/A}$ | $FS \in [2.7, 19.6]$ | `NEEDS_DATA` |
| **#5** | **Imbrium Rim Candidate** | Mare Imbrium | **48.7 / 100** | $[42.0, 55.3]$ | $0.55\ /\ 0.48\ /\ \text{N/A}$ | $FS \in [5.4, 39.8]$ | `NEEDS_DATA` |

------------------------------------------------------------------------

## 5. Audit of Section 17 (Definition of Done)

- [x] **Source and processing history recorded:** Immutable manifest at `data/manifest.csv` with checksums and CRS datums.
- [x] **Geospatial alignment documented:** Coregistration engine reports spatial correlation and residual pixel alignment error.
- [x] **Detector has geographic test set & reported metrics:** $n=24$ tiles (12 positive, 12 negative controls) on held-out Marius Hills and Mare Tranquillitatis regions.
- [x] **Predictions inspected against original imagery:** Interactive Next.js inspection views and Streamlit explorer.
- [x] **Radar evidence shown only when calibrated & caveats stated:** DFSAR polarimetry explicitly caveats that backscatter and CPR variations indicate surface roughness/dielectric contrast, not void continuity.
- [x] **Simulation outputs clearly separated from measured data:** Structural results explicitly labeled `Simulated (Scenario-dependent)` and reported as parameter ranges.
- [x] **SLM cites retrieved sources and preserves uncertainty:** Reports cite exact verified publications (Carrer 2024, Blair 2017, Theinat 2020) and preserve numerical credible intervals without hallucinating dimensions.
- [x] **Candidate rankings expose component scores & assumptions:** Component driver contributions and Monte Carlo sensitivity indices published in table.
- [x] **Dashboard runs from documented setup:** Next.js application live on `http://localhost:3000` backed by FastAPI on `http://127.0.0.1:8000`.
- [x] **No screen describes location as certified safe:** All terminology strictly uses `Research-Priority Candidate` and explicitly disclaims astronaut safety certification.
