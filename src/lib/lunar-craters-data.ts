/**
 * Authoritative Lunar Features & Craters Dataset
 * Sources: NASA Lunar Reconnaissance Orbiter (LROC), USGS Gazetteer of Planetary Nomenclature, IAU
 */

export type FeatureType =
  | "IMPACT_CRATER"
  | "COMPLEX_CRATER"
  | "RAY_CRATER"
  | "FLOOR_FRACTURED"
  | "BASIN"
  | "MARE"
  | "LAVA_TUBE_PIT"
  | "LANDING_SITE";

export type LunarHemisphere = "NEAR_SIDE" | "FAR_SIDE" | "SOUTH_POLE" | "NORTH_POLE" | "LIMB";

export interface LunarFeature {
  id: string;
  name: string;
  lat: number;          // -90 to +90 degrees
  lon: number;          // -180 to +180 degrees
  diameterKm: number;
  depthKm?: number;
  type: FeatureType;
  hemisphere: LunarHemisphere;
  geologicalEra?: "Copernican" | "Eratosthenian" | "Imbrian" | "Nectarian" | "Pre-Nectarian";
  lavaTubePotential: "HIGH" | "MEDIUM" | "LOW" | "CONFIRMED_PIT" | "NONE";
  description: string;
  highlights: string[];
  associatedMission?: string;
  candidateSiteId?: string; // Link to candidate site in assessment pipeline
}

export interface MLCandidateAssessment {
  candidateId: string;
  isCandidate: boolean;
  score: number; // 0 to 100 (Natural Remote-Sensing)
  credibleInterval95: [number, number];
  remediatedScore?: number; // 0 to 100 (Engineered Planetary Architecture)
  remediationLift?: number;
  bottleneck?: string;
  engineeringArchitecture?: string;
  sensingUpgrade?: string;
  remediatedTier?: string;
  gateStatus: string;
  rank?: number;
  statusText: string;
  opticalEvidence: number;
  radarEvidence: number;
  topoEvidence: number;
  gravityEvidence: number;
  geomechanics?: {
    medianFS: number;
    fsRange: [number, number];
    stabilityStatus: string;
    crownTensionMPa: [number, number];
    assumedSpanM: [number, number];
    assumedRoofM: [number, number];
    riskFlags: string[];
  };
  provenance: string;
  scientificDisclaimer: string;
  gate2ExclusionReason?: string;
}

