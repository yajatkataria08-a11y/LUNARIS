import React, { useState, useEffect } from "react";
import type { RankedSite } from "@/lib/types";
import { SCORE_WEIGHTS } from "@/lib/scoring";
import { api } from "@/lib/api-client";

interface ShapDriver {
  feature: string;
  feature_label: string;
  actual_value: number;
  shap_attribution: number;
  contribution_pct: number;
  impact_direction: string;
  description: string;
}

interface ShapExplanation {
  candidate_prediction: number;
  suitability_score: number;
  base_value: number;
  total_shap_shift: number;
  positive_drivers: ShapDriver[];
  negative_drivers: ShapDriver[];
  all_feature_attributions: ShapDriver[];
  explanation_method: string;
}

interface IsroLhiData {
  site_id: string;
  site_name: string;
  region: string;
  isro_lhi_score: number;
  exploration_tier: string;
  tier_label: string;
  sub_scores: {
    ohrc_overhang_score: number;
    dfsar_polarimetry_score: number;
    tmc2_slope_access_score: number;
    physics_fos_stability_score: number;
    chaste_thermal_insulation_score: number;
  };
  isro_primary_datasources: string[];
  methodology_grounding: string;
}

/** Shows exactly how many points each factor added to the 0–100 habitat score, with SHAP and ISRO Chandrayaan views. */
export function ScoreBreakdown({ site }: { site: RankedSite }) {
  const [viewMode, setViewMode] = useState<"heuristic" | "shap" | "isro">("heuristic");

  const [shapData, setShapData] = useState<ShapExplanation | null>(null);
  const [loadingShap, setLoadingShap] = useState<boolean>(false);
  const [shapError, setShapError] = useState<string | null>(null);

  const [isroData, setIsroData] = useState<IsroLhiData | null>(null);
  const [loadingIsro, setLoadingIsro] = useState<boolean>(false);
  const [isroError, setIsroError] = useState<string | null>(null);

  useEffect(() => {
    if (viewMode === "shap" && !shapData && !loadingShap) {
      setLoadingShap(true);
      setShapError(null);
      api
        .siteShap(site.id)
        .then((res) => {
          setShapData(res);
          setLoadingShap(false);
        })
        .catch((err) => {
          setShapError(err.message || "Failed to load SHAP attribution data.");
          setLoadingShap(false);
        });
    } else if (viewMode === "isro" && !isroData && !loadingIsro) {
      setLoadingIsro(true);
      setIsroError(null);
      api
        .isroLhi(site.id)
        .then((res) => {
          setIsroData(res);
          setLoadingIsro(false);
        })
        .catch((err) => {
          setIsroError(err.message || "Failed to load ISRO LHI data.");
          setLoadingIsro(false);
        });
    }
  }, [viewMode, site.id, shapData, loadingShap, isroData, loadingIsro]);

  return (
    <div className="space-y-3">
      {/* View Toggle */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Framework View</span>
        <div className="inline-flex rounded-lg bg-slate-200 dark:bg-slate-800 p-0.5 text-xs font-mono">
          <button
            onClick={() => setViewMode("heuristic")}
            className={`px-2.5 py-0.5 rounded-md transition-all ${
              viewMode === "heuristic" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            MCDA
          </button>
          <button
            onClick={() => setViewMode("shap")}
            className={`px-2.5 py-0.5 rounded-md transition-all ${
              viewMode === "shap" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            SHAP (AI)
          </button>
          <button
            onClick={() => setViewMode("isro")}
            className={`px-2.5 py-0.5 rounded-md transition-all ${
              viewMode === "isro" ? "bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ISRO (LHI)
          </button>
        </div>
      </div>

      {viewMode === "heuristic" && (
        <>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Habitat suitability score</div>
              <div className="font-serif text-4xl font-black leading-none">
                {site.habitatScore.toFixed(0)}
                <span className="text-base font-semibold text-muted-foreground"> / 100</span>
              </div>
            </div>
            <div className="text-right text-[11px] font-mono text-muted-foreground">
              plausible range
              <div className="text-sm font-bold text-foreground">
                {site.scoreLow.toFixed(0)} – {site.scoreHigh.toFixed(0)}
              </div>
            </div>
          </div>

          {/* range bar */}
          <div className="relative h-2.5 rounded-full bg-slate-300/50 dark:bg-slate-800/80" aria-hidden>
            <div className="absolute inset-y-0 rounded-full bg-[#3B82F6]/35" style={{ left: `${site.scoreLow}%`, width: `${site.scoreHigh - site.scoreLow}%` }} />
            <div className="absolute -top-0.5 h-3.5 w-1 rounded bg-[#D4AF37]" style={{ left: `calc(${site.habitatScore}% - 2px)` }} />
          </div>

          <ul className="space-y-2.5 pt-1">
            {site.drivers.map((d) => {
              const max = d.weight * 100;
              return (
                <li key={d.feature} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-semibold">{d.feature}</span>
                    <span className="font-mono text-muted-foreground">
                      +{d.contribution.toFixed(1)} <span className="opacity-60">/ {max.toFixed(0)}</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-300/50 dark:bg-slate-800/80 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#2E4A9E] to-[#A5F3FC]" style={{ width: `${(d.contribution / max) * 100}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{d.description}</p>
                </li>
              );
            })}
          </ul>
          <p className="text-[11px] text-muted-foreground leading-snug border-t border-border pt-2">
            Weights: tube {SCORE_WEIGHTS.tube * 100}%, roof {SCORE_WEIGHTS.roofStability * 100}%, size {SCORE_WEIGHTS.size * 100}%, shielding{" "}
            {SCORE_WEIGHTS.shielding * 100}%, access {SCORE_WEIGHTS.access * 100}%, terrain {SCORE_WEIGHTS.terrain * 100}%. These are ranking heuristics, not engineering standards.
          </p>
        </>
      )}

      {viewMode === "shap" && (
        <div className="space-y-3 pt-1">
          {loadingShap && (
            <div className="py-6 text-center text-xs font-mono text-muted-foreground animate-pulse">
              Computing game-theoretic SHAP tree attribution values...
            </div>
          )}

          {shapError && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300">
              {shapError}
            </div>
          )}

          {shapData && (
            <>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">AI Consensus Prediction</div>
                  <div className="font-serif text-3xl font-black leading-none text-cyan-400">
                    {shapData.suitability_score.toFixed(1)}%
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono text-muted-foreground">
                  Base Expectation E[f(x)]
                  <div className="text-xs font-bold text-foreground">
                    {(shapData.base_value * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400">
                  Favorable Attributions (Positive Drivers)
                </div>
                <ul className="space-y-2">
                  {shapData.positive_drivers.length === 0 ? (
                    <li className="text-xs text-muted-foreground italic">No features exceeded the positive baseline for this site.</li>
                  ) : (
                    shapData.positive_drivers.map((drv) => (
                      <li key={drv.feature} className="space-y-0.5 text-xs">
                        <div className="flex justify-between items-baseline font-mono">
                          <span className="font-medium text-foreground">{drv.feature_label}</span>
                          <span className="text-emerald-400 font-bold">+{drv.shap_attribution.toFixed(3)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-300/40 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.abs(drv.shap_attribution) * 200)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-snug">{drv.description}</p>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="space-y-2 pt-1 border-t border-border">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-rose-400">
                  Risk Factors (Negative Attributions)
                </div>
                <ul className="space-y-2">
                  {shapData.negative_drivers.length === 0 ? (
                    <li className="text-xs text-muted-foreground italic">No negative attribution penalties detected.</li>
                  ) : (
                    shapData.negative_drivers.map((drv) => (
                      <li key={drv.feature} className="space-y-0.5 text-xs">
                        <div className="flex justify-between items-baseline font-mono">
                          <span className="font-medium text-foreground">{drv.feature_label}</span>
                          <span className="text-rose-400 font-bold">{drv.shap_attribution.toFixed(3)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-300/40 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.abs(drv.shap_attribution) * 200)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-snug">{drv.description}</p>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <p className="text-[10px] text-muted-foreground leading-snug border-t border-border pt-2 font-mono">
                Method: {shapData.explanation_method}. Exact Shapley values ensure local accuracy, missingness, and consistency (Lundberg &amp; Lee, NeurIPS 2017).
              </p>
            </>
          )}
        </div>
      )}

      {viewMode === "isro" && (
        <div className="space-y-3 pt-1">
          {loadingIsro && (
            <div className="py-6 text-center text-xs font-mono text-muted-foreground animate-pulse">
              Computing ISRO Chandrayaan Lunar Habitability Index (LHI)...
            </div>
          )}

          {isroError && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300">
              {isroError}
            </div>
          )}

          {isroData && (
            <>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-bold">
                    ISRO Chandrayaan LHI Score
                  </div>
                  <div className="font-serif text-3xl font-black leading-none text-orange-400">
                    {isroData.isro_lhi_score.toFixed(1)}
                    <span className="text-base font-semibold text-muted-foreground"> / 100</span>
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono text-muted-foreground">
                  Exploration Priority
                  <div className="text-xs font-bold text-foreground">
                    {isroData.isro_lhi_score >= 80 ? "Tier 1 Priority" : isroData.isro_lhi_score >= 60 ? "Tier 2 Target" : "Tier 3 Interest"}
                  </div>
                </div>
              </div>

              {/* ISRO Sub-Scores */}
              <ul className="space-y-2 pt-1 text-xs font-mono">
                <li className="space-y-0.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium text-foreground">OHRC 0.25m Shadow Overhang (Sinha 2024)</span>
                    <span className="text-orange-400 font-bold">{isroData.sub_scores.ohrc_overhang_score}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-300/40 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${isroData.sub_scores.ohrc_overhang_score}%` }} />
                  </div>
                </li>
                <li className="space-y-0.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium text-foreground">DFSAR L-band Polarimetry / CPR (Bhardwaj 2021)</span>
                    <span className="text-orange-400 font-bold">{isroData.sub_scores.dfsar_polarimetry_score}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-300/40 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${isroData.sub_scores.dfsar_polarimetry_score}%` }} />
                  </div>
                </li>
                <li className="space-y-0.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium text-foreground">TMC-2 Stereo DTM Rover Slope (Arya 2011)</span>
                    <span className="text-orange-400 font-bold">{isroData.sub_scores.tmc2_slope_access_score}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-300/40 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${isroData.sub_scores.tmc2_slope_access_score}%` }} />
                  </div>
                </li>
                <li className="space-y-0.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium text-foreground">Geomechanical Basalt FoS (Blair 2017)</span>
                    <span className="text-orange-400 font-bold">{isroData.sub_scores.physics_fos_stability_score}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-300/40 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${isroData.sub_scores.physics_fos_stability_score}%` }} />
                  </div>
                </li>
                <li className="space-y-0.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium text-foreground">ChaSTE Subsurface Thermal Shielding (ChaSTE 2023)</span>
                    <span className="text-orange-400 font-bold">{isroData.sub_scores.chaste_thermal_insulation_score}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-300/40 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${isroData.sub_scores.chaste_thermal_insulation_score}%` }} />
                  </div>
                </li>
              </ul>

              <div className="pt-2 border-t border-border text-[10px] text-muted-foreground font-mono leading-tight space-y-1">
                <div className="text-foreground font-bold text-[11px]">Primary ISRO Data Sources:</div>
                <div className="text-orange-300/90">ISRO ISSDC PRADAN: Chandrayaan-2 OHRC (0.25m), TMC-2 DTM (5m), DFSAR (L/S-band), and Chandrayaan-3 ChaSTE.</div>
                <div>Grounded in Arya et al. (2011, Current Science / SAC-ISRO) &amp; Sinha et al. (2024, ISPRS).</div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
