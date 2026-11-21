"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Globe,
  Map,
  Search,
  Filter,
  Layers,
  Sparkles,
  Compass,
  ArrowRight,
  Database,
  ExternalLink,
  ChevronRight,
  List,
} from "lucide-react";
import {
  LUNAR_CRATERS,
  LunarFeature,
  FeatureType,
  LunarHemisphere,
  FEATURE_TYPE_LABELS,
  FEATURE_TYPE_COLORS,
} from "@/lib/lunar-craters-data";
import { LunarGlobe3D, TextureOption } from "@/components/lunar/LunarGlobe3D";
import { LunarMap2D, TextureLayer } from "@/components/lunar/LunarMap2D";
import { CraterDetailCard } from "@/components/lunar/CraterDetailCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { sfx } from "@/lib/audio-sfx";
import { useSites } from "@/lib/hooks";

type ViewMode = "3D_GLOBE" | "2D_MAP";

export default function LunarCraterAtlasPage() {
  const { sites: liveSites } = useSites();
  const [viewMode, setViewMode] = useState<ViewMode>("3D_GLOBE");
  const [selectedFeature, setSelectedFeature] = useState<LunarFeature | null>(
    LUNAR_CRATERS[1] || LUNAR_CRATERS[0] // Mare Tranquillitatis Pit (Rank #1) by default
  );
  const [textureType, setTextureType] = useState<TextureOption>("albedo");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | FeatureType>("ALL");
  const [hemisphereFilter, setHemisphereFilter] = useState<"ALL" | LunarHemisphere>("ALL");
  const [showTable, setShowTable] = useState(false);
  const [showLabels, setShowLabels] = useState(true);

  // Filtered Craters List
  const filteredCraters = useMemo(() => {
    return LUNAR_CRATERS.filter((f) => {
      if (typeFilter !== "ALL" && f.type !== typeFilter) return false;
      if (hemisphereFilter !== "ALL" && f.hemisphere !== hemisphereFilter) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesDesc = f.description.toLowerCase().includes(q);
        const matchesMission = f.associatedMission?.toLowerCase().includes(q) ?? false;
        const matchesHighlights = f.highlights.some((h) => h.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesMission && !matchesHighlights) return false;
      }
      return true;
    });
  }, [typeFilter, hemisphereFilter, searchQuery]);

  const selectFeatureWithSound = (f: LunarFeature) => {
    sfx.playSelect();
    setSelectedFeature(f);
  };

  return (
    <div className="cosmic-void-canvas min-h-screen text-foreground flex flex-col font-sans relative">
      {/* Header Banner */}
      <section className="pt-8 pb-4 px-4 md:px-8 max-w-[1780px] mx-auto w-full space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="size-3 text-cyan-400" /> MULTI-SENSOR LUNAR & MOSDAC TEXTURES
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-slate-800 text-muted-foreground flex items-center gap-1">
                <Database className="size-3 text-cyan-400" /> {LUNAR_CRATERS.length} CATALOGUED FORMATIONS
              </span>
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-slate-100">
              Lunar Crater Atlas & 3D Explorer
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
              Explore the lunar surface powered by authentic NASA LROC/LOLA and ISRO MOSDAC Earth Analog Twin textures. Inspect major impact craters, volcanic maria, Apollo/Artemis exploration targets, and candidate lava tube skylights.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md">
            <button
              onClick={() => {
                sfx.playSelect();
                setViewMode("3D_GLOBE");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                viewMode === "3D_GLOBE"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20 scale-105"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Globe className="size-4" /> 3D Globe
            </button>
            <button
              onClick={() => {
                sfx.playSelect();
                setViewMode("2D_MAP");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                viewMode === "2D_MAP"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20 scale-105"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Map className="size-4" /> 2D Map (Flat)
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search craters, maria, Apollo, Artemis, ice, lava tubes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-border bg-slate-900/40 dark:bg-slate-950/60 pl-10 pr-4 py-2 text-xs font-mono placeholder:text-muted-foreground focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
            <button
              onClick={() => {
                sfx.playClick(900);
                setTypeFilter("ALL");
              }}
              className={`px-3 py-1 rounded-full border transition-all ${
                typeFilter === "ALL"
                  ? "border-cyan-500/70 bg-cyan-500/15 text-cyan-200 font-bold shadow-sm"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({LUNAR_CRATERS.length})
            </button>
            <button
              onClick={() => {
                sfx.playClick(900);
                setTypeFilter("LAVA_TUBE_PIT");
              }}
              className={`px-3 py-1 rounded-full border transition-all ${
                typeFilter === "LAVA_TUBE_PIT"
                  ? "border-emerald-500/70 bg-emerald-500/20 text-emerald-300 font-bold shadow-sm"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Lava Tube Skylights (5)
            </button>
            <button
              onClick={() => {
                sfx.playClick(900);
                setTypeFilter("LANDING_SITE");
              }}
              className={`px-3 py-1 rounded-full border transition-all ${
                typeFilter === "LANDING_SITE"
                  ? "border-sky-500/70 bg-sky-500/20 text-sky-300 font-bold shadow-sm"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Landing Sites (7)
            </button>
            <button
              onClick={() => {
                sfx.playClick(900);
                setTypeFilter("RAY_CRATER");
              }}
              className={`px-3 py-1 rounded-full border transition-all ${
                typeFilter === "RAY_CRATER"
                  ? "border-blue-400/70 bg-blue-500/20 text-blue-200 font-bold shadow-sm"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Ray Craters
            </button>
            <button
              onClick={() => {
                sfx.playClick(900);
                setTypeFilter("MARE");
              }}
              className={`px-3 py-1 rounded-full border transition-all ${
                typeFilter === "MARE"
                  ? "border-purple-500/70 bg-purple-500/20 text-purple-200 font-bold shadow-sm"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Maria (Seas)
            </button>

            {/* Table view toggle */}
            <button
              onClick={() => {
                sfx.playClick(1000);
                setShowTable(!showTable);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
                showTable
                  ? "border-purple-500 bg-purple-500/20 text-purple-300 font-bold"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-3.5" />
              <span>{showTable ? "Hide Table" : "Crater Roster"}</span>
            </button>
          </div>
        </div>

        {/* Quick Jump Hotlinks */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-muted-foreground">
          <span className="text-cyan-400 font-bold flex items-center gap-1">
            <Compass className="size-3 text-cyan-400" /> Quick Jump:
          </span>
          {[
            { id: "mare-tranquillitatis-pit", label: "Tranquillitatis Pit (Rank #1: 82.3)" },
            { id: "marius-hills-pit", label: "Marius Hills (Rank #2: 73.7)" },
            { id: "serenitatis-collapse-chain", label: "Serenitatis Chain (Rank #3: 55.5)" },
            { id: "shackleton", label: "Shackleton (Artemis Base)" },
            { id: "apollo-11", label: "Apollo 11 Landing" },
            { id: "tycho", label: "Tycho Ray System" },
            { id: "copernicus", label: "Copernicus Terraces" },
            { id: "tsiolkovskiy", label: "Tsiolkovskiy (Far Side)" },
            { id: "von-karman", label: "Chang'e 4 Landing" },
          ].map((item) => {
            const feat = LUNAR_CRATERS.find((c) => c.id === item.id);
            if (!feat) return null;
            const isSelected = selectedFeature?.id === feat.id;
            return (
              <button
                key={item.id}
                onClick={() => selectFeatureWithSound(feat)}
                className={`interactive-press px-2.5 py-0.5 rounded-lg border transition-all ${
                  isSelected
                    ? "border-cyan-400/80 bg-cyan-950/40 text-cyan-200 font-bold shadow-sm"
                    : "border-slate-800 hover:border-slate-700 hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Interactive Stage */}
      <section className="px-4 md:px-8 max-w-[1780px] mx-auto w-full pb-10 flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[640px]">
          {/* Main Visualizer (Globe 3D or 2D Map) */}
          <div className="lg:col-span-8 flex flex-col min-h-[500px] lg:min-h-[640px]">
            {viewMode === "3D_GLOBE" ? (
              <LunarGlobe3D
                selectedFeature={selectedFeature}
                onSelectFeature={selectFeatureWithSound}
                textureType={textureType}
                showLabels={showLabels}
                filterType={typeFilter}
                liveSites={liveSites}
                className="w-full h-full flex-1 min-h-[500px]"
              />
            ) : (
              <LunarMap2D
                selectedFeature={selectedFeature}
                onSelectFeature={selectFeatureWithSound}
                textureType={textureType as TextureLayer}
                showLabels={showLabels}
                filterType={typeFilter}
                className="w-full h-full flex-1 min-h-[500px]"
              />
            )}
          </div>

          {/* Right Column: Dossier Card & Filtered Landmarks List */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Crater Dossier Card */}
            {selectedFeature && (
              <CraterDetailCard
                feature={selectedFeature}
                liveSites={liveSites}
                onFlyTo={() => selectFeatureWithSound(selectedFeature)}
              />
            )}

            {/* Quick List of Craters Matching Filter */}
            <div className="glass-royal-deck rounded-3xl border border-slate-800/80 p-4 flex-1 flex flex-col max-h-[320px] overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2">
                <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  Visible Formations ({filteredCraters.length})
                </span>
                <span className="text-[10px] font-mono text-cyan-400">Click to locate</span>
              </div>
              <div className="overflow-y-auto space-y-1 pr-1 flex-1">
                {filteredCraters.map((c) => {
                  const isSel = selectedFeature?.id === c.id;
                  const col = FEATURE_TYPE_COLORS[c.type];
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectFeatureWithSound(c)}
                      className={`w-full text-left px-3 py-2 rounded-2xl flex items-center justify-between text-xs font-mono transition-all border ${
                        isSel
                          ? "border-cyan-500/60 bg-cyan-950/40 text-cyan-100 font-semibold shadow-sm"
                          : "border-transparent hover:border-slate-800 hover:bg-slate-900/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: col }} />
                        <span className="truncate">{c.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 pl-2">
                        {c.diameterKm < 1 ? `${Math.round(c.diameterKm * 1000)}m` : `${c.diameterKm}km`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Comprehensive Roster Table */}
        {showTable && (
          <div className="mt-8 glass-royal-deck rounded-3xl border border-slate-800/80 overflow-hidden p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="font-sans text-xl font-bold tracking-tight text-slate-100">Comprehensive Lunar Crater Catalog</h3>
                <p className="text-xs text-muted-foreground font-mono">
                  All 40+ catalogued landmarks with exact coordinates, diameter, era, and exploration status
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {filteredCraters.length} / {LUNAR_CRATERS.length} records shown
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead className="border-b border-border text-muted-foreground uppercase text-[10px]">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left">Feature Name</th>
                    <th scope="col" className="px-3 py-2 text-left">Classification</th>
                    <th scope="col" className="px-3 py-2 text-right">Latitude</th>
                    <th scope="col" className="px-3 py-2 text-right">Longitude</th>
                    <th scope="col" className="px-3 py-2 text-right">Diameter</th>
                    <th scope="col" className="px-3 py-2 text-right">Depth</th>
                    <th scope="col" className="px-3 py-2 text-left">Hemisphere</th>
                    <th scope="col" className="px-3 py-2 text-left">Lava Tube Potential</th>
                    <th scope="col" className="px-3 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredCraters.map((c) => {
                    const col = FEATURE_TYPE_COLORS[c.type];
                    const isSel = selectedFeature?.id === c.id;
                    return (
                      <tr
                        key={c.id}
                        className={`hover:bg-slate-900/40 transition-colors ${
                          isSel ? "bg-amber-500/10" : ""
                        }`}
                      >
                        <td className="px-3 py-2.5 font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: col }} />
                            <span>{c.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {FEATURE_TYPE_LABELS[c.type]}
                        </td>
                        <td className="px-3 py-2.5 text-right text-foreground">
                          {Math.abs(c.lat).toFixed(2)}° {c.lat >= 0 ? "N" : "S"}
                        </td>
                        <td className="px-3 py-2.5 text-right text-foreground">
                          {Math.abs(c.lon).toFixed(2)}° {c.lon >= 0 ? "E" : "W"}
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-foreground">
                          {c.diameterKm < 1 ? `${Math.round(c.diameterKm * 1000)} m` : `${c.diameterKm.toLocaleString()} km`}
                        </td>
                        <td className="px-3 py-2.5 text-right text-muted-foreground">
                          {c.depthKm ? `${c.depthKm} km` : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {c.hemisphere.replace("_", " ")}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.lavaTubePotential === "CONFIRMED_PIT"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : c.lavaTubePotential === "HIGH"
                                ? "bg-cyan-500/20 text-cyan-400"
                                : c.lavaTubePotential === "MEDIUM"
                                ? "bg-amber-500/20 text-amber-400"
                                : "text-muted-foreground"
                            }`}
                          >
                            {c.lavaTubePotential.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <button
                            onClick={() => {
                              selectFeatureWithSound(c);
                              window.scrollTo({ top: 120, behavior: "smooth" });
                            }}
                            className="px-2.5 py-1 rounded-xl border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-[10px] font-bold"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