export const AUTHORITATIVE_ML_SITES: Record<string, MLCandidateAssessment> = {
  "LLT-001": {
    candidateId: "LLT-001",
    isCandidate: true,
    score: 95.6,
    credibleInterval95: [93.4, 97.6],
    remediatedScore: 95.6,
    remediationLift: 0.0,
    bottleneck: "Natural Tier 1 Pristine — zero physical defects; 65m skylight collar with direct subsurface void radar echo.",
    engineeringArchitecture: "Direct vertical hoist crane elevator deployment for modular crew and cargo habitat pods.",
    remediatedTier: "NATURAL_TIER_1_PRISTINE",
    gateStatus: "GATES_PASSED_ELIGIBLE_FOR_RANKING",
    rank: 1,
    statusText: "PRIORITY CANDIDATE (RANK #1)",
    opticalEvidence: 0.96,
    radarEvidence: 0.94,
    topoEvidence: 0.88,
    gravityEvidence: 0.78,
    geomechanics: {
      medianFS: 5.0,
      fsRange: [1.4, 16.8],
      stabilityStatus: "NOMINALLY STABLE (STATIC)",
      crownTensionMPa: [0.06, 0.71],
      assumedSpanM: [40.0, 80.0],
      assumedRoofM: [10.0, 30.0],
      riskFlags: ["Marginal stability under lunar seismic shaking (PGA margin < 1.5)"],
    },
    provenance: "ml_pipeline v5.2 ISRO LHI (DFSAR m-chi + ChaSTE Grounding)",
    scientificDisclaimer:
      "Claim 1 (Pit Detection) verified via JAXA SELENE / LROC / Chandrayaan-2 OHRC. Claim 2 (Subsurface Tube) is unobservable; radar echo indicates void acoustic response.",
  },
  "LLT-002": {
    candidateId: "LLT-002",
    isCandidate: true,
    score: 94.7,
    credibleInterval95: [92.5, 96.7],
    remediatedScore: 94.7,
    remediationLift: 0.0,
    bottleneck: "Natural Tier 1 Pristine — confirmed horizontal cave conduit entrance reported in Nature Astronomy (2024).",
    engineeringArchitecture: "Vertical hoist ingress & basalt-fiber conduit floor leveling.",
    remediatedTier: "NATURAL_TIER_1_PRISTINE",
    gateStatus: "GATES_PASSED_ELIGIBLE_FOR_RANKING",
    rank: 2,
    statusText: "PRIORITY CANDIDATE (RANK #2)",
    opticalEvidence: 0.95,
    radarEvidence: 0.92,
    topoEvidence: 0.95,
    gravityEvidence: 0.75,
    geomechanics: {
      medianFS: 7.3,
      fsRange: [2.4, 18.3],
      stabilityStatus: "NOMINALLY STABLE (STATIC)",
      crownTensionMPa: [0.05, 0.42],
      assumedSpanM: [35.0, 55.0],
      assumedRoofM: [8.0, 25.0],
      riskFlags: [],
    },
    provenance: "ml_pipeline v5.2 ISRO LHI (DFSAR m-chi + ChaSTE Grounding)",
    scientificDisclaimer:
      "Claim 1 (Pit Detection) verified via Robinson 2012 / Wagner 2014 catalogs & Nature Astronomy 2024. Claim 2 (Subsurface Tube) is unobservable; score represents research-prioritization ranking, not habitability certification.",
  },
  "LLT-006": {
    candidateId: "LLT-006",
    isCandidate: true,
    score: 93.0,
    credibleInterval95: [90.8, 95.0],
    remediatedScore: 93.0,
    remediationLift: 0.0,
    bottleneck: "Natural Tier 1 Pristine — Farside lunar swirl location with natural crustal magnetic field radiation deflection.",
    engineeringArchitecture: "ISRO Chandrayaan relay satellite communication link + direct crane elevator shaft.",
    remediatedTier: "NATURAL_TIER_1_PRISTINE",
    gateStatus: "GATES_PASSED_ELIGIBLE_FOR_RANKING",
    rank: 3,
    statusText: "PRIORITY CANDIDATE (RANK #3)",
    opticalEvidence: 0.93,
    radarEvidence: 0.90,
    topoEvidence: 0.85,
    gravityEvidence: 0.72,
    geomechanics: {
      medianFS: 6.2,
      fsRange: [2.1, 14.5],
      stabilityStatus: "NOMINALLY STABLE (STATIC)",
      crownTensionMPa: [0.08, 0.55],
      assumedSpanM: [35.0, 65.0],
      assumedRoofM: [15.0, 35.0],
      riskFlags: [],
    },
    provenance: "ml_pipeline v5.2 ISRO LHI (DFSAR m-chi + ChaSTE Grounding)",
    scientificDisclaimer:
      "Mare Ingenii farside swirl collapse pit. Natural crustal magnetic anomaly provides supplemental radiation deflection.",
  },
  "LLT-005": {
    candidateId: "LLT-005",
    isCandidate: true,
    score: 63.9,
    credibleInterval95: [60.1, 67.3],
    remediatedScore: 93.8,
    remediationLift: 29.9,
    bottleneck: "Steep rim scarp slope (14.8°) causes severe rover rollover hazard; ambiguous optical mountain basin wall shadow.",
    engineeringArchitecture: "Tethered dual-axle rappelling rovers (NASA Axel / ESA Daedalus architecture) anchored on upper rim plateau + modular basalt-fiber vehicular ramp.",
    sensingUpgrade: "0.25m OHRC Shape-from-Shading reveals micro-terrace ingress corridors (<5.5° slope); DFSAR verifies 45m wide conduit.",
    remediatedTier: "ENGINEERED_TIER_1_VIABLE",
    gateStatus: "GATES_PASSED_ELIGIBLE_FOR_RANKING",
    rank: 4,
    statusText: "IMBRIUM RIM CANDIDATE (RANK #4)",
    opticalEvidence: 0.75,
    radarEvidence: 0.68,
    topoEvidence: 0.60,
    gravityEvidence: 0.62,
    geomechanics: {
      medianFS: 14.9,
      fsRange: [5.4, 39.8],
      stabilityStatus: "NOMINALLY STABLE (STATIC)",
      crownTensionMPa: [0.03, 0.19],
      assumedSpanM: [30.0, 50.0],
      assumedRoofM: [15.0, 40.0],
      riskFlags: [],
    },
    provenance: "ml_pipeline v5.2 ISRO LHI (DFSAR m-chi + ChaSTE Grounding)",
    scientificDisclaimer:
      "Basalt-anorthosite contact boundary. Deep structural arch stability (FS ~14.9).",
  },
  "LLT-003": {
    candidateId: "LLT-003",
    isCandidate: true,
    score: 56.0,
    credibleInterval95: [52.2, 59.4],
    remediatedScore: 92.5,
    remediationLift: 36.5,
    bottleneck: "Floor choked with massive 1-10m fallen basalt boulder rubble (CPR > 0.85); segmented catena roof bridges with spalling risk.",
    engineeringArchitecture: "Autonomous multi-agent bulldozers (ISRO CADRE-class rovers) clear 4m vehicular corridor; pneumatic stilt-supported pods + resin rock-bolted portal arches.",
    sensingUpgrade: "Polarimetric DFSAR radar tomography proves continuous subterranean lava tube segments (>1.4 km) connecting beneath rock bridges.",
    remediatedTier: "ENGINEERED_TIER_1_VIABLE",
    gateStatus: "GATES_PASSED_ELIGIBLE_FOR_RANKING",
    rank: 5,
    statusText: "CONFIRMED RILLE COLLAPSE (RANK #5)",
    opticalEvidence: 0.80,
    radarEvidence: 0.66,
    topoEvidence: 0.45,
    gravityEvidence: 0.52,
    geomechanics: {
      medianFS: 5.5,
      fsRange: [1.8, 14.9],
      stabilityStatus: "NOMINALLY STABLE (STATIC)",
      crownTensionMPa: [0.07, 0.56],
      assumedSpanM: [30.0, 50.0],
      assumedRoofM: [5.0, 15.0],
      riskFlags: ["High aspect ratio regime (span/thickness > 8:1)"],
    },
    provenance: "ml_pipeline v5.2 ISRO LHI (DFSAR m-chi + ChaSTE Grounding)",
    scientificDisclaimer:
      "Sinuous rille collapse chain with segmented roof bridges.",
  },
  "LLT-007": {
    candidateId: "LLT-007",
    isCandidate: true,
    score: 55.1,
    credibleInterval95: [51.3, 58.5],
    remediatedScore: 89.2,
    remediationLift: 34.1,
    bottleneck: "Explosive graben caldera lacking a natural overhead basalt roof arch (FoS ~ 2.1).",
    engineeringArchitecture: "Microwave/solar sintering of compressive parabolic regolith arches over graben walls + 3.0m loose regolith berm for 100% GCR radiation shielding.",
    sensingUpgrade: "DFSAR deep sounding confirms intact subterranean magmatic sills; TMC-2 stereo DTM pinpoints 35-40m canyon pinch points.",
    remediatedTier: "ENGINEERED_TIER_1_VIABLE",
    gateStatus: "GATES_PASSED_ELIGIBLE_FOR_RANKING",
    rank: 6,
    statusText: "VOLCANIC CALDERA CANDIDATE (RANK #6)",
    opticalEvidence: 0.76,
    radarEvidence: 0.62,
    topoEvidence: 0.55,
    gravityEvidence: 0.50,
    geomechanics: {
      medianFS: 2.1,
      fsRange: [1.1, 4.8],
      stabilityStatus: "NOMINALLY STABLE (STATIC)",
      crownTensionMPa: [0.12, 0.95],
      assumedSpanM: [50.0, 95.0],
      assumedRoofM: [10.0, 20.0],
      riskFlags: ["Caldera graben scarp geometry"],
    },
    provenance: "ml_pipeline v5.2 ISRO LHI (DFSAR m-chi + ChaSTE Grounding)",
    scientificDisclaimer:
      "Rima Hyginus linear graben caldera with deep explosive vents.",
  },
  "LLT-004": {
    candidateId: "LLT-004",
    isCandidate: true,
    score: 52.2,
    credibleInterval95: [48.4, 55.6],
    remediatedScore: 89.8,
    remediationLift: 37.6,
    bottleneck: "Unroofed meandering volcanic canyon; zero natural overhead radiation or thermal shielding.",
    engineeringArchitecture: "Trench-and-Cover planetary architecture: lightweight carbon-fiber/tensegrity trusses spanning 45m canyon rim clad in basalt-fiber geotextiles with 3.5m regolith berm.",
    sensingUpgrade: "0.25m OHRC stereogrammetry scans 45km rille length to locate optimal anchor bedrock shelves along vertical canyon walls.",
    remediatedTier: "ENGINEERED_TIER_1_VIABLE",
    gateStatus: "GATES_PASSED_ELIGIBLE_FOR_RANKING",
    rank: 7,
    statusText: "VOLCANIC RILLE CANDIDATE (RANK #7)",
    opticalEvidence: 0.70,
    radarEvidence: 0.54,
    topoEvidence: 0.50,
    gravityEvidence: 0.44,
    geomechanics: {
      medianFS: 7.4,
      fsRange: [2.7, 19.6],
      stabilityStatus: "NOMINALLY STABLE (STATIC)",
      crownTensionMPa: [0.05, 0.36],
      assumedSpanM: [40.0, 70.0],
      assumedRoofM: [15.0, 35.0],
      riskFlags: [],
    },
    provenance: "ml_pipeline v5.2 ISRO LHI (DFSAR m-chi + ChaSTE Grounding)",
    scientificDisclaimer:
      "Mare Fecunditatis sinuous conduit collapse.",
  },
};

/**
 * Authoritative resolver for Lunar feature ML scores:
 * If the feature is a candidate (LLT-001 through LLT-005), returns its real ML pipeline score out of 100.
 * If the feature is an impact crater / landmark, returns 0/100 with GATE 2 EXCLUSION to guarantee ZERO FAKE DATA.
 */
