import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, Send, ShieldAlert, CheckCircle2, AlertTriangle, HelpCircle, FileText, Download, Wrench } from "lucide-react";
import { api } from "@/lib/api-client";
import type { RankedSite } from "@/lib/types";

interface TiersData {
  site_id: string;
  site_name: string;
  tiers: {
    observed: {
      tier: string;
      description: string;
      data_sources: string[];
      coordinates: string;
      pit_depth_m: number | string;
      mean_slope_deg: number;
      radar_backscatter_db: number;
      scattering_entropy: number;
    };
    predicted: {
      tier: string;
      description: string;
      model_architecture: string;
      optical_confidence: number;
      ensemble_priority_grade: string;
      validation_protocol: string;
    };
    simulated: {
      tier: string;
      description: string;
      gravity_constant_ms2: number;
      assumed_elastic_modulus_gpa: number;
      assumed_basalt_density_kgm3: number;
      median_factor_of_safety: number;
      max_bending_stress_mpa: number;
      hypothetical_roof_thickness_m: number;
      reference_geomechanics: string;
    };
    unknown: {
      tier: string;
      description: string;
      items: string[];
      recommendation: string;
    };
  };
  literature_grounding: Array<{
    title: string;
    authors: string;
    year: number;
    key_finding: string;
  }>;
  scientific_disclaimer: string;
}

