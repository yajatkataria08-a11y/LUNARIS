"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  Sparkles,
  MapPin,
  Maximize,
  Shield,
  Layers,
  Rocket,
  Info,
  X,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  FileText,
  ChevronDown,
  ChevronUp,
  Database,
  ShieldCheck,
  ShieldAlert,
  BarChart2,
} from "lucide-react";
import {
  LunarFeature,
  FEATURE_TYPE_LABELS,
  FEATURE_TYPE_COLORS,
  getFeatureMLAssessment,
  MLCandidateAssessment,
} from "@/lib/lunar-craters-data";
import { sfx } from "@/lib/audio-sfx";

interface CraterDetailCardProps {
  feature: LunarFeature;
  onClose?: () => void;
  onFlyTo?: () => void;
  className?: string;
  liveSites?: Array<{
    id: string;
    name?: string;
    habitatScore?: number;
    scoreLow?: number;
    scoreHigh?: number;
    detection?: any;
    roof?: any;
    gate_status?: string;
  }>;
}

interface AnalogTwinInfo {
  station: string;
  location: string;
  permittivity: number;
  lossTangent: number;
  sensors: string;
  analogy: string;
}

function getAnalogTwin(featureId: string): AnalogTwinInfo {
  const id = featureId.toLowerCase();
  if (id.includes("marius")) {
    return {
      station: "Kutch Continental Rift Basalt Field",
      location: "Gujarat, India (23.73°N, 69.86°E)",
      permittivity: 8.1,
      lossTangent: 0.012,
      sensors: "RISAT-1A SAR & CartoDEM",
      analogy: "Subsurface magma conduits and columnar basalt jointing with arid regolith dielectric profile.",
    };
  }
  if (id.includes("tranquillitatis") || id.includes("serenitatis") || id.includes("ingenii") || id.includes("fecunditatis")) {
    return {
      station: "Deccan Volcanic Province (Western Ghats Escarpment)",
      location: "Maharashtra, India (17.92°N, 73.66°E)",
      permittivity: 7.4,
      lossTangent: 0.015,
      sensors: "RISAT-1/1A C-band SAR & Resourcesat LISS-4",
      analogy: "Thick continental flood basalt flows with subsurface lava tubes and collapsed skylight rims.",
    };
  }
  return {
    station: "Lonar Impact Crater in Basalt Bedrock",
    location: "Buldhana, Maharashtra, India (19.98°N, 76.51°E)",
    permittivity: 6.8,
    lossTangent: 0.018,
    sensors: "Cartosat-3 Pan/MX & RISAT-1 FRS",
    analogy: "Hypervelocity impact into basaltic bedrock; grounds radar double-bounce and rim collapse physics.",
  };
}