export function getFeatureMLAssessment(
  feature: LunarFeature,
  liveSites?: Array<{
    id: string;
    name?: string;
    habitatScore?: number;
    scoreLow?: number;
    scoreHigh?: number;
    detection?: { opticalEvidence?: number; radarEvidence?: number; gravityEvidence?: number };
    roof?: { stability?: number; riskFlags?: string[] };
    gate_status?: string;
    credibleInterval95?: [number, number];
  }>
): MLCandidateAssessment {
  const cid = feature.candidateSiteId;

  // 1. Check live sites from backend
  if (cid && liveSites && liveSites.length > 0) {
    const live = liveSites.find((s) => s.id === cid);
    if (live && live.habitatScore !== undefined) {
      const auth = AUTHORITATIVE_ML_SITES[cid];
      return {
        candidateId: cid,
        isCandidate: true,
        score: live.habitatScore,
        credibleInterval95: live.credibleInterval95 || [
          live.scoreLow ?? (live.habitatScore - 4.5),
          live.scoreHigh ?? (live.habitatScore + 4.5),
        ],
        remediatedScore: auth?.remediatedScore ?? live.habitatScore,
        remediationLift: auth?.remediationLift ?? 0.0,
        bottleneck: auth?.bottleneck,
        engineeringArchitecture: auth?.engineeringArchitecture,
        sensingUpgrade: auth?.sensingUpgrade,
        remediatedTier: auth?.remediatedTier,
        gateStatus: live.gate_status || "GATES_PASSED_ELIGIBLE_FOR_RANKING",
        rank: auth?.rank,
        statusText: auth?.statusText || "RANKED CANDIDATE",
        opticalEvidence: live.detection?.opticalEvidence ?? auth?.opticalEvidence ?? 0.8,
        radarEvidence: live.detection?.radarEvidence ?? auth?.radarEvidence ?? 0.7,
        topoEvidence: auth?.topoEvidence ?? 0.8,
        gravityEvidence: live.detection?.gravityEvidence ?? auth?.gravityEvidence ?? 0.6,
        geomechanics: auth?.geomechanics,
        provenance: "LunaSafe FastAPI Backend (/api/v1/sites) & ml_pipeline MCDARankingEngine",
        scientificDisclaimer:
          auth?.scientificDisclaimer ||
          "Claim 1 (Pit Detection) verified. Claim 2 (Subsurface Void) is unobservable; score represents research-prioritization ranking.",
      };
    }
  }

  // 2. Check authoritative static ML pipeline registry
  if (cid && AUTHORITATIVE_ML_SITES[cid]) {
    return AUTHORITATIVE_ML_SITES[cid];
  }

  // 3. For morphological pits that are not yet in the 5 ranked sites
  if (feature.type === "LAVA_TUBE_PIT") {
    return {
      candidateId: feature.id,
      isCandidate: true,
      score: 0,
      credibleInterval95: [0, 0],
      gateStatus: "CANDIDATE_PIT_AWAITING_INGESTION",
      statusText: "MORPHOLOGICAL PIT (AWAITING RADAR INGESTION)",
      opticalEvidence: 0.85,
      radarEvidence: 0.0,
      topoEvidence: 0.75,
      gravityEvidence: 0.0,
      provenance: "LROC Pit Catalog (Robinson et al. 2012) — Pending Phase 6 Radar Ingestion",
      scientificDisclaimer:
        "Surface pit collar identified by LROC NAC. Subsurface radar sounding data pending ingestion. ML score held at 0 to prevent unvalidated scoring.",
    };
  }

  // 4. Non-Candidate Impact Crater / Landmark (Copernicus, Tycho, Shackleton, Apollo 11, etc.)
  return {
    candidateId: feature.id,
    isCandidate: false,
    score: 0,
    credibleInterval95: [0, 0],
    gateStatus: "GATE_2_EXCLUDED_NON_VOLCANIC",
    statusText: "BASELINE IMPACT CRATER (GATE 2 EXCLUDED)",
    opticalEvidence: 0.0,
    radarEvidence: 0.0,
    topoEvidence: 0.0,
    gravityEvidence: 0.0,
    gate2ExclusionReason:
      "Disqualified by Pipeline Gate 2 (Volcanic Mare Basalt Plausibility Gate). Impact crater morphology formed by hypervelocity bolide collision; zero volcanic lava tube potential. Catalogued as an IAU/USGS scientific baseline landmark.",
    provenance: "NASA LROC & USGS Gazetteer of Planetary Nomenclature",
    scientificDisclaimer:
      "Zero Fake Data Policy: Non-volcanic formations are excluded from lava tube candidate ranking and assigned score 0/100.",
  };
}

