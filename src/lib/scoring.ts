import type { RankedSite, ScoreDriver, SiteRecord, SiteStatus } from "./types";

/**
 * Transparent habitat-suitability score.
 * Each driver is normalised to 0–1, multiplied by its weight, and summed to a 0–100 score.
 * These weights are a *design choice for ranking*, not a validated engineering standard.
 */
export const SCORE_WEIGHTS = {
  tube: 0.28,
  roofStability: 0.28,
  size: 0.14,
  shielding: 0.12,
  access: 0.1,
  terrain: 0.08,
} as const;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** Interior width gives usable floor area. ~100 m+ is generous for a first outpost, <20 m is cramped. */
function sizeValue(widthM: number | null): number {
  if (widthM == null) return 0;
  return clamp01((widthM - 10) / 110);
}

/** Rock cover shields radiation and micrometeorites; the benefit saturates around ~10 m. */
function shieldingValue(thicknessM: number | null): number {
  if (thicknessM == null) return 0;
  return clamp01(thicknessM / 10);
}

/** A detectable skylight is an entry point but also a collapse hint, so access is only part of the story. */
function accessValue(s: SiteRecord): number {
  if (!s.roof.skylightDetected) return 0.2; // might still be enterable by drilling or a side collapse
  const d = s.roof.skylightDiameterM ?? 0;
  const widthOk = clamp01(d / 60);
  return clamp01(0.4 + 0.6 * widthOk * s.roof.skylightConfidence);
}

/** Flat, low-latitude mare is easier to land on and gets steadier sunlight/thermal conditions. */
function terrainValue(s: SiteRecord): number {
  const base = s.terrain === "Mare" ? 0.9 : s.terrain === "Crater floor" ? 0.6 : s.terrain === "Rille" ? 0.55 : 0.4;
  const latPenalty = clamp01(Math.abs(s.lat) / 90) * 0.4;
  return clamp01(base - latPenalty);
}

/** Return a safe detection sub-object even when the API sends a malformed record. */
function safeDetection(s: SiteRecord): SiteRecord["detection"] {
  return s.detection ?? {
    probability: 0,
    opticalEvidence: 0,
    radarEvidence: 0,
    gravityEvidence: 0,
    estWidthM: null,
    estLengthKm: null,
  };
}

/** Return a safe roof sub-object even when the API sends a malformed record. */
function safeRoof(s: SiteRecord): SiteRecord["roof"] {
  return s.roof ?? {
    skylightDetected: false,
    skylightConfidence: 0,
    skylightDiameterM: null,
    skylightDepthM: null,
    roofThicknessM: null,
    stability: 0,
    crackDensity: "moderate" as const,
    riskFlags: ["Data unavailable — treat all estimates as unreliable"],
  };
}

export function computeDrivers(s: SiteRecord): ScoreDriver[] {
  const W = SCORE_WEIGHTS;
  const det = safeDetection(s);
  const roof = safeRoof(s);
  // Build a normalised site view so sub-helpers (accessValue, terrainValue) are safe too.
  const safe: SiteRecord = { ...s, detection: det, roof };
  const raw: Array<[string, number, number, string]> = [
    ["Lava-tube likelihood", W.tube, det.probability, "Combined optical, radar and gravity evidence for a sub-surface void."],
    ["Roof stability", W.roofStability, roof.stability, "Estimated resistance to collapse given span, thickness and fractures."],
    ["Usable size", W.size, sizeValue(det.estWidthM), "Estimated interior width, a proxy for floor area."],
    ["Radiation / impact shielding", W.shielding, shieldingValue(roof.roofThicknessM), "Rock cover between the habitat and the surface."],
    ["Entry access", W.access, accessValue(safe), "A skylight of workable size gives a candidate entry point."],
    ["Terrain & landing", W.terrain, terrainValue(safe), "Flat low-latitude mare is easier to reach and operate on."],
  ];
  return raw.map(([feature, weight, value, description]) => ({
    feature,
    weight,
    value: clamp01(value ?? 0),
    contribution: weight * clamp01(value ?? 0) * 100,
    description,
  }));
}