export function CraterDetailCard({
  feature,
  onClose,
  onFlyTo,
  className = "",
  liveSites,
}: CraterDetailCardProps) {
  const [showJsonTelemetry, setShowJsonTelemetry] = useState(false);
  const [assessmentMode, setAssessmentMode] = useState<"natural" | "remediated">("natural");
  const [showShap, setShowShap] = useState(false);
  const [shapData, setShapData] = useState<null | {
    ensemble_proba: number;
    base_probas: Record<string, number>;
    shap_attribution: Record<string, number>;
    shap_waterfall: Array<{ feature: string; shap_value: number; cumulative: number; direction: string; base_value: number }>;
    shap_available: boolean;
    disclaimer: string;
  }>(null);
  const [shapLoading, setShapLoading] = useState(false);
  const [shapError, setShapError] = useState<string | null>(null);

  const twin = useMemo(() => getAnalogTwin(feature.id), [feature.id]);
  const color = FEATURE_TYPE_COLORS[feature.type];
  const typeLabel = FEATURE_TYPE_LABELS[feature.type];
  const assessment: MLCandidateAssessment = getFeatureMLAssessment(feature, liveSites);

  const fetchShap = async (siteId: string) => {
    setShapLoading(true);
    setShapError(null);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/shap/${siteId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setShapData(data);
    } catch (e: any) {
      setShapError(e.message || "Failed to fetch SHAP data");
    } finally {
      setShapLoading(false);
    }
  };

  const formatCoord = (lat: number, lon: number) => {
    const latStr = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"}`;
    const lonStr = `${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? "E" : "W"}`;
    return `${latStr}, ${lonStr}`;
  };

  return (
    <div
      className={`glass-royal-deck rounded-3xl border border-amber-600/35 dark:border-amber-400/30 p-5 flex flex-col gap-4 shadow-2xl relative backdrop-blur-xl ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              style={{ backgroundColor: `${color}25`, color, borderColor: `${color}50` }}
              className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1"
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
              {typeLabel}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-border text-muted-foreground">
              {feature.hemisphere.replace("_", " ")}
            </span>
            {assessment.rank && (
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40">
                RANK #{assessment.rank} IN ML PIPELINE
              </span>
            )}
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">
            {feature.name}
          </h2>
        </div>

        {onClose && (
          <button
            onClick={() => {
              sfx.playClick(800);
              onClose();
            }}
            className="p-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10"
            title="Close dossier"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* AUTHENTIC ML PIPELINE SCORE (0 to 100) — ZERO FAKE DATA */}
      {/* ======================================================== */}
      <div
        className={`rounded-2xl border p-4 transition-all relative overflow-hidden ${
          assessment.isCandidate && assessment.score > 0
            ? "border-emerald-500/50 bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950/80 shadow-lg shadow-emerald-950/30"
            : "border-slate-800 bg-slate-900/50"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
              <Activity className="size-3 text-amber-400" />
              ML Research-Priority Score (out of 100)
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              {assessment.isCandidate && assessment.score > 0
                ? "Candidate Volcanic Cave Ingestion Engine v5.0"
                : "Baseline Reference / Non-Volcanic Landmark"}
            </span>
          </div>

          <span
            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              assessment.isCandidate && assessment.score > 0
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-800/80 text-slate-400 border-slate-700"
            }`}
          >
            {assessment.isCandidate && assessment.score > 0 ? (
              <>
                <CheckCircle2 className="size-3 text-emerald-400" />
                GATES PASSED
              </>
            ) : (
              <>
                <ShieldAlert className="size-3 text-slate-400" />
                GATE 2 EXCLUDED
              </>
            )}
          </span>
        </div>

        {/* Dual-Mode Selector for Candidates */}
        {assessment.isCandidate && assessment.score > 0 && assessment.remediatedScore !== undefined && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl my-2">
            <button
              onClick={() => {
                sfx.playClick(900);
                setAssessmentMode("natural");
              }}
              className={`flex-1 text-[10px] font-mono font-bold py-1 px-2 rounded-lg transition-all ${
                assessmentMode === "natural"
                  ? "bg-slate-800 text-slate-100 shadow-sm border border-slate-700"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Natural Remote-Sensing ({assessment.score.toFixed(1)})
            </button>
            <button
              onClick={() => {
                sfx.playClick(900);
                setAssessmentMode("remediated");
              }}
              className={`flex-1 text-[10px] font-mono font-bold py-1 px-2 rounded-lg transition-all ${
                assessmentMode === "remediated"
                  ? "bg-cyan-500/20 text-cyan-200 shadow-sm border border-cyan-500/50"
                  : "text-muted-foreground hover:text-cyan-300"
              }`}
            >
              Planetary Engineered ({assessment.remediatedScore.toFixed(1)})
            </button>
          </div>
        )}

        {/* Large Score Meter Display */}
        <div className="flex items-baseline justify-between mt-1">
          <div className="flex items-baseline gap-2">
            <span
              className={`font-serif text-4xl sm:text-5xl font-black tracking-tight ${
                assessment.isCandidate && assessment.score > 0
                  ? assessmentMode === "remediated"
                    ? "text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    : "text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                  : "text-slate-400"
              }`}
            >
              {assessment.isCandidate && assessment.score > 0
                ? (assessmentMode === "remediated" && assessment.remediatedScore !== undefined
                    ? assessment.remediatedScore.toFixed(1)
                    : assessment.score.toFixed(1))
                : "0.0"}
            </span>
            <span className="text-base font-mono font-bold text-muted-foreground">/ 100</span>
            {assessmentMode === "remediated" && assessment.remediationLift && assessment.remediationLift > 0 ? (
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                +{assessment.remediationLift.toFixed(1)} LIFT
              </span>
            ) : null}
          </div>

          {assessment.isCandidate && assessment.score > 0 ? (
            <div className="text-right font-mono text-xs">
              <span className="text-[10px] text-muted-foreground block">
                {assessmentMode === "remediated" ? "ENGINEERING FRAMEWORK" : "95% CREDIBLE INTERVAL"}
              </span>
              <span className="font-bold text-amber-400">
                {assessmentMode === "remediated"
                  ? (assessment.remediatedTier || "ENGINEERED TIER 1")
                  : `[${assessment.credibleInterval95[0].toFixed(1)} – ${assessment.credibleInterval95[1].toFixed(1)}]`}
              </span>
            </div>
          ) : (
            <div className="text-right font-mono text-xs">
              <span className="text-[10px] text-muted-foreground block">ML STATUS</span>
              <span className="font-bold text-slate-400">IMPACT CRATER</span>
            </div>
          )}
        </div>

        {/* Engineered Remediation Explanation Card */}
        {assessment.isCandidate && assessmentMode === "remediated" && assessment.bottleneck && (
          <div className="mt-3 p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/25 space-y-2 text-xs">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Rocket className="size-3 text-cyan-400" />
              Planetary Engineering Countermeasure
            </div>
            <div className="text-slate-200 leading-snug">
              <strong className="text-slate-400">Bottleneck:</strong> {assessment.bottleneck}
            </div>
            <div className="text-cyan-100/90 leading-snug">
              <strong className="text-cyan-400">Architecture:</strong> {assessment.engineeringArchitecture}
            </div>
            {assessment.sensingUpgrade && (
              <div className="text-slate-300 text-[11px] leading-snug">
                <strong className="text-slate-400">Sensing Upgrade:</strong> {assessment.sensingUpgrade}
              </div>
            )}
          </div>
        )}

        {/* Natural Score Context Hint for Degraded Sites */}
        {assessment.isCandidate && assessmentMode === "natural" && assessment.score < 70 && assessment.bottleneck && (
          <div className="mt-2.5 p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-200/90 flex items-start gap-2">
            <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Why is this natural score lower?</span> {assessment.bottleneck}
              <div className="text-[11px] text-amber-300/80 mt-1">
                Switch to <strong>Planetary Engineered</strong> above to see how deployable robotic ramps or rubble clearance elevate this site to <strong>{assessment.remediatedScore?.toFixed(1)}/100</strong>.
              </div>
            </div>
          </div>
        )}

        {/* Candidate Multimodal Evidence Breakdown */}
        {assessment.isCandidate && assessment.score > 0 ? (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
              Observed Remote-Sensing Evidence Breakdown
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950/50 p-2 rounded-xl border border-border/40">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>OPTICAL PIT (OHRC/NAC)</span>
                  <span className="font-bold text-emerald-400">
                    {(assessment.opticalEvidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${assessment.opticalEvidence * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-950/50 p-2 rounded-xl border border-border/40">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>RADAR ANOMALY (MINI-RF)</span>
                  <span className="font-bold text-cyan-400">
                    {(assessment.radarEvidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full"
                    style={{ width: `${assessment.radarEvidence * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-950/50 p-2 rounded-xl border border-border/40">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>TOPO DEPRESSION (DEM)</span>
                  <span className="font-bold text-amber-400">
                    {(assessment.topoEvidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{ width: `${assessment.topoEvidence * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-950/50 p-2 rounded-xl border border-border/40">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>GRAVITY DEFICIT (GRAIL)</span>
                  <span className="font-bold text-indigo-400">
                    {(assessment.gravityEvidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-400 h-full rounded-full"
                    style={{ width: `${assessment.gravityEvidence * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Geomechanical Factor of Safety Simulation */}
            {assessment.geomechanics && (
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-border/50 text-[11px] font-mono mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[10px]">SIMULATED FACTOR OF SAFETY (FS):</span>
                  <span className="font-bold text-emerald-300">
                    Median: {assessment.geomechanics.medianFS.toFixed(1)} &bull; [{assessment.geomechanics.fsRange[0]} &ndash; {assessment.geomechanics.fsRange[1]}]
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Crown Tensile Range:</span>
                  <span className="text-slate-200">
                    {assessment.geomechanics.crownTensionMPa[0]} &ndash; {assessment.geomechanics.crownTensionMPa[1]} MPa
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Assumed Span & Roof:</span>
                  <span className="text-slate-200">
                    Span: {assessment.geomechanics.assumedSpanM[0]}&ndash;{assessment.geomechanics.assumedSpanM[1]}m, Roof: {assessment.geomechanics.assumedRoofM[0]}&ndash;{assessment.geomechanics.assumedRoofM[1]}m
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Impact Crater Gate 2 Exclusion Notice (Zero Fake Data Guarantee) */
          <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-muted-foreground space-y-1">
              <span className="font-bold text-slate-300 block">
                Scientific Pipeline Decision:
              </span>
              <p className="leading-relaxed text-[11px]">
                {assessment.gate2ExclusionReason}
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[10px] text-amber-400">
                <ShieldCheck className="size-3" />
                <span>Zero Fake Data Policy: Non-volcanic landmarks are not scored as habitats.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {feature.description}
      </p>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="rounded-2xl border border-border/50 bg-slate-900/40 p-2.5">
          <span className="text-[10px] text-muted-foreground block mb-0.5">COORDINATES</span>
          <span className="font-bold text-foreground">{formatCoord(feature.lat, feature.lon)}</span>
        </div>

        <div className="rounded-2xl border border-border/50 bg-slate-900/40 p-2.5">
          <span className="text-[10px] text-muted-foreground block mb-0.5">DIAMETER</span>
          <span className="font-bold text-foreground">
            {feature.diameterKm < 1
              ? `${Math.round(feature.diameterKm * 1000)} m`
              : `${feature.diameterKm.toLocaleString()} km`}
          </span>
        </div>

        {feature.depthKm !== undefined && (
          <div className="rounded-2xl border border-border/50 bg-slate-900/40 p-2.5">
            <span className="text-[10px] text-muted-foreground block mb-0.5">DEPTH</span>
            <span className="font-bold text-foreground">
              {feature.depthKm < 1
                ? `${Math.round(feature.depthKm * 1000)} m`
                : `${feature.depthKm} km`}
            </span>
          </div>
        )}

        {feature.geologicalEra && (
          <div className="rounded-2xl border border-border/50 bg-slate-900/40 p-2.5">
            <span className="text-[10px] text-muted-foreground block mb-0.5">ERA / AGE</span>
            <span className="font-bold text-amber-400">{feature.geologicalEra}</span>
          </div>
        )}
      </div>

      {/* Highlights */}
      {feature.highlights && feature.highlights.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
            Scientific Highlights & Features
          </span>
          <div className="flex flex-wrap gap-1.5">
            {feature.highlights.map((h, i) => (
              <span
                key={i}
                className="text-[11px] font-mono px-2.5 py-1 rounded-xl border border-border/60 bg-slate-900/30 text-slate-300"
              >
                &bull; {h}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Associated Space Mission */}
      {feature.associatedMission && (
        <div className="flex items-center gap-2 p-2.5 rounded-2xl border border-blue-500/30 bg-blue-500/10 text-xs">
          <Rocket className="size-4 text-blue-400 shrink-0" />
          <span className="font-mono text-slate-300 text-[11px]">
            <strong className="text-blue-300">Exploration Data:</strong> {feature.associatedMission}
          </span>
        </div>
      )}

      {/* ISRO MOSDAC Earth Volcanic Analog Twin Profile */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            ISRO MOSDAC Earth Analog Twin
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            &epsilon;r&apos; = {twin.permittivity}
          </span>
        </div>
        <div className="font-semibold text-foreground text-xs">{twin.station}</div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{twin.analogy}</p>
        <div className="pt-1 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 border-t border-emerald-500/20">
          <span>Sensors: {twin.sensors}</span>
          <span className="text-emerald-400/90">{twin.location}</span>
        </div>
      </div>

      {/* Scientific Provenance & Two-Claim Split Disclaimer */}
      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[10px] font-mono text-muted-foreground">
        <span className="text-amber-400/90 font-bold block mb-0.5">ML Data Provenance:</span>
        <span className="block leading-relaxed">{assessment.scientificDisclaimer}</span>
      </div>

      {/* Raw ML JSON Telemetry Toggle */}
      <div>
        <button
          onClick={() => {
            sfx.playClick(900);
            setShowJsonTelemetry(!showJsonTelemetry);
          }}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/30 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-all"
        >
          <span className="flex items-center gap-1.5">
            <Database className="size-3 text-cyan-400" /> Inspect Raw ML Pipeline JSON Telemetry
          </span>
          {showJsonTelemetry ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        </button>

        {showJsonTelemetry && (
          <pre className="mt-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300 overflow-x-auto max-h-48 leading-tight">
            {JSON.stringify(assessment, null, 2)}
          </pre>
        )}
      </div>

      {/* ── SHAP Ensemble Explainability Panel (v6.0) ── */}
      {feature.candidateSiteId && (
        <div className="rounded-2xl border border-violet-500/30 bg-violet-950/20 overflow-hidden">
          <button
            onClick={() => {
              sfx.playClick(800);
              const next = !showShap;
              setShowShap(next);
              if (next && !shapData && !shapLoading && feature.candidateSiteId) {
                fetchShap(feature.candidateSiteId);
              }
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-mono text-violet-300 hover:text-violet-100 transition-all"
          >
            <span className="flex items-center gap-1.5">
              <BarChart2 className="size-3.5 text-violet-400" />
              <strong>SHAP Ensemble Explainability</strong>
              <span className="text-violet-500/80">— v6.0 Attribution</span>
            </span>
            {showShap ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>

          {showShap && (
            <div className="px-3 pb-3 space-y-2">
              {/* Loading */}
              {shapLoading && (
                <div className="flex items-center gap-2 text-[11px] font-mono text-violet-400 animate-pulse py-2">
                  <Activity className="size-3.5" /> Computing SHAP via backend...
                </div>
              )}

              {/* Error — checkpoint not trained yet */}
              {shapError && (
                <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-[10px] font-mono text-amber-300">
                  <AlertTriangle className="size-3 inline mr-1" />
                  {shapError.includes("503") || shapError.includes("checkpoint")
                    ? "Ensemble not trained yet — run EnsembleRunner.train() to enable SHAP."
                    : shapError}
                </div>
              )}

              {/* SHAP Data */}
              {shapData && !shapLoading && (
                <div className="space-y-3">
                  {/* Ensemble Proba Header */}
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">Stacked Ensemble Proba</span>
                    <span
                      className={`font-bold text-[13px] ${
                        shapData.ensemble_proba > 0.6
                          ? "text-emerald-400"
                          : shapData.ensemble_proba > 0.4
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {(shapData.ensemble_proba * 100).toFixed(1)}%
                    </span>
                  </div>

                  {/* Base model probas */}
                  {shapData.base_probas && Object.keys(shapData.base_probas).length > 0 && (
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(shapData.base_probas).map(([model, p]) => (
                        <div key={model} className="flex items-center justify-between bg-slate-900/40 rounded-lg px-2 py-1 text-[9px] font-mono">
                          <span className="text-slate-400">{model.replace("LightGBM", "LGBM").replace("CatBoost", "CB").replace("RandomForest", "RF")}</span>
                          <span className="text-violet-300 font-bold">{(p * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SHAP Waterfall chart (pure SVG) */}
                  {shapData.shap_waterfall && shapData.shap_waterfall.length > 0 ? (
                    <div>
                      <p className="text-[9px] font-mono text-muted-foreground mb-1.5 uppercase tracking-widest">
                        Feature Attribution (SHAP)
                      </p>
                      <ShapWaterfallChart steps={shapData.shap_waterfall} />
                    </div>
                  ) : (
                    <p className="text-[10px] font-mono text-muted-foreground italic">
                      SHAP values not available (no TreeSHAP explainer checkpoint).
                    </p>
                  )}

                  <p className="text-[9px] font-mono text-violet-500/70 leading-relaxed">
                    {shapData.disclaimer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}      <div className="pt-2 flex flex-wrap gap-2 items-center justify-between border-t border-border/50">
        {onFlyTo && (
          <button
            onClick={() => {
              sfx.playSelect();
              onFlyTo();
            }}
            className="interactive-press inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-amber-500/50 bg-amber-500/10 text-amber-400 text-xs font-mono font-bold hover:bg-amber-500/20"
          >
            <Compass className="size-3.5" /> Center View
          </button>
        )}

        {feature.candidateSiteId ? (
          <Link
            href={`/pipelines`}
            onClick={() => sfx.playSelect()}
            className="sheen-sweep interactive-press inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-emerald-500/50 bg-emerald-600/80 text-white font-serif text-xs font-bold shadow-lg"
          >
            <span>VIEW CANDIDATE RADAR CONSOLE</span>
            <ArrowRight className="size-3.5" />
          </Link>
        ) : (
          <span className="text-[10px] font-mono text-muted-foreground">
            IAU / LRO Catalogued Landmark
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHAP Waterfall Chart — pure SVG, no external chart lib
// ─────────────────────────────────────────────────────────────────────────────

interface WaterfallStep {
  feature: string;
  shap_value: number;
  cumulative: number;
  direction: string;
  base_value: number;
}

function ShapWaterfallChart({ steps }: { steps: WaterfallStep[] }) {
  const BAR_H = 14;
  const GAP = 4;
  const LABEL_W = 128;
  const CHART_W = 160;
  const PADDING = 8;
  const totalH = steps.length * (BAR_H + GAP) + PADDING * 2 + 12;
  const svgW = LABEL_W + CHART_W + PADDING * 2;

  const maxAbs = Math.max(...steps.map((s) => Math.abs(s.shap_value)), 0.001);

  const abbrev = (name: string) =>
    name
      .replace("dem_", "DEM ")
      .replace("dfsar_", "SAR ")
      .replace("ohrc_", "OPT ")
      .replace("_score", "")
      .replace(/_m$/, "")
      .replace(/_deg/, "°")
      .replace("_db", " dB")
      .replace(/_/g, " ")
      .slice(0, 20);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${svgW} ${totalH}`}
      className="font-mono overflow-visible"
      style={{ fontSize: 8 }}
    >
      {steps.map((step, i) => {
        const y = PADDING + i * (BAR_H + GAP);
        const barLen = Math.abs(step.shap_value / maxAbs) * (CHART_W / 2 - 4);
        const isPos = step.direction === "positive";
        const midX = LABEL_W + PADDING + CHART_W / 2;
        const barX = isPos ? midX : midX - barLen;
        const fillColor = isPos ? "#34d399" : "#f87171";

        return (
          <g key={`${step.feature}-${i}`}>
            <text x={LABEL_W - 4} y={y + BAR_H / 2 + 3} textAnchor="end" fill="#94a3b8" fontSize={8}>
              {abbrev(step.feature)}
            </text>
            <line x1={midX} y1={y} x2={midX} y2={y + BAR_H} stroke="#334155" strokeWidth={0.5} />
            <rect x={barX} y={y + 1} width={Math.max(barLen, 1)} height={BAR_H - 2} fill={fillColor} opacity={0.8} rx={2} />
            <text
              x={isPos ? barX + barLen + 2 : barX - 2}
              y={y + BAR_H / 2 + 3}
              textAnchor={isPos ? "start" : "end"}
              fill={fillColor}
              fontSize={7}
              fontWeight="bold"
            >
              {isPos ? "+" : ""}{step.shap_value.toFixed(3)}
            </text>
          </g>
        );
      })}
      <text x={LABEL_W + PADDING + CHART_W / 2} y={totalH - 2} textAnchor="middle" fill="#475569" fontSize={7}>
        ← negative · E[f(x)] · positive →
      </text>
    </svg>
  );
}