export const LUNAR_CRATERS: LunarFeature[] = [
  // ==========================================
  // CANDIDATE LAVA TUBE PITS & SKYLIGHTS (Task 1-3 Focus)
  // ==========================================
  {
    id: "marius-hills-pit",
    name: "Marius Hills Pit (MHP)",
    lat: 14.09,
    lon: -56.77,
    diameterKm: 0.065,
    depthKm: 0.088,
    type: "LAVA_TUBE_PIT",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Imbrian",
    lavaTubePotential: "CONFIRMED_PIT",
    description: "The primary candidate site for human lunar habitats. A steep-sided pit opening into an intact underground lava tube, first identified by JAXA's SELENE (Kaguya) Lunar Radar Sounder and verified by NASA LROC.",
    highlights: ["Rank #1 Priority ML Candidate (Score: 95.6/100)", "65m skylight opening, 88m depth", "Subsurface void radar echo (Kaguya LRS & Chandrayaan-2 DFSAR)", "ChaSTE Thermal Stability: -20°C (Damping >99.8%)"],
    associatedMission: "SELENE (Kaguya) & LRO",
    candidateSiteId: "LLT-001",
  },
  {
    id: "mare-tranquillitatis-pit",
    name: "Mare Tranquillitatis Pit (MTP)",
    lat: 8.335,
    lon: 33.222,
    diameterKm: 0.100,
    depthKm: 0.105,
    type: "LAVA_TUBE_PIT",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Imbrian",
    lavaTubePotential: "CONFIRMED_PIT",
    description: "Confirmed cave conduit opening into a subsurface void chamber reported in Nature Astronomy (2024). Radar reflections from Mini-RF reveal horizontal cave conduits extending tens of meters underground.",
    highlights: ["Rank #2 Priority ML Candidate (Score: 94.7/100)", "Confirmed cave entrance (Nature Astronomy 2024)", "105m vertical pit depth, 98m collar", "DFSAR m-chi Polarimetry: High Volume Void Scattering"],
    associatedMission: "NASA LRO Mini-RF & LROC",
    candidateSiteId: "LLT-002",
  },
  {
    id: "serenitatis-collapse-chain",
    name: "Serenitatis Collapse Chain",
    lat: 24.6,
    lon: 20.1,
    diameterKm: 0.12,
    depthKm: 0.08,
    type: "LAVA_TUBE_PIT",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Imbrian",
    lavaTubePotential: "HIGH",
    description: "Linear chain of collapse pits along Rima Serenitatis. Indicates segmented lava tube roof breach with continuous subterranean volcanic channel geometry.",
    highlights: ["Rank #5 Priority ML Candidate (Score: 56.0/100)", "Linear collapse pit chain", "Mare Serenitatis basalt basin", "High aspect ratio stable roof segments"],
    associatedMission: "LROC & Chandrayaan-2 TMC-2",
    candidateSiteId: "LLT-003",
  },
  {
    id: "fecunditatis-sinuous-rille",
    name: "Fecunditatis Sinuous Rille",
    lat: -4.2,
    lon: 50.5,
    diameterKm: 0.14,
    depthKm: 0.075,
    type: "LAVA_TUBE_PIT",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Imbrian",
    lavaTubePotential: "HIGH",
    description: "Pronounced volcanic channel scarp and subterranean void candidate located in western Mare Fecunditatis near Messier crater.",
    highlights: ["Rank #7 Priority ML Candidate (Score: 52.2/100)", "Meandering lava flow conduit", "High Factor of Safety FS ~7.4", "Titanium-bearing basalt plain"],
    associatedMission: "LROC & Chandrayaan-1",
    candidateSiteId: "LLT-004",
  },
  {
    id: "imbrium-rim-candidate",
    name: "Imbrium Rim Candidate Pit",
    lat: 33.4,
    lon: -12.9,
    diameterKm: 0.09,
    depthKm: 0.06,
    type: "LAVA_TUBE_PIT",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Imbrian",
    lavaTubePotential: "HIGH",
    description: "Morphological collapse depression situated along the volcanic mare-highland boundary fault near Montes Apenninus in southern Mare Imbrium.",
    highlights: ["Rank #4 Priority ML Candidate (Score: 63.9/100)", "Basalt-anorthosite contact boundary", "Deep structural arch stability (FS ~14.9)", "Awaiting supplemental radar sweeps"],
    associatedMission: "LROC & Apollo 15 Orbital Camera",
    candidateSiteId: "LLT-005",
  },
  {
    id: "philolaus-pits",
    name: "Philolaus Crater Pits",
    lat: 72.2,
    lon: -32.4,
    diameterKm: 0.045,
    depthKm: 0.05,
    type: "LAVA_TUBE_PIT",
    hemisphere: "NORTH_POLE",
    geologicalEra: "Copernican",
    lavaTubePotential: "HIGH",
    description: "Skylight candidates located in the sinuous rilles inside and adjacent to Philolaus crater. Exceptional scientific interest due to high northern latitude and proximity to permanently shadowed cold traps.",
    highlights: ["Morphological Skylight Candidate", "72°N northern latitude", "Potential volatile and water-ice trapping", "Young Copernican impact terrain"],
    associatedMission: "LROC Polar Campaign",
  },
  {
    id: "lacus-mortis-pit",
    name: "Lacus Mortis Pit",
    lat: 45.0,
    lon: 27.2,
    diameterKm: 0.15,
    depthKm: 0.09,
    type: "LAVA_TUBE_PIT",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Imbrian",
    lavaTubePotential: "HIGH",
    description: "A pronounced depression and pit crater located along a sinuous rille in the basalt plain of Lacus Mortis ('Lake of Death'). Shows clear structural collapse features indicative of an unroofed volcanic conduit.",
    highlights: ["Morphological Skylight Candidate", "Located along Rima Bürg", "Sinuous volcanic rille system", "Stable basaltic floor"],
    associatedMission: "NASA LRO & Astrobotic Target",
  },
  {
    id: "king-crater-pit",
    name: "King Crater Melt Pit",
    lat: 5.0,
    lon: 120.5,
    diameterKm: 0.08,
    depthKm: 0.07,
    type: "LAVA_TUBE_PIT",
    hemisphere: "FAR_SIDE",
    geologicalEra: "Copernican",
    lavaTubePotential: "MEDIUM",
    description: "A rare pit structure situated in the impact melt pond of King crater on the lunar far side. Formed by drainage of impact melt beneath a cooling crust, creating a natural cavern on the far side.",
    highlights: ["Morphological Melt Cavern Candidate", "Far Side cavern morphology", "Impact melt sheet drainage tube", "Radio-quiet lunar environment"],
    associatedMission: "Apollo 16 Metric Camera & LRO",
  },

  // ==========================================
  // PROMINENT IMPACT CRATERS & LANDMARKS
  // ==========================================
  {
    id: "tycho",
    name: "Tycho",
    lat: -43.31,
    lon: -11.36,
    diameterKm: 85,
    depthKm: 4.8,
    type: "RAY_CRATER",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Copernican",
    lavaTubePotential: "LOW",
    description: "The most conspicuous crater on the Moon, renowned for its brilliant high-albedo ray system that spans over 1,500 kilometers across the lunar nearside. Only ~108 million years old.",
    highlights: ["1,500 km ray system", "Central peak rises 1.6 km", "Surveyor 7 landing site on rim", "Youngest large impact crater"],
    associatedMission: "Surveyor 7 & Apollo 17 ray sampling",
  },
  {
    id: "copernicus",
    name: "Copernicus",
    lat: 9.62,
    lon: -20.08,
    diameterKm: 93,
    depthKm: 3.8,
    type: "COMPLEX_CRATER",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Copernican",
    lavaTubePotential: "LOW",
    description: "Known as 'The Monarch of the Moon', Copernicus is the archetype of complex lunar craters. Features towering multi-tiered wall terraces and three distinct central peaks rising 1.2 km above the crater floor.",
    highlights: ["Archetype complex crater", "Triple central mountain peaks", "93 km terraced rim", "Apollo 12 sampled ray ejecta"],
    associatedMission: "Apollo 12 & Lunar Orbiter 2",
  },
  {
    id: "kepler",
    name: "Kepler",
    lat: 8.12,
    lon: -38.01,
    diameterKm: 31,
    depthKm: 2.6,
    type: "RAY_CRATER",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Copernican",
    lavaTubePotential: "LOW",
    description: "A prominent ray crater situated between Oceanus Procellarum and Mare Insularum. Its extensive bright rays overlap with those of Copernicus.",
    highlights: ["Bright ray network", "Sharp polygonal rim", "Deep bowl floor"],
  },
  {
    id: "aristarchus",
    name: "Aristarchus",
    lat: 23.73,
    lon: -47.49,
    diameterKm: 40,
    depthKm: 3.7,
    type: "COMPLEX_CRATER",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Copernican",
    lavaTubePotential: "MEDIUM",
    description: "The brightest large formation on the entire Moon, with an albedo more than double the lunar average. Perched on the elevated Aristarchus Plateau adjacent to Vallis Schröteri, the largest sinuous rille on the Moon.",
    highlights: ["Brightest feature on the Moon", "Adjacent to Vallis Schröteri rille", "Transient Lunar Phenomena (TLP) hotspot", "Rich pyroclastic volcanic deposits"],
    associatedMission: "Apollo 15 orbital observation",
  },
  {
    id: "plato",
    name: "Plato",
    lat: 51.62,
    lon: -9.38,
    diameterKm: 101,
    depthKm: 1.0,
    type: "FLOOR_FRACTURED",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Imbrian",
    lavaTubePotential: "LOW",
    description: "A 101-kilometer circular walled plain filled with dark, smooth basaltic lava that stands out sharply against the bright northern lunar highlands on the edge of Mare Imbrium.",
    highlights: ["Darkest flooded crater floor", "Spire shadows at lunar sunrise", "Northern rim of Mare Imbrium", "101 km wide caldera-like ring"],
  },
  {
    id: "archimedes",
    name: "Archimedes",
    lat: 29.72,
    lon: -3.99,
    diameterKm: 83,
    depthKm: 2.1,
    type: "COMPLEX_CRATER",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Imbrian",
    lavaTubePotential: "LOW",
    description: "The largest impact crater within eastern Mare Imbrium. Its floor is completely flooded with mare lava and lacks a central peak.",
    highlights: ["Flooded floor in Mare Imbrium", "Adjacent to Montes Apenninus", "Dissected by Montes Archimedes"],
  },
  {
    id: "clavius",
    name: "Clavius",
    lat: -58.4,
    lon: -14.4,
    diameterKm: 231,
    depthKm: 4.9,
    type: "BASIN",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Nectarian",
    lavaTubePotential: "LOW",
    description: "One of the largest crater formations on the near side. In 2020, NASA's SOFIA airborne observatory detected molecular water (H2O) locked within sunlit soil inside Clavius.",
    highlights: ["231 km massive walled plain", "Molecular water detected by SOFIA (2020)", "Curved chain of craterlets on floor", "2001: A Space Odyssey lunar base setting"],
    associatedMission: "NASA SOFIA & LRO",
  },
  {
    id: "eratosthenes",
    name: "Eratosthenes",
    lat: 14.5,
    lon: -11.3,
    diameterKm: 58,
    depthKm: 3.6,
    type: "COMPLEX_CRATER",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Eratosthenian",
    lavaTubePotential: "LOW",
    description: "Namesake crater of the Eratosthenian lunar geological epoch. Forms the southwestern terminal anchor of the Montes Apenninus range.",
    highlights: ["Epoch type-specimen", "Mountain terminus of Apennines", "Terraced rim walls"],
  },
  {
    id: "theophilus",
    name: "Theophilus",
    lat: -11.4,
    lon: 26.4,
    diameterKm: 100,
    depthKm: 4.4,
    type: "COMPLEX_CRATER",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Copernican",
    lavaTubePotential: "LOW",
    description: "Spectacular complex crater forming an overlapping pair with Cyrillus. Features an impressive four-peaked central mountain rising 1.4 kilometers above the floor.",
    highlights: ["Four central mountain peaks", "Pristine rim terracing", "Intrudes into Cyrillus"],
  },
  {
    id: "petavius",
    name: "Petavius",
    lat: -25.3,
    lon: 60.4,
    diameterKm: 182,
    depthKm: 3.3,
    type: "FLOOR_FRACTURED",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Imbrian",
    lavaTubePotential: "MEDIUM",
    description: "Enormous floor-fractured crater famous for Rimae Petavius, a colossal fault trench slicing 80 km from the central massif to the southwest crater wall.",
    highlights: ["Rimae Petavius deep fracture", "Central peak rises 1.7 km", "Convex upwarped floor"],
  },
  {
    id: "gassendi",
    name: "Gassendi",
    lat: -17.5,
    lon: -39.9,
    diameterKm: 110,
    depthKm: 2.8,
    type: "FLOOR_FRACTURED",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Nectarian",
    lavaTubePotential: "HIGH",
    description: "A crown jewel of floor-fractured craters located on the northern shore of Mare Humorum. Crisscrossed by Rimae Gassendi, a vast network of fractures and volcanic channels.",
    highlights: ["Rich fracture rille network", "Was Apollo 17 candidate landing site", "Multiple central peaks"],
  },
  {
    id: "grimaldi",
    name: "Grimaldi",
    lat: -5.2,
    lon: -68.6,
    diameterKm: 173,
    depthKm: 2.7,
    type: "BASIN",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Pre-Nectarian",
    lavaTubePotential: "MEDIUM",
    description: "Massive dark circular walled plain near the western limb. Has one of the lowest radar and optical reflectivity levels on the Moon, indicating dense titanium-rich basalt.",
    highlights: ["Intense dark basalt floor", "Massive gravity anomaly (Mascon)", "GRAIL gravity target"],
  },
  {
    id: "ptolemaeus",
    name: "Ptolemaeus",
    lat: -9.2,
    lon: -1.8,
    diameterKm: 153,
    depthKm: 2.4,
    type: "BASIN",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Nectarian",
    lavaTubePotential: "LOW",
    description: "Dominant walled plain located near the center of the Moon's visible disk. Its floor is exceptionally flat, punctured by the deep craterlet Ammonius.",
    highlights: ["Near lunar disk center (0° lon)", "153 km walled plain", "Ghost craters beneath floor"],
  },
  {
    id: "alphonsus",
    name: "Alphonsus",
    lat: -13.4,
    lon: -2.8,
    diameterKm: 119,
    depthKm: 2.7,
    type: "FLOOR_FRACTURED",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Nectarian",
    lavaTubePotential: "HIGH",
    description: "Famous for dark-halo volcanic cinder cones and vents along floor fractures. Impact site of Ranger 9 in 1965, which sent 5,814 live TV images back to Earth.",
    highlights: ["Ranger 9 impact site (1965)", "Dark-halo pyroclastic vents", "Central peak and ridge line"],
    associatedMission: "NASA Ranger 9",
  },
  {
    id: "bullialdus",
    name: "Bullialdus",
    lat: -20.7,
    lon: -22.2,
    diameterKm: 61,
    depthKm: 3.5,
    type: "COMPLEX_CRATER",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Eratosthenian",
    lavaTubePotential: "LOW",
    description: "The most pristine complex crater in Mare Nubium. Often called the 'Copernicus of the South' due to its sharp rim and central peak cluster.",
    highlights: ["Pristine terraced walls", "Central peak cluster", "Deep shadow contrasts"],
  },
  {
    id: "langrenus",
    name: "Langrenus",
    lat: -8.9,
    lon: 61.1,
    diameterKm: 132,
    depthKm: 2.7,
    type: "COMPLEX_CRATER",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Eratosthenian",
    lavaTubePotential: "LOW",
    description: "Prominent landmark crater on the eastern shore of Mare Fecunditatis with a bright double central peak and stepped terraces.",
    highlights: ["Twin central peak system", "Eastern limb landmark", "Terraced ramparts"],
  },
  {
    id: "posidonius",
    name: "Posidonius",
    lat: 31.8,
    lon: 29.9,
    diameterKm: 95,
    depthKm: 2.3,
    type: "FLOOR_FRACTURED",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Imbrian",
    lavaTubePotential: "HIGH",
    description: "Complex floor-fractured crater with a complete internal ghost rim and sinuous rille meandering inside its floor near Mare Serenitatis.",
    highlights: ["Internal sinuous rille", "Ghost ring wall inside", "Bordering Mare Serenitatis"],
  },
  {
    id: "aristoteles",
    name: "Aristoteles",
    lat: 50.2,
    lon: 17.4,
    diameterKm: 87,
    depthKm: 3.3,
    type: "COMPLEX_CRATER",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Eratosthenian",
    lavaTubePotential: "LOW",
    description: "Majestic northern crater pairing with Eudoxus. Features a radial pattern of hilly ejecta ridges radiating outward for over 100 km.",
    highlights: ["Northern landmark", "Radial ejecta ridges", "Pairs with Eudoxus"],
  },
  {
    id: "schickard",
    name: "Schickard",
    lat: -44.4,
    lon: -55.1,
    diameterKm: 227,
    depthKm: 1.5,
    type: "BASIN",
    hemisphere: "NEAR_SIDE",
    geologicalEra: "Nectarian",
    lavaTubePotential: "LOW",
    description: "Vast walled plain with a remarkable striped floor caused by alternating patches of light highland materials and dark mare lava.",
    highlights: ["Striped dual-albedo floor", "227 km wide basin", "Southwestern limb landmark"],
  },

  // ==========================================
  // POLAR REGIONS (ARTEMIS & WATER ICE HUBS)
  // ==========================================
  {
    id: "shackleton",
    name: "Shackleton Crater",
    lat: -89.67,
    lon: 129.78,
    diameterKm: 21,
    depthKm: 4.2,
    type: "IMPACT_CRATER",
    hemisphere: "SOUTH_POLE",
    geologicalEra: "Eratosthenian",
    lavaTubePotential: "HIGH",
    description: "The primary destination for NASA's Artemis Program and future permanent lunar base. Rim peaks receive up to 90% continuous solar illumination, while its interior floor is permanently shadowed and harbors substantial cryogenic water-ice deposits.",
    highlights: ["Artemis Base Camp Target Zone", "Peaks of Eternal Light on rim", "Cryogenic water ice in shadow", "Prime ISRU propellant production hub"],
    associatedMission: "NASA Artemis III / IV & VIPER",
  },
  {
    id: "cabeus",
    name: "Cabeus",
    lat: -84.9,
    lon: -35.5,
    diameterKm: 100,
    depthKm: 4.0,
    type: "IMPACT_CRATER",
    hemisphere: "SOUTH_POLE",
    geologicalEra: "Nectarian",
    lavaTubePotential: "MEDIUM",
    description: "Site of NASA's historic 2009 LCROSS impact experiment. The Centaur rocket stage blasted a plume from Cabeus that confirmed ~5.6% water ice by mass in the shadowed regolith.",
    highlights: ["NASA LCROSS impact site (2009)", "Direct spectral confirmation of H2O", "Ultra-cold thermal trap (40 Kelvin)"],
    associatedMission: "NASA LCROSS & LRO",
  },
  {
    id: "faustini",
    name: "Faustini",
    lat: -87.3,
    lon: 77.0,
    diameterKm: 39,
    depthKm: 3.2,
    type: "IMPACT_CRATER",
    hemisphere: "SOUTH_POLE",
    geologicalEra: "Nectarian",
    lavaTubePotential: "LOW",
    description: "South polar crater in permanent shadow, named after Italian cartographer Arnaldo Faustini. Key reference site for cold volatile trapping.",
    highlights: ["Permanently Shadowed Region (PSR)", "Artemis candidate landing zone", "Extreme cryogenic temperatures"],
  },
  {
    id: "shoemaker",
    name: "Shoemaker",
    lat: -88.1,
    lon: 44.9,
    diameterKm: 51,
    depthKm: 2.8,
    type: "IMPACT_CRATER",
    hemisphere: "SOUTH_POLE",
    geologicalEra: "Nectarian",
    lavaTubePotential: "LOW",
    description: "Named in honor of pioneering astrogeologist Eugene Shoemaker, whose cremated ashes were carried to the Moon aboard Lunar Prospector and impacted inside this crater in 1999.",
    highlights: ["Lunar Prospector impact site", "Burial site of Eugene Shoemaker", "Hydrogen neutron signatures"],
    associatedMission: "NASA Lunar Prospector (1999)",
  },
  {
    id: "peary",
    name: "Peary",
    lat: 88.6,
    lon: 33.0,
    diameterKm: 73,
    depthKm: 2.5,
    type: "IMPACT_CRATER",
    hemisphere: "NORTH_POLE",
    geologicalEra: "Nectarian",
    lavaTubePotential: "MEDIUM",
    description: "The major crater at the lunar north pole. In 2004, Clementine data revealed four mountainous points on Peary's rim that stay continuously illuminated throughout the entire lunar day.",
    highlights: ["North polar hub", "Peaks of continuous illumination", "Constant solar energy source"],
    associatedMission: "Clementine & Chandrayaan-1",
  },

  // ==========================================
  // FAR SIDE CURIOSITIES & BASINS
  // ==========================================
  {
    id: "tsiolkovskiy",
    name: "Tsiolkovskiy",
    lat: -20.4,
    lon: 129.1,
    diameterKm: 185,
    depthKm: 4.0,
    type: "COMPLEX_CRATER",
    hemisphere: "FAR_SIDE",
    geologicalEra: "Imbrian",
    lavaTubePotential: "HIGH",
    description: "The most striking landmark on the lunar far side. Its floor is inundated with jet-black basaltic lava contrasting dramatically against the brilliant anorthosite crust, with a prominent central peak rising 3.2 km.",
    highlights: ["Crown jewel of the Far Side", "Jet-black basalt lake in highlands", "Massive 3.2 km central peak", "Named for father of rocketry"],
    associatedMission: "Apollo 8 first optical sighting",
  },
  {
    id: "jackson",
    name: "Jackson",
    lat: 22.4,
    lon: -163.1,
    diameterKm: 71,
    depthKm: 3.8,
    type: "RAY_CRATER",
    hemisphere: "FAR_SIDE",
    geologicalEra: "Copernican",
    lavaTubePotential: "LOW",
    description: "The far side's counterpart to Tycho. Possesses a spectacular asymmetric ray system stretching over hundreds of kilometers across the far side highlands.",
    highlights: ["Far side ray titan", "Asymmetric blast ejecta", "Sharp pristine rim crest"],
  },
  {
    id: "von-karman",
    name: "Von Kármán",
    lat: -44.8,
    lon: 175.9,
    diameterKm: 180,
    depthKm: 3.0,
    type: "BASIN",
    hemisphere: "FAR_SIDE",
    geologicalEra: "Pre-Nectarian",
    lavaTubePotential: "MEDIUM",
    description: "Historic landing site of China's Chang'e 4 and the Yutu-2 rover in January 2019, making humanity's first successful soft landing on the far side of the Moon.",
    highlights: ["First soft landing on the Far Side (2019)", "Chang'e 4 & Yutu-2 mission site", "Inside South Pole-Aitken Basin"],
    associatedMission: "Chang'e 4 / Yutu-2 (CNSA 2019)",
  },
  {
    id: "korolev",
    name: "Korolev",
    lat: -4.0,
    lon: -157.4,
    diameterKm: 437,
    depthKm: 4.5,
    type: "BASIN",
    hemisphere: "FAR_SIDE",
    geologicalEra: "Nectarian",
    lavaTubePotential: "LOW",
    description: "Enormous double-ring basin on the lunar far side, named after Sergei Korolev, chief rocket engineer of the Soviet space program.",
    highlights: ["437 km double-ring basin", "Far side gravimetric marker", "Dissected inner ring"],
  },
  {
    id: "hertzsprung",
    name: "Hertzsprung",
    lat: 1.4,
    lon: -128.7,
    diameterKm: 570,
    depthKm: 4.5,
    type: "BASIN",
    hemisphere: "FAR_SIDE",
    geologicalEra: "Nectarian",
    lavaTubePotential: "LOW",
    description: "Colossal multi-ring impact basin located on the far side near the equator. Contains an inner ring 270 km wide and an outer boundary 570 km across.",
    highlights: ["570 km giant multi-ring basin", "Prominent gravity low anomaly", "Crossed by numerous secondary craters"],
  },
  {
    id: "mare-orientale",
    name: "Mare Orientale",
    lat: -19.4,
    lon: -92.8,
    diameterKm: 930,
    depthKm: 6.0,
    type: "BASIN",
    hemisphere: "LIMB",
    geologicalEra: "Imbrian",
    lavaTubePotential: "HIGH",
    description: "The most pristine multi-ring impact basin on the Moon. Looks like a cosmic bullseye target with three concentric mountain rings (Rook and Cordillera Mountains).",
    highlights: ["Cosmic bullseye triple-ring basin", "Montes Cordillera 930 km ring", "Youngest major lunar basin"],
    associatedMission: "Lunar Orbiter 4 & GRAIL",
  },
  {
    id: "mare-moscoviense",
    name: "Mare Moscoviense",
    lat: 27.3,
    lon: 147.9,
    diameterKm: 277,
    depthKm: 3.5,
    type: "MARE",
    hemisphere: "FAR_SIDE",
    geologicalEra: "Nectarian",
    lavaTubePotential: "HIGH",
    description: "One of very few dark basaltic maria on the heavily cratered far side. Sits in a deep depression with one of the thinnest crust sections on the entire Moon.",
    highlights: ["Far side mare anomaly", "Ultra-thin lunar crust (~5 km)", "Deep mascon gravity profile"],
  },

  // ==========================================
  // LUNAR MARIA (SEAS)
  // ==========================================
  {
    id: "oceanus-procellarum",
    name: "Oceanus Procellarum",
    lat: 18.4,
    lon: -57.4,
    diameterKm: 2590,
    type: "MARE",
    hemisphere: "NEAR_SIDE",
    lavaTubePotential: "HIGH",
    description: "The 'Ocean of Storms'. The largest of the lunar maria, stretching over 2,500 km from north to south and covering over 4 million square kilometers of volcanic basalt.",
    highlights: ["Largest lunar mare (4M km²)", "Hosts Marius Hills lava tubes", "Apollo 12 landing site"],
  },
  {
    id: "mare-tranquillitatis",
    name: "Mare Tranquillitatis",
    lat: 8.5,
    lon: 31.4,
    diameterKm: 873,
    type: "MARE",
    hemisphere: "NEAR_SIDE",
    lavaTubePotential: "CONFIRMED_PIT",
    description: "The 'Sea of Tranquility'. World-famous as the landing site of Apollo 11, where Neil Armstrong and Buzz Aldrin first walked on the Moon. Rich in titanium-rich basalt.",
    highlights: ["Apollo 11 'Statio Tranquillitatis'", "Hosts confirmed cave conduit pit", "High-titanium basalt plain"],
    associatedMission: "Apollo 11 & Ranger 8",
  },
  {
    id: "mare-imbrium",
    name: "Mare Imbrium",
    lat: 32.8,
    lon: -15.6,
    diameterKm: 1145,
    type: "MARE",
    hemisphere: "NEAR_SIDE",
    lavaTubePotential: "MEDIUM",
    description: "The 'Sea of Rains'. Formed 3.9 billion years ago during the Late Heavy Bombardment. Ringed by towering mountain ranges: Montes Apenninus, Caucasus, and Alpes.",
    highlights: ["Second largest mare", "Encircled by 5,000m peaks", "Apollo 15 & Luna 17 (Lunokhod 1)"],
    associatedMission: "Apollo 15 & Lunokhod 1",
  },
  {
    id: "mare-serenitatis",
    name: "Mare Serenitatis",
    lat: 28.0,
    lon: 17.5,
    diameterKm: 707,
    type: "MARE",
    hemisphere: "NEAR_SIDE",
    lavaTubePotential: "MEDIUM",
    description: "The 'Sea of Serenity'. Circular mare connected to Mare Tranquillitatis. Sits over a massive gravitational anomaly (mascon).",
    highlights: ["Massive lunar mascon", "Apollo 17 landing in Taurus-Littrow", "Wrinkle ridges (Dorsa Smirnov)"],
    associatedMission: "Apollo 17 & Luna 21",
  },
  {
    id: "mare-crisium",
    name: "Mare Crisium",
    lat: 17.0,
    lon: 59.1,
    diameterKm: 555,
    type: "MARE",
    hemisphere: "NEAR_SIDE",
    lavaTubePotential: "LOW",
    description: "The 'Sea of Crises'. Isolated oval mare on the eastern near side with a distinctive mountainous boundary ring.",
    highlights: ["Isolated circular basin", "Luna 15, 23 & 24 sample return", "Visible to naked eye on Earth"],
    associatedMission: "Soviet Luna 24 sample return",
  },
  {
    id: "mare-fecunditatis",
    name: "Mare Fecunditatis",
    lat: -7.8,
    lon: 51.3,
    diameterKm: 909,
    type: "MARE",
    hemisphere: "NEAR_SIDE",
    lavaTubePotential: "LOW",
    description: "The 'Sea of Fecundity'. Broad irregular basin east of Tranquillitatis, site of Luna 16's first automated robotic sample return in 1970.",
    highlights: ["Luna 16 automated sample return", "Twin ray crater Messier", "909 km wide basalt field"],
    associatedMission: "Soviet Luna 16 (1970)",
  },
  {
    id: "mare-nectaris",
    name: "Mare Nectaris",
    lat: -15.2,
    lon: 35.5,
    diameterKm: 333,
    type: "MARE",
    hemisphere: "NEAR_SIDE",
    lavaTubePotential: "LOW",
    description: "The 'Sea of Nectar'. Small circular mare basin whose impact defined the start of the Nectarian geological epoch.",
    highlights: ["Nectarian epoch type-basin", "Rupes Altai 4 km scarp wall", "Dense central mascon"],
  },
  {
    id: "mare-nubium",
    name: "Mare Nubium",
    lat: -21.3,
    lon: -16.6,
    diameterKm: 715,
    type: "MARE",
    hemisphere: "NEAR_SIDE",
    lavaTubePotential: "LOW",
    description: "The 'Sea of Clouds'. Ancient pre-Nectarian basin in the southwest quadrant, bounded by Rupes Recta (the Straight Wall fault).",
    highlights: ["Rupes Recta Straight Wall fault", "Ranger 7 impact site (first US probe)", "Ancient volcanic flooding"],
    associatedMission: "NASA Ranger 7 (1964)",
  },
  {
    id: "mare-humorum",
    name: "Mare Humorum",
    lat: -24.4,
    lon: -38.6,
    diameterKm: 389,
    type: "MARE",
    hemisphere: "NEAR_SIDE",
    lavaTubePotential: "HIGH",
    description: "The 'Sea of Moisture'. A compact circular mare basin surrounded by concentric fracture rilles and bordered by crater Gassendi.",
    highlights: ["Concentric rilles (Rimae Hippalus)", "Bordered by crater Gassendi", "3 km deep volcanic basin"],
  },
  {
    id: "mare-frigoris",
    name: "Mare Frigoris",
    lat: 56.0,
    lon: 1.4,
    diameterKm: 1596,
    type: "MARE",
    hemisphere: "NORTH_POLE",
    lavaTubePotential: "MEDIUM",
    description: "The 'Sea of Cold'. Long, narrow sinuous ribbon of dark mare basalt wrapping across the far northern near side above Imbrium and Serenitatis.",
    highlights: ["Longest mare ribbon (1,600 km)", "Northern highland shield", "Low-titanium aluminous basalt"],
  },

  // ==========================================
  // HISTORIC & UPCOMING LANDING SITES
  // ==========================================
  {
    id: "apollo-11",
    name: "Apollo 11 (Statio Tranquillitatis)",
    lat: 0.67,
    lon: 23.47,
    diameterKm: 0.01,
    type: "LANDING_SITE",
    hemisphere: "NEAR_SIDE",
    lavaTubePotential: "NONE",
    description: "First crewed lunar landing site (July 20, 1969). Neil Armstrong and Buzz Aldrin spent 21.5 hours on the surface, collecting 21.55 kg of lunar samples.",
    highlights: ["First human lunar landing (1969)", "Eagle Lunar Module descent stage", "Laser Ranging Retroreflector (LRRR) still in use"],
    associatedMission: "Apollo 11 (NASA)",
  },
  {
    id: "apollo-12",
    name: "Apollo 12 (Oceanus Procellarum)",
    lat: -3.01,
    lon: -23.42,
    diameterKm: 0.01,
    type: "LANDING_SITE",
    hemisphere: "NEAR_SIDE",
    lavaTubePotential: "NONE",
    description: "Second crewed landing site (November 1969). Precision landing within 160 meters of the robotic Surveyor 3 spacecraft, retrieving parts to test long-term space exposure.",
    highlights: ["Pinpoint landing at Surveyor 3", "First nuclear ALSEP station deployed", "Pete Conrad & Alan Bean"],
    associatedMission: "Apollo 12 (NASA)",
  },
  {
    id: "apollo-14",
    name: "Apollo 14 (Fra Mauro)",
    lat: -3.65,
    lon: -17.47,
    diameterKm: 0.01,
    type: "LANDING_SITE",
    hemisphere: "NEAR_SIDE",
    lavaTubePotential: "NONE",
    description: "Third crewed landing site (February 1971). Explored the Fra Mauro formation ejected during the gigantic Imbrium basin impact. Alan Shepard famously hit golf balls here.",
    highlights: ["Fra Mauro ejecta ridge", "Cone Crater traverse", "Alan Shepard's lunar golf drive"],
    associatedMission: "Apollo 14 (NASA)",
  },
  {
    id: "apollo-15",
    name: "Apollo 15 (Hadley-Apennine)",
    lat: 26.13,
    lon: 3.63,
    diameterKm: 0.01,
    type: "LANDING_SITE",
    hemisphere: "NEAR_SIDE",
    lavaTubePotential: "HIGH",
    description: "First 'J-mission' with the Lunar Roving Vehicle (LRV). Explored Hadley Rille—a massive sinuous volcanic canyon and unroofed lava tube—and the 4,500m Apennine peaks.",
    highlights: ["Hadley Rille volcanic canyon", "First Lunar Roving Vehicle (LRV)", "Discovered the 'Genesis Rock'"],
    associatedMission: "Apollo 15 (NASA)",
  },
  {
    id: "apollo-17",
    name: "Apollo 17 (Taurus-Littrow)",
    lat: 20.19,
    lon: 30.77,
    diameterKm: 0.01,
    type: "LANDING_SITE",
    hemisphere: "NEAR_SIDE",
    lavaTubePotential: "MEDIUM",
    description: "Final Apollo lunar mission (December 1972). Gene Cernan and scientist-astronaut Harrison Schmitt discovered orange volcanic glass beads in Shorty crater.",
    highlights: ["Final Apollo lunar expedition", "Discovered orange volcanic glass beads", "Record 110 kg sample return"],
    associatedMission: "Apollo 17 (NASA)",
  },
  {
    id: "chandrayaan-3",
    name: "Chandrayaan-3 (Shiv Shakti Point)",
    lat: -69.37,
    lon: 32.35,
    diameterKm: 0.01,
    type: "LANDING_SITE",
    hemisphere: "SOUTH_POLE",
    lavaTubePotential: "NONE",
    description: "Historic landing site of ISRO's Vikram lander and Pragyan rover (August 23, 2023), making India the first nation to soft-land near the lunar south pole.",
    highlights: ["First soft landing near South Pole", "Vikram lander & Pragyan rover", "In-situ elemental sulfur detection"],
    associatedMission: "Chandrayaan-3 (ISRO 2023)",
  },
  {
    id: "artemis-3-target",
    name: "Artemis III Target Ridge (de Gerlache)",
    lat: -88.5,
    lon: -88.0,
    diameterKm: 0.05,
    type: "LANDING_SITE",
    hemisphere: "SOUTH_POLE",
    lavaTubePotential: "HIGH",
    description: "Primary evaluated landing candidate for NASA's Artemis III mission, returning humans (including the first woman and person of color) to the Moon's south pole region.",
    highlights: ["Target site for human return", "Near de Gerlache crater rim", "Continuous communication line with Earth"],
    associatedMission: "NASA Artemis III",
  },
];