export function ResearchAssistant({ site }: { site: RankedSite }) {
  const [activeTab, setActiveTab] = useState<"tiers" | "query" | "dossier">("tiers");
  const [tiers, setTiers] = useState<TiersData | null>(null);
  const [loadingTiers, setLoadingTiers] = useState<boolean>(false);

  const [query, setQuery] = useState<string>("");
  const [queryAnswer, setQueryAnswer] = useState<string | null>(null);
  const [queryCitations, setQueryCitations] = useState<string[]>([]);
  const [loadingQuery, setLoadingQuery] = useState<boolean>(false);

  const [dossierData, setDossierData] = useState<any | null>(null);
  const [loadingDossier, setLoadingDossier] = useState<boolean>(false);

  const loadTiers = () => {
    if (loadingTiers) return;
    setLoadingTiers(true);
    api
      .slmExplainSite(site.id)
      .then((res) => {
        setTiers(res);
        setLoadingTiers(false);
      })
      .catch(() => {
        setLoadingTiers(false);
      });
  };

  const handleQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loadingQuery) return;
    setLoadingQuery(true);
    api
      .slmQuery(query)
      .then((res) => {
        setQueryAnswer(res.answer);
        setQueryCitations(res.citations || []);
        setLoadingQuery(false);
      })
      .catch(() => {
        setQueryAnswer("Unable to contact literature RAG retriever. Ensure backend is running.");
        setLoadingQuery(false);
      });
  };

  useEffect(() => {
    if (activeTab === "dossier" && !dossierData && !loadingDossier) {
      setLoadingDossier(true);
      api
        .dossier(site.id)
        .then((res) => {
          setDossierData(res);
          setLoadingDossier(false);
        })
        .catch(() => {
          setLoadingDossier(false);
        });
    }
  }, [activeTab, site.id, dossierData, loadingDossier]);

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-cyan-400" />
          <span className="text-xs font-serif font-bold uppercase tracking-wider">
            Planetary Science Research Assistant
          </span>
        </div>
        <div className="inline-flex rounded-lg bg-slate-200 dark:bg-slate-800 p-0.5 text-xs font-mono">
          <button
            onClick={() => setActiveTab("tiers")}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === "tiers" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            4-Tier Evidence
          </button>
          <button
            onClick={() => setActiveTab("query")}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === "query" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Literature RAG
          </button>
          <button
            onClick={() => setActiveTab("dossier")}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === "dossier" ? "bg-orange-500/20 text-orange-400 font-bold shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ISRO Dossier
          </button>
        </div>
      </div>

      {activeTab === "tiers" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Strict separation between orbital measurements, machine learning inferences, physics simulations, and unexplored subsurface unknowns (Blair et al. 2017).
          </p>

          {!tiers && !loadingTiers && (
            <button
              onClick={loadTiers}
              className="w-full py-2.5 px-4 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="size-4" /> Decompose {site.name} into 4 Evidence Tiers
            </button>
          )}

          {loadingTiers && (
            <div className="py-8 text-center text-xs font-mono text-muted-foreground animate-pulse">
              Synthesizing multi-sensor evidence tiers and geomechanical scenarios...
            </div>
          )}

          {tiers && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* TIER 1: OBSERVED */}
              <div className="rounded-2xl p-3.5 border border-blue-500/30 bg-blue-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                    TIER 1: OBSERVED
                  </span>
                  <CheckCircle2 className="size-3.5 text-blue-400" />
                </div>
                <p className="text-[11px] text-muted-foreground">{tiers.tiers.observed.description}</p>
                <div className="text-xs font-mono space-y-1">
                  <div>Coordinates: <span className="text-foreground font-bold">{tiers.tiers.observed.coordinates}</span></div>
                  <div>Mean Rim Slope: <span className="text-foreground font-bold">{tiers.tiers.observed.mean_slope_deg}°</span></div>
                  <div>Radar σ° Mean: <span className="text-foreground font-bold">{tiers.tiers.observed.radar_backscatter_db} dB</span></div>
                  <div>Scattering Entropy: <span className="text-foreground font-bold">{tiers.tiers.observed.scattering_entropy}</span></div>
                </div>
              </div>

              {/* TIER 2: PREDICTED */}
              <div className="rounded-2xl p-3.5 border border-purple-500/30 bg-purple-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                    TIER 2: PREDICTED
                  </span>
                  <Sparkles className="size-3.5 text-purple-400" />
                </div>
                <p className="text-[11px] text-muted-foreground">{tiers.tiers.predicted.description}</p>
                <div className="text-xs font-mono space-y-1">
                  <div>Model: <span className="text-foreground font-bold">Attention U-Net + Stacking Ensemble</span></div>
                  <div>Optical Confidence: <span className="text-foreground font-bold">{(tiers.tiers.predicted.optical_confidence * 100).toFixed(1)}%</span></div>
                  <div>Priority Grade: <span className="text-foreground font-bold">Grade {tiers.tiers.predicted.ensemble_priority_grade}</span></div>
                  <div>Protocol: <span className="text-foreground font-bold">{tiers.tiers.predicted.validation_protocol}</span></div>
                </div>
              </div>

              {/* TIER 3: SIMULATED */}
              <div className="rounded-2xl p-3.5 border border-amber-500/30 bg-amber-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                    TIER 3: SIMULATED
                  </span>
                  <AlertTriangle className="size-3.5 text-amber-400" />
                </div>
                <p className="text-[11px] text-muted-foreground">{tiers.tiers.simulated.description}</p>
                <div className="text-xs font-mono space-y-1">
                  <div>Factor of Safety (FoS): <span className="text-foreground font-bold">{tiers.tiers.simulated.median_factor_of_safety}</span></div>
                  <div>Max Bending Stress: <span className="text-foreground font-bold">{tiers.tiers.simulated.max_bending_stress_mpa} MPa</span></div>
                  <div>Assumed Density ρ: <span className="text-foreground font-bold">{tiers.tiers.simulated.assumed_basalt_density_kgm3} kg/m³</span></div>
                  <div>Lunar Gravity g: <span className="text-foreground font-bold">{tiers.tiers.simulated.gravity_constant_ms2} m/s²</span></div>
                </div>
              </div>

              {/* TIER 4: UNKNOWN */}
              <div className="rounded-2xl p-3.5 border border-rose-500/30 bg-rose-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
                    TIER 4: UNKNOWN
                  </span>
                  <HelpCircle className="size-3.5 text-rose-400" />
                </div>
                <p className="text-[11px] text-muted-foreground">{tiers.tiers.unknown.description}</p>
                <ul className="text-[11px] text-muted-foreground list-disc pl-4 space-y-0.5">
                  {tiers.tiers.unknown.items.slice(0, 3).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "query" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Query the planetary science knowledge base. Grounded in Chandrayaan-1/2/3 and peer-reviewed lunar papers.
          </p>

          <form onSubmit={handleQuery} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. How does Chandrayaan-2 DFSAR detect subsurface cavities?"
              className="flex-1 bg-slate-900/60 border border-border rounded-xl px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <button
              type="submit"
              disabled={loadingQuery || !query.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Send className="size-3.5" /> Ask
            </button>
          </form>

          {loadingQuery && (
            <div className="py-6 text-center text-xs font-mono text-muted-foreground animate-pulse">
              Retrieving peer-reviewed citations via TF-IDF vector similarity...
            </div>
          )}

          {queryAnswer && (
            <div className="rounded-2xl p-4 border border-cyan-500/30 bg-cyan-500/5 space-y-2 text-xs">
              <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> Grounded Synthesis
              </div>
              <p className="text-foreground leading-relaxed font-sans">{queryAnswer}</p>
              {queryCitations.length > 0 && (
                <div className="pt-2 border-t border-border/50 text-[10px] font-mono text-muted-foreground">
                  <div className="font-semibold text-foreground/80 mb-1">Literature Citations:</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {queryCitations.map((cit, idx) => (
                      <li key={idx}>{cit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "dossier" && (
        <div className="space-y-3">
          {loadingDossier && (
            <div className="py-6 text-center text-xs font-mono text-muted-foreground animate-pulse">
              Loading verified scientific dossier from outputs/candidates...
            </div>
          )}

          {dossierData && (
            <div className="rounded-2xl p-4 border border-orange-500/30 bg-orange-500/5 space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-orange-400" />
                  <span className="font-bold text-foreground text-sm">{dossierData.metadata.dossier_id}</span>
                </div>
                <span className="text-[10px] text-orange-400 font-bold px-2 py-0.5 rounded bg-orange-500/20">
                  {dossierData.scoring_evaluation.tier_label.split(":")[0]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Target: <span className="font-bold text-foreground">{dossierData.candidate_profile.name}</span></div>
                <div>Region: <span className="font-bold text-foreground">{dossierData.candidate_profile.region}</span></div>
                <div>Coordinates: <span className="font-bold text-foreground">{dossierData.candidate_profile.coordinates.lat}°N, {dossierData.candidate_profile.coordinates.lon}°W</span></div>
                <div>ISRO LHI Score: <span className="font-bold text-orange-400 text-xs">{dossierData.scoring_evaluation.isro_lhi_score}%</span></div>
              </div>

              <div className="pt-1">
                <div className="font-bold text-foreground text-[11px] mb-1">Primary Co-registered ISRO Instruments:</div>
                <ul className="space-y-1 text-[10px] text-muted-foreground">
                  {dossierData.primary_isro_chandrayaan_data_sources.map((src: any, idx: number) => (
                    <li key={idx} className="border-l-2 border-orange-500/50 pl-2">
                      <span className="text-foreground font-semibold">{src.instrument}:</span> {src.measurement}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                <div className="font-semibold text-foreground mb-0.5">Geomechanical Baseline:</div>
                <div>Lunar gravity g = 1.62 m/s² · Basalt density ρ = 2800-3200 kg/m³ · Median FoS = {dossierData.geomechanical_scenarios.median_factor_of_safety}</div>
              </div>

              {dossierData.track1_inversion_assessment && (
                <div className="mt-3 pt-3 border-t border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400 text-[11px] flex items-center gap-1.5">
                      <Sparkles className="size-3.5" /> Track 1: Radar & Photoclinometric Inversion
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      dossierData.track1_inversion_assessment.track1_status === "CONDUIT_VERIFIED"
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {dossierData.track1_inversion_assessment.track1_status === "CONDUIT_VERIFIED" ? "Conduit Verified" : "Open Formation (Track 2 Required)"} ({dossierData.track1_inversion_assessment.track1_inversion_score}%)
                    </span>
                  </div>

                  <div className="bg-slate-950/60 rounded-xl p-2.5 border border-cyan-500/20 space-y-1.5 text-[10px]">
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        <span className="text-muted-foreground">Lommel-Seeliger Undercut: </span>
                        <span className="font-semibold text-foreground">{dossierData.track1_inversion_assessment.photoclinometric_sfs.undercut_distance_m} m</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Inverted Micro-Slope: </span>
                        <span className="font-semibold text-emerald-400">{dossierData.track1_inversion_assessment.photoclinometric_sfs.micro_slope_inverted_deg}°</span> (LOLA: {dossierData.track1_inversion_assessment.photoclinometric_sfs.macro_slope_lola_deg}°)
                      </div>
                      <div>
                        <span className="text-muted-foreground">DFSAR L-S Δσ°: </span>
                        <span className="font-semibold text-foreground">+{dossierData.track1_inversion_assessment.dfsar_radar_sounding.differential_l_s_sigma0_db} dB</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Double-Bounce (m-χ): </span>
                        <span className="font-semibold text-cyan-300">{dossierData.track1_inversion_assessment.dfsar_radar_sounding.double_bounce_scattering_power_m_chi}</span>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-border/40">
                      <span className="text-cyan-300 font-semibold">Subsurface Radar Tomography (Carrer et al. 2024): </span>
                      <span className="text-slate-300">
                        {dossierData.track1_inversion_assessment.radar_tomography_carrer_model.scientific_assessment_summary}
                      </span>
                    </div>

                    {dossierData.track1_inversion_assessment.radar_tomography_carrer_model.subsurface_conduit_confirmed && (
                      <div className="text-emerald-400 font-mono text-[9.5px]">
                        Conduit Length: {dossierData.track1_inversion_assessment.radar_tomography_carrer_model.conduit_length_m} m · Span: {dossierData.track1_inversion_assessment.radar_tomography_carrer_model.conduit_width_m} m · Basalt Roof: {dossierData.track1_inversion_assessment.radar_tomography_carrer_model.estimated_roof_thickness_m} m (Tomographic Confidence: {dossierData.track1_inversion_assessment.radar_tomography_carrer_model.tomographic_confidence_pct}%)
                      </div>
                    )}
                  </div>
                </div>
              )}

              {dossierData.engineering_remediation_roadmap && (
                <div className="mt-3 pt-3 border-t border-orange-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 text-[11px] flex items-center gap-1.5">
                      <Wrench className="size-3.5" /> Planetary Engineering Remediation
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Remediated LHI: {dossierData.engineering_remediation_roadmap.remediated_lhi_score}% (+{dossierData.engineering_remediation_roadmap.score_delta})
                    </span>
                  </div>

                  <div className="bg-slate-950/40 rounded-xl p-2.5 border border-emerald-500/20 space-y-1.5 text-[10px]">
                    <div>
                      <span className="text-foreground font-semibold">Bottleneck: </span>
                      <span className="text-muted-foreground">{dossierData.engineering_remediation_roadmap.bottleneck_resolved}</span>
                    </div>
                    <div>
                      <span className="text-emerald-300 font-semibold">Sensing Upgrade: </span>
                      <span className="text-slate-300">{dossierData.engineering_remediation_roadmap.sensing_upgrade}</span>
                    </div>
                    <div>
                      <span className="text-cyan-300 font-semibold">Engineering Architecture: </span>
                      <span className="text-slate-300">{dossierData.engineering_remediation_roadmap.engineering_architecture}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-border text-[10px] font-mono text-amber-500/80">
        <ShieldAlert className="size-3.5 shrink-0" />
        <span>Research prototype: Never make certified habitat safety claims without ground truth in-situ exploration.</span>
      </div>
    </div>
  );
}