export function classify(s: SiteRecord, score: number): SiteStatus {
  const det = safeDetection(s);
  const roof = safeRoof(s);
  if (det.probability < 0.25) return "UNLIKELY";
  if (roof.stability < 0.35 || roof.crackDensity === "high") return "UNSTABLE";
  if ((s.uncertainty ?? 1) > 0.5) return "NEEDS_DATA";
  if (score >= 62 && roof.stability >= 0.6) return "PRIORITY_CANDIDATE";
  return "CANDIDATE";
}

export function rankSites(sites: SiteRecord[]): RankedSite[] {
  const scored = sites.map((s) => {
    const drivers = computeDrivers(s);
    const score = drivers.reduce((a, d) => a + d.contribution, 0);
    const band = 4 + s.uncertainty * 26; // wider band when we are less sure
    return {
      ...s,
      rank: 0,
      habitatScore: score,
      scoreLow: Math.max(0, score - band),
      scoreHigh: Math.min(100, score + band),
      status: classify(s, score),
      drivers,
    } satisfies RankedSite;
  });
  // Tiered ranking: well-supported sites first, then "needs data", then unstable/unlikely,
  // whatever their raw score. Within a tier, higher score wins.
  const tier = (st: SiteStatus) => (st === "UNSTABLE" || st === "UNLIKELY" ? 2 : st === "NEEDS_DATA" ? 1 : 0);
  scored.sort((a, b) => tier(a.status) - tier(b.status) || b.habitatScore - a.habitatScore);
  scored.forEach((s, i) => (s.rank = i + 1));
  return scored;
}

export function answerQuestions(s: RankedSite) {
  const det = safeDetection(s);
  const roof = safeRoof(s);
  const p = det.probability;
  return {
    q1: {
      label: p >= 0.7 ? "Likely" : p >= 0.45 ? "Possible" : p >= 0.25 ? "Weak signal" : "Unlikely",
      detail: `${Math.round(p * 100)}% estimated likelihood of a sub-surface void`,
      tone: p >= 0.7 ? "good" : p >= 0.45 ? "mid" : "bad",
    },
    q2: {
      label: roof.skylightDetected ? (roof.skylightConfidence >= 0.75 ? "Detected" : "Probable") : "Not detected",
      detail: roof.skylightDetected
        ? `~${roof.skylightDiameterM ?? "?"} m opening · ${Math.round(roof.skylightConfidence * 100)}% confidence`
        : "No opening found in available imagery",
      tone: roof.skylightDetected ? (roof.skylightConfidence >= 0.75 ? "good" : "mid") : "bad",
    },
    q3: {
      label: roof.stability >= 0.65 ? "Favourable" : roof.stability >= 0.4 ? "Uncertain" : "Risky",
      detail: `Roof stability index ${roof.stability.toFixed(2)} · cracks ${roof.crackDensity}`,
      tone: roof.stability >= 0.65 ? "good" : roof.stability >= 0.4 ? "mid" : "bad",
    },
    q4: {
      label:
        s.status === "PRIORITY_CANDIDATE" ? "Priority candidate"
        : s.status === "CANDIDATE" ? "Candidate"
        : s.status === "NEEDS_DATA" ? "Needs more data"
        : s.status === "UNSTABLE" ? "Not recommended"
        : "Unlikely",
      detail: `Habitat score ${s.habitatScore.toFixed(0)} / 100 (range ${s.scoreLow.toFixed(0)}–${s.scoreHigh.toFixed(0)})`,
      tone: s.status === "PRIORITY_CANDIDATE" ? "good" : s.status === "CANDIDATE" || s.status === "NEEDS_DATA" ? "mid" : "bad",
    },
  } as const;
}