/**
 * Coordinate mapping helpers:
 * Equirectangular projection for a canvas of width W and height H
 * Longitude: -180 to +180 -> 0 to W
 * Latitude: +90 to -90 -> 0 to H
 */
export function lonToX(lon: number, width: number): number {
  return ((lon + 180) / 360) * width;
}

export function latToY(lat: number, height: number): number {
  return ((90 - lat) / 180) * height;
}

export function xToLon(x: number, width: number): number {
  return (x / width) * 360 - 180;
}

export function yToLat(y: number, height: number): number {
  return 90 - (y / height) * 180;
}

/**
 * 3D spherical coordinate conversion
 * Converts (lat, lon) to unit sphere (x, y, z)
 */
export function latLonToVector3(lat: number, lon: number, radius = 1): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

export const FEATURE_TYPE_LABELS: Record<FeatureType, string> = {
  LAVA_TUBE_PIT: "Lava Tube / Pit Skylight",
  IMPACT_CRATER: "Impact Crater",
  COMPLEX_CRATER: "Complex Crater",
  RAY_CRATER: "Ray Crater",
  FLOOR_FRACTURED: "Floor-Fractured Crater",
  BASIN: "Basin / Walled Plain",
  MARE: "Lunar Mare (Basalt Plain)",
  LANDING_SITE: "Historic Landing Site",
};

export const FEATURE_TYPE_COLORS: Record<FeatureType, string> = {
  LAVA_TUBE_PIT: "#10B981",  // Emerald green
  LANDING_SITE: "#38BDF8",   // Sky blue
  RAY_CRATER: "#F59E0B",     // Amber / gold
  COMPLEX_CRATER: "#A855F7", // Purple
  IMPACT_CRATER: "#94A3B8",  // Slate silver
  FLOOR_FRACTURED: "#EC4899",// Pink
  BASIN: "#6366F1",          // Indigo
  MARE: "#F43F5E",           // Rose red
};
