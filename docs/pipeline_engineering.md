# Appendix: Engineering, Schemas & Data Access
## LunaSafe-AI Engineering Specification

---

## 1. Data Access Appendix

This appendix documents official scientific archives and tooling requirements for acquiring and processing lunar remote-sensing products.

### 1.1 Planetary Data Archives

| Mission / Instrument | Data Type | Primary Scientific Archive | Access Status |
| :--- | :--- | :--- | :---: |
| **LRO: LROC NAC** | High-res optical ($0.5\text{ m/px}$) | [NASA PDS Geosciences / LROC Archive](https://lroc.sese.asu.edu/) | Open Access (PDS4) |
| **LRO: LOLA DEM** | Polar elevation & regional topography | [NASA PDS LOLA Node](https://pds-geosciences.wustl.edu/missions/lro/lola.htm) | Open Access |
| **LRO: Diviner** | Thermal radiometry | [NASA PDS Diviner Node](https://pds-geosciences.wustl.edu/missions/lro/diviner.htm) | Open Access |
| **Chandrayaan-2: OHRC** | High-res optical ($0.25\text{ m/px}$) | [ISRO ISSDC PRADAN Portal](https://pradan.issdc.gov.in/ch2/) | Registered User Access |
| **Chandrayaan-2: TMC-2** | Stereo DEM ($5\text{ m/px}$) | [ISRO ISSDC PRADAN Portal](https://pradan.issdc.gov.in/ch2/) | Registered User Access |
| **Chandrayaan-2: DFSAR** | L & S band polarimetric SAR | [ISRO ISSDC PRADAN Portal](https://pradan.issdc.gov.in/ch2/) | Registered User Access |
| **GRAIL** | Bouguer gravity gradient anomalies | [NASA PDS Geosciences GRAIL Node](https://pds-geosciences.wustl.edu/grail/) | Open Access |

### 1.2 Tooling & Geospatial Libraries

- **GDAL / rasterio:** Used for affine matrix coordinate transformations, GeoTIFF serialization, and resampling.
- **USGS ISIS3 (Integrated Software for Imagers and Spectrometers):** Industry-standard pipeline for ingesting raw LROC EDR/CDR cubes, performing radiometric spice calibration (`spiceinit`), and map project conversions (`cam2map`). *(Tagged: `[UNVERIFIED_IN_LOCAL_HOST]` — local run uses pre-calibrated GeoTIFF/Numpy arrays).*

---

## 2. Automated Validation Schemas (Pydantic)

All pipeline data exchanges are governed by strict Pydantic schemas in `ml_pipeline/core/validators.py`:

```python
class EvidenceItemSchema(BaseModel):
    evidence_id: str
    modality: Literal["optical", "dem", "radar", "thermal", "gravity", "geology"]
    feature_name: str
    observed_value: Optional[float]
    status: Literal["IMPLEMENTED", "EXPERIMENTAL", "SIMULATED", "HEURISTIC", "UNTRAINED", "UNAVAILABLE"]
    origin_category: Literal["REAL", "SYNTHETIC", "AUGMENTED/ANALOG", "SIMULATED", "UNKNOWN"]
    quality_state: Literal["ACCEPTED", "ACCEPTED_WITH_LIMITATION", "RESTRICTED", "REJECTED"]
    source_id: str
    nominal_weight: float = Field(default=1.0, ge=0.0, le=5.0)

class CandidateDossierSchema(BaseModel):
    candidate_id: str
    region_name: str
    coordinates: Dict[str, float]
    claim_type: Literal["CLAIM_1_OBSERVABLE_PIT", "CLAIM_2_UNOBSERVABLE_VOID"]
    detection_summary: Dict[str, Any]
    evidence_ledger: List[EvidenceItemSchema]
    active_contradictions: List[Dict[str, Any]]
    missing_modalities: List[str]
    abstain: bool
    abstain_reason: Optional[str]
    status: str
```

---

## 3. Cryptographic Manifest Specification

Every execution generates a tamper-evident run manifest containing:
1. `run_id` and ISO 8601 UTC timestamp.
2. Code commit and pipeline version.
3. Random seed and execution environment metadata.
4. Stage lifecycle states (`PENDING`, `RUNNING`, `SUCCESS`, `FAILED`, `SKIPPED`, `UNAVAILABLE`).
5. SHA-256 checksums of every generated artifact and raw input dataset.
6. Top-level `manifest_sha256` self-checksum.

---

## 4. API & Application Security Controls

1. **Atomic File Locking:** Uses `filelock.FileLock` on state JSON stores to prevent race conditions during concurrent user reviews.
2. **Stateless Tokens:** Review submissions are signed with cryptographic tokens preventing unauthenticated tampering.
3. **Defensive Schema Parsing:** Frontend API client normalizes missing attributes before passing them to visual dashboards.
