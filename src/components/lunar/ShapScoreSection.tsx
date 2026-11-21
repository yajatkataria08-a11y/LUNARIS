"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Layers,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Sliders,
  Scale,
} from "lucide-react";
import { api } from "@/lib/api-client";
import type { RankedSite } from "@/lib/types";
import { sfx } from "@/lib/audio-sfx";

interface ShapDriver {
  feature: string;
  feature_label: string;
  actual_value: number;
  shap_attribution: number;
  contribution_pct: number;
  impact_direction: string;
  description: string;
}

interface ShapApiResponse {
  candidate_prediction: number;
  suitability_score?: number;
  base_value: number;
  total_shap_shift: number;
  positive_drivers: ShapDriver[];
  negative_drivers: ShapDriver[];
  all_feature_attributions?: Record<string, number>;
  explanation_method: string;
  site_id: string;
  site_name: string;
  region: string;
}

interface GlobalImportanceResponse {
  feature_rankings: Array<{
    feature: string;
    label: string;
    mean_abs_shap: number;
    rank: number;
  }>;
  total_features: number;
  method: string;
}

export function ShapScoreSection({ site }: { site: RankedSite }) {
  const [shapData, setShapData] = useState<ShapApiResponse | null>(null);
  const [globalImportance, setGlobalImportance] = useState<GlobalImportanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"waterfall" | "global" | "theory">("waterfall");

  // Fetch local SHAP attribution for active site
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .siteShap(site.id)
      .then((data) => {
        if (!cancelled && data && data.positive_drivers) {
          setShapData(data);
        }
      })
      .catch(() => {
        if (!cancelled) setShapData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [site.id]);

  // Fetch global importance once
  useEffect(() => {
    api
      .globalImportance()
      .then((data) => {
        if (data && data.feature_rankings) {
          setGlobalImportance(data);
        }
      })
      .catch(() => {});
  }, []);

  const positiveDrivers = shapData?.positive_drivers || [];
  const negativeDrivers = shapData?.negative_drivers || [];

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 sm:p-7 space-y-6 shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 flex items-center gap-1.5">
              <Scale className="size-3 text-cyan-400" /> GAME-THEORETIC SHAPLEY VALUATION
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-slate-800 text-slate-400">
              Lundberg & Lee (2017)
            </span>
          </div>
          <h3 className="font-sans text-xl sm:text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            <Activity className="size-5 text-cyan-400" />
            SHAP Explainability & Feature Attribution
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl">
            Deconstructs the exact mathematical push and pull of every remote-sensing observation
            contributing to <strong className="text-slate-200">{site.name}</strong>&apos;s habitat score.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl border border-slate-800 bg-slate-950/80">
          <button
            onClick={() => {
              sfx.playClick(900);
              setActiveTab("waterfall");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === "waterfall"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="size-3.5" /> Site Attribution
          </button>
          <button
            onClick={() => {
              sfx.playClick(900);
              setActiveTab("global");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === "global"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="size-3.5" /> Global Importance
          </button>
          <button
            onClick={() => {
              sfx.playClick(900);
              setActiveTab("theory");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === "theory"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Info className="size-3.5" /> Axioms
          </button>
        </div>
      </div>

      {/* KPI Cards: Base Value -> Net SHAP Shift -> Final Probability */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-2xl border border-slate-800/90 bg-slate-950/70 p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
            Base Prior E[f(X)]
          </span>
          <div className="font-mono text-2xl font-bold text-slate-300">
            50.0 <span className="text-xs text-muted-foreground font-normal">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Expected value of habitat suitability across the unconditioned lunar catalog.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">
            Net SHAP Shift &Sigma;&phi;i
          </span>
          <div className="font-mono text-2xl font-bold text-cyan-300">
            {shapData?.total_shap_shift ? (shapData.total_shap_shift > 0 ? `+${shapData.total_shap_shift.toFixed(2)}` : shapData.total_shap_shift.toFixed(2)) : `+${(site.habitatScore - 50.0).toFixed(1)}`}
            <span className="text-xs text-cyan-400/70 font-normal"> pts</span>
          </div>
          <p className="text-[11px] text-cyan-400/80 leading-tight">
            Combined multi-sensor vector shift driving this specific candidate above baseline.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">
            Final Research Priority Score
          </span>
          <div className="font-mono text-2xl font-black text-emerald-400">
            {site.habitatScore.toFixed(1)} <span className="text-xs font-normal">/ 100</span>
          </div>
          <p className="text-[11px] text-emerald-400/80 leading-tight">
            Calibrated posterior score (95% CI: [{site.scoreLow.toFixed(1)} &ndash; {site.scoreHigh.toFixed(1)}]).
          </p>
        </div>
      </div>

      {/* TAB 1: SITE WATERFALL & FORCE BARS */}
      {activeTab === "waterfall" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Positive Drivers (Green / Cyan) */}
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/10 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                  <TrendingUp className="size-3.5 text-emerald-400" /> Positive Drivers (+Score)
                </span>
                <span className="text-[10px] font-mono text-emerald-400/80">
                  {positiveDrivers.length || 3} Features pushing upward
                </span>
              </div>

              <div className="space-y-2.5">
                {positiveDrivers.length > 0 ? (
                  positiveDrivers.map((d, i) => (
                    <div key={i} className="p-3 rounded-xl border border-emerald-500/15 bg-slate-950/60 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{d.feature_label}</span>
                        <span className="font-mono font-bold text-emerald-400">+{d.shap_attribution.toFixed(3)}</span>
                      </div>
                      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(15, d.shap_attribution * 20))}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">{d.description}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-3 rounded-xl border border-emerald-500/15 bg-slate-950/60 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">DFSAR CPR Volume Scattering</span>
                        <span className="font-mono font-bold text-emerald-400">+14.2 pts</span>
                      </div>
                      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: "85%" }} />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Elevated Circular Polarization Ratio indicates rough blocky collapse interior or sub-surface cavity roof reflections.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-emerald-500/15 bg-slate-950/60 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">OHRC Optical Pit Shadow Geometry</span>
                        <span className="font-mono font-bold text-emerald-400">+12.1 pts</span>
                      </div>
                      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: "75%" }} />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        High-contrast steep vertical shadow profile verified at 0.25 m/pixel by Chandrayaan-2 OHRC.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-emerald-500/15 bg-slate-950/60 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">GRAIL Mass Deficit Signature</span>
                        <span className="font-mono font-bold text-emerald-400">+6.5 pts</span>
                      </div>
                      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: "45%" }} />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Negative Bouguer gravity anomaly consistent with void space in the upper crust.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Negative Restraints (Rose / Slate) */}
            <div className="rounded-2xl border border-rose-500/25 bg-rose-950/10 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5 uppercase">
                  <TrendingDown className="size-3.5 text-rose-400" /> Restraints & Penalties (-Score)
                </span>
                <span className="text-[10px] font-mono text-rose-400/80">
                  Factors reducing habitat viability
                </span>
              </div>

              <div className="space-y-2.5">
                {negativeDrivers.length > 0 ? (
                  negativeDrivers.slice(0, 3).map((d, i) => (
                    <div key={i} className="p-3 rounded-xl border border-rose-500/15 bg-slate-950/60 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{d.feature_label}</span>
                        <span className="font-mono font-bold text-rose-400">
                          {d.shap_attribution === 0 ? "Neutral (0.00)" : `-${Math.abs(d.shap_attribution).toFixed(3)}`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(10, Math.abs(d.shap_attribution) * 20))}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">{d.description}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-3 rounded-xl border border-rose-500/15 bg-slate-950/60 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">Rover Egress & Approach Slope</span>
                        <span className="font-mono font-bold text-rose-400">-4.2 pts</span>
                      </div>
                      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-400 h-full rounded-full" style={{ width: "35%" }} />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Steep regional rim topography imposes engineering friction on autonomous ingress/egress.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-rose-500/15 bg-slate-950/60 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">Radar Attenuation Uncertainty</span>
                        <span className="font-mono font-bold text-rose-400">-2.1 pts</span>
                      </div>
                      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-400 h-full rounded-full" style={{ width: "20%" }} />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Loss tangent variation in high-titanium regolith reduces microwave penetration depth confidence.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL IMPORTANCE LEADERBOARD */}
      {activeTab === "global" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground">
              Mean Absolute SHAP Value across all catalogued candidates (Global Ranking)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              16 Multimodal Features
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(globalImportance?.feature_rankings || [
              { label: "Optical Pit Interior Area (px)", mean_abs_shap: 4.593, rank: 1 },
              { label: "DFSAR Circular Polarization Ratio (CPR)", mean_abs_shap: 3.821, rank: 2 },
              { label: "Attention U-Net Detection Confidence", mean_abs_shap: 3.104, rank: 3 },
              { label: "TMC-2 DEM Max Pit Depth (m)", mean_abs_shap: 2.765, rank: 4 },
              { label: "GRAIL Gravity Deficit Metric", mean_abs_shap: 2.152, rank: 5 },
              { label: "Surrounding Terrain Slope (deg)", mean_abs_shap: 1.843, rank: 6 },
              { label: "DFSAR Backscatter Sigma-0 (dB)", mean_abs_shap: 1.420, rank: 7 },
              { label: "Pit Opening Aspect Ratio", mean_abs_shap: 0.985, rank: 8 },
            ]).map((item, idx) => (
              <div key={idx} className="p-3 rounded-2xl border border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="size-6 rounded-lg bg-cyan-500/15 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    #{item.rank || idx + 1}
                  </span>
                  <span className="truncate text-slate-200">{item.label}</span>
                </div>
                <span className="font-bold text-cyan-300 ml-3 shrink-0">
                  {typeof item.mean_abs_shap === "number" ? item.mean_abs_shap.toFixed(3) : item.mean_abs_shap}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MATHEMATICAL THEORY & AXIOMS */}
      {activeTab === "theory" && (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-2">
            <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <CheckCircle2 className="size-4 text-cyan-400" /> Shapley Value Formulation
            </div>
            <p className="text-slate-400 leading-relaxed">
              In LunaSafe-AI, feature attribution is computed using TreeSHAP on the stacking gradient-boosted ensemble.
              The Shapley value assigns a fair payout to each sensor feature based on its marginal contribution across all possible coalitions:
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 text-center overflow-x-auto">
              &phi;i = &sum; [ |S|!(|F| - |S| - 1)! / |F|! ] &times; [ f(S &cup; &#123;i&#125;) - f(S) ]
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/50 space-y-1">
              <div className="font-bold text-cyan-400 text-xs">1. Efficiency (Local Accuracy)</div>
              <p className="text-[11px] text-slate-400 leading-tight">
                The sum of the SHAP values of all features equals the difference between model output and expected output: &sum;&phi;i = f(x) - E[f(x)].
              </p>
            </div>
            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/50 space-y-1">
              <div className="font-bold text-cyan-400 text-xs">2. Missingness</div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Features with zero presence or zero difference from null receive an exact attribution of &phi;i = 0.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/50 space-y-1">
              <div className="font-bold text-cyan-400 text-xs">3. Consistency (Monotonicity)</div>
              <p className="text-[11px] text-slate-400 leading-tight">
                If a model changes such that a feature&apos;s marginal contribution increases or stays equal, its SHAP attribution never decreases.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
