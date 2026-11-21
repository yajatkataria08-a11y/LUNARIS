# LunaSafe AI: Advanced Machine Learning & Explainability Pipeline
## Integrating Attention U-Net, Multi-Modal Stacking Ensembles, Geomechanical Constraints, and SHAP XAI
**Document Version:** 2.0 --- Scientific Architecture Specification  
**Project:** Lunar Lava Tube Subsurface Habitat & Roof-Stability Mapper  
**Target Modalities:** Chandrayaan-2 (OHRC, TMC-2, DFSAR) & NASA LRO  

---

## 1. Executive Summary & Vision

The objective of this pipeline is to transition **LunaSafe AI** from a prototype heuristic baseline into a **state-of-the-art, scientifically rigorous, and fully explainable planetary remote sensing system**.

Standard deep learning systems for remote sensing often suffer from two major flaws:
1. **Black-Box Opacity:** High-capacity neural networks predict candidate features without attributing which physical signals (shadow depth, rim slope, radar backscatter) drove the prediction.
2. **Physical Detachment:** Naive machine learning models lack physical guardrails, predicting high habitat safety in areas that violate basic rock geomechanics or lack ground-truth confirmation.

This pipeline solves both challenges by fusing:
- **Attention U-Net** for multi-scale optical skylight segmentation.
- **Deep Feature Engineering** extracting geometric, morphometric, topographic, and polarimetric radar proxies.
- **Heterogeneous Stacking Ensemble (XGBoost + LightGBM + Random Forest + MLP)** for candidate classification and habitability ranking.
- **SHAP (SHapley Additive exPlanations)** for game-theoretic feature attribution and model transparency.
- **Physics-Informed Geomechanical Scenarios** based on Blair et al. (2017) and Theinat et al. (2020) acting as hard mathematical boundaries.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                LUNASAFE AI ML PIPELINE                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
            │                                 │                               │
            ▼                                 ▼                               ▼
    [Chandrayaan-2 OHRC]             [Chandrayaan-2 TMC-2]           [Chandrayaan-2 DFSAR]
   0.25 m/px Optical Image              5.0 m/px DEM Grid            L- & S-Band Polarimetry
            │                                 │                               │
            ▼                                 ▼                               ▼
   ┌─────────────────┐               ┌─────────────────┐             ┌─────────────────┐
   │ Attention U-Net │               │ Topographic     │             │ Polarimetric    │
   │ Segmentation    │               │ Feature Vector  │             │ Feature Vector  │
   │ (Skip-Gate CNN) │               │ (Slope, RMS)    │             │ (m-χ, Entropy)  │
   └─────────────────┘               └─────────────────┘             └─────────────────┘
            │                                 │                               │
            │ Extracted Morphology            │ Elevation Relief              │ Dielectric Anomaly
            └─────────────────────────┬───────┴───────────────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │ Multi-Modal Feature Pool  │
                        │ (Tabular Embeddings)      │
                        └───────────────────────────┘
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            ▼                                                   ▼
 ┌──────────────────────┐                           ┌───────────────────────┐
 │ Stacking Ensemble    │                           │ Physics Geomechanics  │
 │ (XGBoost + LightGBM  │                           │ (Blair / Theinat FEA  │
 │  + Random Forest)    │                           │  Analytical Baseline) │
 └──────────────────────┘                           └───────────────────────┘
            │                                                   │
            │ Calibrated Probability                            │ Tensile FoS & Stress
            └─────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │ Multi-Criteria Habitat    │
                        │ Ranking & Priority Grade  │
                        └───────────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │ SHAP (XAI) Engine         │
                        │ • Waterfall Attribution   │
                        │ • Summary Beeswarm Plots  │
                        │ • Non-Linear Interactions │
                        └───────────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │ Four-Tier Traceable Audit │
                        │ OBSERVED · PREDICTED      │
                        │ SIMULATED · UNKNOWN       │
                        └───────────────────────────┘
