/** Status assigned to a site after combining all three tasks. */
export type SiteStatus =
  | "PRIORITY_CANDIDATE" // strong evidence + stable roof estimate → worth follow-up first
  | "CANDIDATE" // plausible, but evidence is partial
  | "NEEDS_DATA" // too uncertain to rank with confidence
  | "UNSTABLE" // roof collapse risk looks high
  | "UNLIKELY"; // little evidence of a subsurface void

export type Terrain = "Mare" | "Highland" | "Rille" | "Crater floor";
export type CrackDensity = "low" | "moderate" | "high";

/** Task 1 — does a lava tube plausibly exist here? */
export interface TubeDetection {
  probability: number; // 0–1, model estimate that a sub-surface void exists
  opticalEvidence: number; // 0–1 (pits, sinuous rilles, collapse chains in imagery)
  radarEvidence: number; // 0–1 (sounder / SAR echo anomalies)
  gravityEvidence: number; // 0–1 (gravity-gradient anomaly consistent with a void)
  estWidthM: number | null; // estimated interior width
  estLengthKm: number | null; // estimated traceable length
}

/** Task 2 — skylight + roof. */
export interface RoofAnalysis {
  skylightDetected: boolean;
  skylightConfidence: number; // 0–1
  skylightDiameterM: number | null;
  skylightDepthM: number | null;
  roofThicknessM: number | null; // estimated rock cover above the void
  stability: number; // 0–1, higher = more stable
  crackDensity: CrackDensity;
  riskFlags: string[];
}

export interface ScoreDriver {
  feature: string;
  weight: number; // share of the total score (sums to 1 across drivers)
  value: number; // 0–1 normalised input
  contribution: number; // weight * value * 100 → points added to the 0–100 score
  description: string;
}

export interface SiteRecord {
  id: string;
  name: string;
  region: string;
  lat: number; // degrees north
  lon: number; // degrees east, −180…180
  terrain: Terrain;
  detection: TubeDetection;
  roof: RoofAnalysis;
  /** 0–1: how unsure the model is overall. Drives the ± band on the score. */
  uncertainty: number;
  /** Provenance flags: every number in the bundled demo set is a placeholder, not model output. */
  isKnownPit: boolean; // the location corresponds to a published pit/skylight
  isSynthetic: boolean; // the location itself is invented for the demo
  dataSource: string;
  /** Things that must be measured on-site before anyone trusts this estimate. */
  validationNeeded: string[];
  humanVerdict?: "PROMISING" | "REJECT" | "UNRESOLVED";
  notes?: string;
}

export interface RankedSite extends SiteRecord {
  rank: number;
  habitatScore: number; // 0–100
  scoreLow: number;
  scoreHigh: number;
  status: SiteStatus;
  drivers: ScoreDriver[];
}
