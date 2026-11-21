"use client";

import React, { useMemo, useState } from "react";
import { ArrowUpDown, Database, Rocket, ShieldCheck, AlertTriangle } from "lucide-react";
import { useSites } from "@/lib/hooks";
import { formatLatLon } from "@/lib/utils";
import { sfx } from "@/lib/audio-sfx";
import { ScoreBreakdown } from "@/components/lunar/ScoreBreakdown";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { AUTHORITATIVE_ML_SITES } from "@/lib/lunar-craters-data";
import type { RankedSite, SiteStatus } from "@/lib/types";

type SortKey = "rank" | "habitatScore" | "tube" | "roof" | "uncertainty";
const FILTERS: Array<{ id: "ALL" | SiteStatus; label: string }> = [
  { id: "ALL", label: "All" },
  { id: "PRIORITY_CANDIDATE", label: "Priority" },
  { id: "CANDIDATE", label: "Candidate" },
  { id: "NEEDS_DATA", label: "Needs data" },
  { id: "UNSTABLE", label: "Roof risk" },
  { id: "UNLIKELY", label: "Unlikely" },
];

export default function RankingPage() {
  const { ranked, source } = useSites(120);
  const [filter, setFilter] = useState<"ALL" | SiteStatus>("ALL");
  const [mode, setMode] = useState<"natural" | "remediated">("natural");
  const [sort, setSort] = useState<SortKey>("rank");
  const [asc, setAsc] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");

  const rows = useMemo(() => {
    const getScore = (s: RankedSite) => {
      if (mode === "remediated") {
        return AUTHORITATIVE_ML_SITES[s.id]?.remediatedScore ?? s.habitatScore;
      }
      return s.habitatScore;
    };

    const val = (s: RankedSite) =>
      sort === "rank" ? s.rank
      : sort === "habitatScore" ? getScore(s)
      : sort === "tube" ? s.detection.probability
      : sort === "roof" ? s.roof.stability
      : s.uncertainty;
    const f = ranked.filter((s) => filter === "ALL" || s.status === filter);
    return [...f].sort((a, b) => (asc ? val(a) - val(b) : val(b) - val(a)));
  }, [ranked, filter, sort, asc, mode]);

  const selected = ranked.find((s) => s.id === selectedId) ?? rows[0] ?? ranked[0];
  const selectedAuth = selected ? AUTHORITATIVE_ML_SITES[selected.id] : null;

  const th = (key: SortKey, label: string, align = "text-right") => (
    <th scope="col" className={`px-3 py-2 ${align} font-mono text-[10px] uppercase tracking-wider text-muted-foreground`}>
      <button
        onClick={() => {
          sfx.playClick(900);
          if (sort === key) setAsc(!asc);
          else { setSort(key); setAsc(key === "rank" || key === "uncertainty"); }
        }}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {label} <ArrowUpDown className="size-3 opacity-60" />
      </button>
    </th>
  );

  return (
    <div className="cosmic-void-canvas min-h-screen text-foreground flex flex-col font-sans relative">
      <section className="pt-8 pb-4 px-4 md:px-8 max-w-[1780px] mx-auto w-full space-y-5">
        <div className="pb-4 border-b border-slate-800 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-300">
              TASK 3 · SITE RANKING & HABITABILITY
            </span>
            {source !== "api" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-slate-700 text-muted-foreground">
                <Database className="size-3" /> {source === "loading" ? "CONNECTING…" : "FALLBACK CACHE"}
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-slate-100">Habitat Site Ranking</h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-4xl">
            Sites are evaluated under two complementary frameworks: <strong>Natural Remote-Sensing</strong> (penalizes physical defects like steep scarp slopes or boulder-filled floors to prevent unsafe missions) and <strong>Remediated Planetary Architecture</strong> (shows how autonomous civil engineering like robotic bulldozers and rappelling ramps elevate viable sites to 89–94/100).
          </p>
        </div>

        {/* Framework Mode Selector & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl">
            <button
              onClick={() => { sfx.playClick(900); setMode("natural"); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                mode === "natural"
                  ? "bg-slate-800 text-slate-100 shadow border border-slate-700"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Natural Remote-Sensing (Pristine)
            </button>
            <button
              onClick={() => { sfx.playClick(900); setMode("remediated"); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                mode === "remediated"
                  ? "bg-cyan-500/20 text-cyan-200 shadow border border-cyan-500/40"
                  : "text-muted-foreground hover:text-cyan-300"
              }`}
            >
              <Rocket className="size-3.5 text-cyan-400" />
              Remediated Planetary Architecture
            </button>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => { sfx.playClick(900); setFilter(f.id); }}
                aria-pressed={filter === f.id}
                className={`interactive-press rounded-full border px-3 py-1 text-xs font-mono ${
                  filter === f.id
                    ? "border-cyan-500/70 bg-cyan-950/40 text-cyan-200 font-bold"
                    : "border-slate-800 text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          <div className="xl:col-span-3 glass-royal-deck rounded-3xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-800 bg-slate-950/40">
                  <tr>
                    {th("rank", "#", "text-left")}
                    <th scope="col" className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Site</th>
                    {th("habitatScore", mode === "remediated" ? "Remediated Score" : "Natural Score")}
                    {mode === "remediated" && (
                      <th scope="col" className="px-3 py-2 text-right font-mono text-[10px] uppercase tracking-wider text-cyan-400">Lift</th>
                    )}
                    {th("tube", "Tube")}
                    {th("roof", "Roof")}
                    {th("uncertainty", "Uncert.")}
                    <th scope="col" className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => {
                    const auth = AUTHORITATIVE_ML_SITES[s.id];
                    const displayScore = mode === "remediated" && auth?.remediatedScore !== undefined
                      ? auth.remediatedScore
                      : s.habitatScore;
                    const lift = auth?.remediationLift ?? 0.0;

                    return (
                      <tr
                        key={s.id}
                        onClick={() => { sfx.playSelect(); setSelectedId(s.id); }}
                        className={`cursor-pointer border-b border-slate-800/60 transition-colors ${
                          selected?.id === s.id ? "bg-cyan-950/30 border-l-2 border-l-cyan-400" : "hover:bg-slate-900/40"
                        }`}
                      >
                        <td className="px-3 py-2.5 font-serif font-black">{s.rank}</td>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold leading-tight text-slate-100">{s.name}</div>
                          <div className="font-mono text-[11px] text-muted-foreground">{formatLatLon(s.lat, s.lon)}</div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold">
                          <span className={mode === "remediated" && lift > 0 ? "text-cyan-400" : "text-slate-100"}>
                            {displayScore.toFixed(1)}
                          </span>
                        </td>
                        {mode === "remediated" && (
                          <td className="px-3 py-2.5 text-right font-mono text-xs">
                            {lift > 0 ? (
                              <span className="font-bold text-emerald-400">+{lift.toFixed(1)}</span>
                            ) : (
                              <span className="text-slate-500">Pristine</span>
                            )}
                          </td>
                        )}
                        <td className="px-3 py-2.5 text-right font-mono">{Math.round(s.detection.probability * 100)}%</td>
                        <td className="px-3 py-2.5 text-right font-mono">{s.roof.stability.toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-right font-mono">{Math.round(s.uncertainty * 100)}%</td>
                        <td className="px-3 py-2.5">
                          <StatusBadge status={mode === "remediated" && lift > 0 ? "PRIORITY_CANDIDATE" : s.status} />
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr><td colSpan={8} className="px-3 py-8 text-center text-xs text-muted-foreground">No sites match this filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="xl:col-span-2 glass-royal-deck rounded-3xl p-5 sm:p-6 border border-slate-800 h-fit xl:sticky xl:top-24 space-y-4">
            {selected ? (
              <>
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="font-serif text-xl font-black text-slate-100">{selected.name}</h2>
                  <p className="text-xs font-mono text-muted-foreground">{selected.region}</p>
                </div>

                {/* Remediation & Bottleneck Insight */}
                {selectedAuth?.bottleneck && (
                  <div className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                    mode === "remediated"
                      ? "border-cyan-500/40 bg-cyan-950/30 text-cyan-100"
                      : "border-slate-800 bg-slate-900/60 text-slate-200"
                  }`}>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-cyan-300">
                      <Rocket className="size-3.5 text-cyan-400" />
                      {mode === "remediated" ? "Planetary Engineering Remediation" : "Natural Defect Analysis"}
                    </div>
                    <div>
                      <strong className="text-slate-400 block mb-0.5">Identified Natural Bottleneck:</strong>
                      <span className="text-slate-300">{selectedAuth.bottleneck}</span>
                    </div>
                    {mode === "remediated" && selectedAuth.engineeringArchitecture && (
                      <div className="pt-1.5 border-t border-cyan-500/20">
                        <strong className="text-cyan-400 block mb-0.5">Engineered Architecture:</strong>
                        <span className="text-cyan-200/90 leading-relaxed">{selectedAuth.engineeringArchitecture}</span>
                      </div>
                    )}
                  </div>
                )}

                <ScoreBreakdown site={selected} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Select a site to see its breakdown.</p>
            )}
          </div>
        </div>

        <Disclaimer />
      </section>
    </div>
  );
}