```

---

## 2. Research Foundation & Peer-Reviewed Basis

| Paper & Citation | Scientific Finding | Application in LunaSafe AI Pipeline |
| :--- | :--- | :--- |
| **Sinha et al. (2024)**<br>*Automated Lunar Crater Identification with Chandrayaan-2 TMC-2 Images using Deep CNNs*<br>Sci Rep 14:5843. `doi:10.1038/s41598-024-58438-4` | Demonstrates deep CNNs on Chandrayaan-2 TMC-2 images. Emphasizes that crater detectors must be differentiated from steep-walled volcanic pits. | Informs our U-Net loss function (Focal + Dice) to suppress circular shallow crater false positives and isolate deep shadow skylights. |
| **Oktay et al. (2018)**<br>*Attention U-Net: Learning Where to Look for the Pancreas*<br>MIDL 2018. `arXiv:1804.03999` | Introduces attention gates into skip connections to eliminate irrelevant background features while amplifying target structures. | Replaces standard U-Net skip connections with Attention Gates to focus specifically on lunar pit rims and dark shadow boundaries. |
| **Blair et al. (2017)**<br>*The Structural Stability of Lunar Lava Tubes*<br>Icarus 282, pp. 47-55. `doi:10.1016/j.icarus.2016.10.008` | Proves that tensile rock bending stress at the roof crown is the primary structural failure mode; roof stability scales with $W^2 / t$. | Serves as our physics constraint module for calculating maximum ceiling bending stress and Factor of Safety (FoS). |
| **Theinat et al. (2020)**<br>*Lunar Lava Tubes: Morphology to Structural Stability*<br>Icarus 338, 113442. `doi:10.1016/j.icarus.2019.113442` | Shows that elliptical arch geometries convert vertical bending stresses into arch thrust compression, dramatically increasing stability. | Informs our 2D geometry generator and arch reduction factor $\eta_{\text{arch}}$. |
| **Bhardwaj et al. (2021)**<br>*Chandrayaan-2 DFSAR: Performance Characterization & Initial Results*<br>Planet. Sci. J. 2:93. `doi:10.3847/PSJ/abfdbf` | Details L-band & S-band fully polarimetric radar backscatter ($\sigma^0$), circular polarization ratios ($CPR$), and scattering entropy. | Governs our DFSAR feature extraction: radar backscatter and scattering entropy are treated strictly as dielectric roughness proxies. |
| **Lundberg & Lee (2017)**<br>*A Unified Approach to Interpreting Model Predictions*<br>NeurIPS 2017. `arXiv:1705.07874` | Establishes SHAP (Shapley Additive exPlanations) as the only attribution method satisfying Efficiency, Symmetry, and Additivity. | Generates local candidate waterfall plots and global feature attribution for the stacking ensemble. |

---

## 3. Mathematical & Algorithmic Formulation

### 3.1 Attention U-Net Formulation

In standard U-Net, low-level spatial features from the encoder are concatenated directly to decoder features, propagating background noise from highland terrain and craters.

The **Attention Gate (AG)** filters the skip connection features $x^l$ using the coarser gating vector $g^l$ from the deeper decoder stage:

$$\chi = \sigma_1 \left( W_x^T x_i^l + W_g^T g_i + b_g \right)$$

$$\alpha_i^l = \sigma_2 \left( \psi^T \chi + b_\psi \right)$$

$$\hat{x}_i^l = \alpha_i^l \cdot x_i^l$$

Where:
- $W_x \in \mathbb{R}^{F_l \times F_{\text{int}}}$ and $W_g \in \mathbb{R}^{F_g \times F_{\text{int}}}$ are $1 \times 1$ convolutions.
- $\sigma_1$ is the ReLU activation function: $\sigma_1(z) = \max(0, z)$.
- $\sigma_2$ is the Sigmoid activation function: $\sigma_2(z) = \frac{1}{1 + e^{-z}}$.
- $\alpha_i^l \in [0, 1]$ represents the attention coefficient scaling spatial pixel $i$.

#### Compound Loss Function for Lunar Pit Segmentation
Lunar pits occupy $< 0.1\%$ of optical scenes (extreme class imbalance). We optimize a compound **Focal + Dice + Boundary Loss**:

$$\mathcal{L}_{\text{total}} = \mathcal{L}_{\text{Focal}} + \lambda_1 \mathcal{L}_{\text{Dice}} + \lambda_2 \mathcal{L}_{\text{Boundary}}$$

$$\mathcal{L}_{\text{Focal}}(p, y) = - \alpha_t (1 - p_t)^\gamma \log(p_t) \quad (\gamma = 2.0, \alpha = 0.75)$$

$$\mathcal{L}_{\text{Dice}}(p, y) = 1 - \frac{2 \sum_i p_i y_i + \epsilon}{\sum_i p_i + \sum_i y_i + \epsilon}$$

$$\mathcal{L}_{\text{Boundary}}(s, G) = \int_{\Omega} \phi_G(x) \cdot s(x) \, dx$$

Where $\phi_G(x)$ is the distance map from the ground truth pit boundary, penalizing boundary delineation errors on pit rims.

---

### 3.2 Heterogeneous Stacking Ensemble

Rather than relying on a single classifier, we employ a two-level **Stacking Ensemble**:

```
Base Level 0 Models:
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  XGBoost Tree   │     │   LightGBM       │     │  Random Forest   │     │ Multi-Layer      │
│  Classifier     │     │   Fast Tree      │     │  Bagging Trees   │     │ Perceptron (MLP) │
└────────┬────────┘     └────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                       │                        │                        │
         ▼                       ▼                        ▼                        ▼
       p₁(x)                   p₂(x)                    p₃(x)                    p₄(x)
         └───────────────────────┴───────────┬────────────┴────────────────────────┘
                                             │
                                             ▼
                               ┌───────────────────────────┐
                               │  Meta-Learner Level 1     │
                               │  (L2 Regularized Logistic │
                               │   + Temperature Scaling)  │
                               └─────────────┬─────────────┘
                                             │
                                             ▼
                                  Calibrated Consensus
                                  Candidate Probability
