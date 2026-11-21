# Appendix: Pipeline Module Reference (M3b – M9)
## Document Reference for LunaSafe-AI Architecture

This document provides technical reference details for secondary and future modules cut or deferred from the Release 1 core execution path.

---

### M3b — Geological Context
- **Purpose:** Regional geomorphology and volcanic terrain classification (mare basalt vs highland impact).
- **Inputs:** LROC WAC global basemaps, USGS lunar geologic charts (LGC).
- **Output:** Geological origin context layer and volcanic plausibility score.
- **Rule:** Volcanic proximity (e.g. sinuous rille axis) cannot be counted as independent from DEM surface sag when both arise from the same lava channel.

---

### M3c — Area-Level Screening
- **Purpose:** Broad regional screening for areas warranting targeted high-resolution stereo or radar re-targeting.
- **Scope Limitation:** Area-level screening is NOT candidate detection. An area-level volcanic score must never be used to claim an uncollapsed tube.

---

### M4 — Radar Polarimetry Evidence (DFSAR / Mini-RF)
- **Purpose:** Evaluation of Circular Polarization Ratio (CPR), backscatter coefficient ($\sigma^0$), and m-chi polarimetric decomposition.
- **Physical Interpretation:** Radar backscatter anomalies reflect surface roughness and dielectric permittivity variations; they do not uniquely certify an open subsurface conduit without bistatic or sounding geometry (Carrer et al. 2024).

---

### M4b — Thermal Inertia Evidence (Diviner)
- **Purpose:** Anisothermal surface signature detection.
- **Limitation:** Coarse Diviner footprint ($\sim 250\text{--}500\text{ m}$) cannot isolate narrow ($<50\text{ m}$) skylight openings without extensive sub-pixel deconvolution.

---

### M5 — Subsurface Void Evidence Inference (Pathway A Only)
- **Scope in Release 1:** Pathway A only.
- **Method:** Synthesizes available evidence groups using dependency-deflated weights.
- **Output:** Qualitative candidate dossier listing:
  * Number of independent supporting evidence streams.
  * Active sensor contradictions (if any).
  * Missing observation modalities.
  * Explicit rejection of posterior probability calculations ($P(\text{void}) = \text{UNASSERTED}$).

---

### M6 — Exploratory Geomechanics (Deferred from Release 1)
- **Rationale for Deferral:** Subsurface span $S$ and roof thickness $t$ are unconstrained from orbit. Intact rock strengths ($5\text{--}10\text{ MPa}$ tensile) overstate fractured lunar rock masses.
- **Future Scope:** When seismic or ground-penetrating radar data become available, run 2D/3D numerical continuum models across scenario ranges ($\sigma_{tm} \in [0.8, 1.5]\text{ MPa}$) rather than single deterministic safety factors.

---

### M7 — Profile-Specific Decision Ranking (Deferred from Release 1)
- **Rationale for Deferral:** Multi-criteria additive scoring risks compensatory masking (e.g. high landing scores compensating for unverified void stability).
- **Future Scope:** Profile funnels (Scientific Exploration, Speleology, Ingress) with non-compensatory elimination gates.

---

### M8 — Validation & Test Governance
- **Validation Ladder:** Enforces V0 (Software Sanity), V1 (Annotation QA), V2 (Component metrics), V3 (Grouped splits), V6 (Case retrodiction).
- **Unattainable Levels:** V8 (Multi-institutional independent review) and V9 (In-situ ground truth) are formally documented as currently unattainable.

---

### M9 — Value-of-Information (VOI) Research Planning
- **Purpose:** Recommends optimal follow-up satellite targeting (e.g. high-resolution OHRC stereo pairs or Mini-RF radar passes) to resolve specific candidate uncertainties.