```

1. **Level-0 Base Learners:**
   - **XGBoost:** Gradient boosted decision trees using second-order Taylor expansion on loss.
   - **LightGBM:** Leaf-wise tree growth with Gradient-Based One-Side Sampling (GOSS), maximizing split gain on small feature subsets.
   - **Random Forest:** Bootstrap aggregated bagging of unpruned trees to reduce variance.
   - **Multi-Layer Perceptron (MLP):** 3-layer neural network with Dropout ($p=0.2$) and BatchNorm to learn continuous non-linear representations.

2. **Cross-Validated Out-of-Fold Predictions:**
   To prevent data leakage into the meta-learner, Level-0 models are trained via 5-fold stratified cross-validation.

3. **Level-1 Meta-Learner:**
   A constrained Ridge Logistic Regression meta-learner calculates the final consensus prediction:

$$\hat{y} = \sigma \left( \sum_{k=1}^K w_k p_k(x) + w_0 \right) \quad \text{s.t.} \quad w_k \ge 0, \quad \sum w_k = 1$$

---

### 3.3 SHAP (SHapley Additive exPlanations) Engine

SHAP attributes the contribution $\phi_i$ of each feature $i$ to the final candidate score based on cooperative game theory:

$$\phi_i(f, x) = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|! (|F| - |S| - 1)!}{|F|!} \left[ f_x(S \cup \{i\}) - f_x(S) \right]$$

Where:
- $F$ is the total set of features.
- $S$ is a subset of features excluding feature $i$.
- $f_x(S)$ is the conditional expectation of the model prediction given features in $S$.

#### Why SHAP is Crucial for LunaSafe AI:
1. **Local Explanation (Waterfall Plot):** For any specific skylight (e.g., Marius Hills Hole), SHAP reveals exactly why the model scored it high (e.g., $+24\%$ from steep interior shadow, $+18\%$ from low rim slope, $-12\%$ from thin roof estimate).
2. **Global Feature Ranking (Beeswarm Summary):** Shows across the entire lunar catalog which features separate true collapse pits from impact craters.
3. **SHAP Interaction Values:** Measures non-linear coupling (e.g., high radar backscatter is favorable *only* when slope is low; on steep crater walls, radar backscatter is merely geometric foreshortening).

---

### 3.4 Geomechanical Physics Constraint Module

In accordance with **Blair et al. (2017)** and **Theinat et al. (2020)**, remote-sensing predictions must be strictly bounded by rock mechanics:

1. **Distributed Self-Weight Load ($q$ in $\text{N/m}^2$):**
$$q = \rho \cdot g_{\text{moon}} \cdot t + q_{\text{overburden}}$$
Where $\rho = 3000\text{ kg/m}^3$, $g_{\text{moon}} = 1.62\text{ m/s}^2$, and $t$ is roof thickness in meters.

2. **Maximum Ceiling Tensile Bending Stress ($\sigma_{\text{max}}$ in $\text{MPa}$):**
$$\sigma_{\text{max}} = \left( \frac{q \cdot W^2}{2 t^2} \right) \cdot \eta_{\text{arch}}$$
Where:
- $W$ is the cavity span in meters.
- $\eta_{\text{arch}}$ is the shape factor: $\eta = 1.0$ for flat beam, $\eta = \max(0.20, \frac{1}{1 + 3(H/W)})$ for semi-elliptical arch.

3. **Tensile Factor of Safety ($\text{FoS}$):**
$$\text{FoS} = \frac{\sigma_{\text{tensile limit}}}{\sigma_{\text{max}}} \quad (\sigma_{\text{tensile limit}} \approx 10.0\text{ MPa for intact lunar basalt})$$

4. **Maximum Center Roof Deflection ($\delta_{\text{max}}$ in $\text{mm}$):**
$$\delta_{\text{max}} = \left( \frac{\rho g_{\text{moon}} W^4}{32 E t^2} \right) \cdot \eta_{\text{arch}} \cdot 1000$$
Where $E = 50\text{ GPa}$.

---

## 4. Multi-Modal Feature Vector Specification

The ensemble model consumes an 18-dimensional standardized feature vector extracted from the three Chandrayaan-2 modalities and physics simulations:

```json
{
  "feature_vector": {
    "optical_morphology": {
      "pit_area_px": "Total segmented dark interior pixels",
      "pit_diameter_m": "Equivalent circular diameter (2 * sqrt(Area / pi) * res)",
      "aspect_ratio": "Bounding box width / height (regularity proxy)",
      "shadow_contrast_ratio": "Mean pit interior brightness / surrounding rim brightness",
      "unet_confidence": "Attention U-Net sigmoid probability"
    },
    "terrain_elevation": {
      "mean_slope_deg": "Mean surface slope in 250m buffer from TMC-2 DEM",
      "max_slope_deg": "99th percentile rim slope (degrees)",
      "elevation_range_m": "Local relief difference (max_elev - min_elev)",
      "roughness_rms": "Root mean square elevation deviation",
      "terrain_curvature": "Profile Laplacian curvature (convexity/concavity)"
    },
    "radar_polarimetry": {
      "sigma0_mean_db": "DFSAR calibrated backscatter cross-section",
      "sigma0_std_db": "Backscatter spatial standard deviation",
      "scattering_entropy": "Shannon entropy proxy of polarimetric response",
      "dielectric_roughness": "Roughness indicator (std_db / 10 * entropy)"
    },
    "geomechanical_physics": {
      "roof_thickness_m": "Simulated rock cover scenario assumption",
      "span_width_m": "Cavity horizontal diameter",
      "bending_stress_mpa": "Calculated maximum ceiling tensile stress",
      "safety_factor_fos": "Tensile rock Factor of Safety (FoS)"
    }
  }
}
```

---

## 5. End-to-End Implementation Blueprint

### Phase 1: Deep Vision Module (`backend/app/ml/attention_unet.py`)
- Implement `AttentionGate`, `ResidualDoubleConv`, `AttentionUNet`.
- Implement `CompoundFocalDiceLoss`.
- Implement Test-Time Augmentation (TTA: 4-fold dihedral rotation & flip averaging during inference).

### Phase 2: Feature Extraction Pipeline (`backend/app/ml/feature_extractor.py`)
- Transform segmentation masks and GeoTIFFs into the 18D tabular vector.
- Standardize missing modalities with explicit `is_present` flags and neutral priors.

### Phase 3: Heterogeneous Stacking Ensemble (`backend/app/ml/ensemble_stacker.py`)
- Implement base models: `XGBClassifier`, `LGBMClassifier`, `RandomForestClassifier`, `PyTorch MLP`.
- Implement 5-fold cross-validated out-of-fold stacking with Ridge Logistic Meta-Learner.
- Calibrate probabilities with Platt Scaling / Isotonic Regression.

### Phase 4: SHAP Explainability Engine (`backend/app/ml/shap_explainer.py`)
- Implement `shap.TreeExplainer` for tree models and `shap.KernelExplainer` for ensemble consensus.
- Generate local candidate waterfall JSON outputs:
  $$\hat{y} = \mathbb{E}[f(x)] + \sum_{i=1}^{M} \phi_i$$
- Generate global feature importance summary arrays.

### Phase 5: REST API Integration (`backend/app/api/routes/ensemble.py`)
- `POST /api/v1/ensemble/predict`: Evaluates candidate feature vector through the stacking ensemble.
- `GET /api/v1/ensemble/shap/{candidate_id}`: Returns SHAP waterfall breakdown (base value, feature contributions, and force plot data).
- `GET /api/v1/ensemble/global-importance`: Returns global feature importance rankings.

### Phase 6: Frontend Console Visualization
- Connect the SHAP waterfall data into the frontend's [ScoreBreakdown.tsx](file:///c:/LunaSafe%20AI/frontend/src/components/lunar/ScoreBreakdown.tsx).
- Display green/red attribution bars showing which features increased or decreased the site's suitability.

---

## 6. Definition of Done & Scientific Integrity Checklist

- [ ] **No Fabricated Certainty:** Detecting a skylight never asserts the existence of an uncollapsed tube.
- [ ] **Additive Faithfulness:** $\sum \phi_i = f(x) - \mathbb{E}[f(x)]$ holds mathematically for all SHAP explanations.
- [ ] **Physical Plausibility:** Any candidate with $\text{FoS} < 1.0$ is forced into `UNSTABLE / HIGH_COLLAPSE_RISK` regardless of visual appearance.
- [ ] **Traceability:** Every explanation retains the 4-tier data separation (`OBSERVED`, `PREDICTED`, `SIMULATED`, `UNKNOWN`).
