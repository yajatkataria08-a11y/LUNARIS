"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Globe, Layers, Sparkles, ExternalLink, Eye } from "lucide-react";
import type { RankedSite, SiteStatus } from "@/lib/types";
import { LUNAR_CRATERS, FEATURE_TYPE_COLORS } from "@/lib/lunar-craters-data";
import { sfx } from "@/lib/audio-sfx";

/**
 * Authentic NASA Cartographic Map of the Moon (equirectangular lon −180…180, lat −90…90)
 * Uses NASA Lunar Reconnaissance Orbiter (LROC) and LOLA laser topography datasets.
 */
const W = 720;
const H = 360;
const x = (lon: number) => ((lon + 180) / 360) * W;
const y = (lat: number) => ((90 - lat) / 180) * H;

const MARIA: Array<{ name: string; lat: number; lon: number; rx: number; ry: number }> = [
  { name: "Imbrium", lat: 33, lon: -16, rx: 22, ry: 13 },
  { name: "Serenitatis", lat: 28, lon: 18, rx: 12, ry: 10 },
  { name: "Tranquillitatis", lat: 8.5, lon: 31, rx: 17, ry: 11 },
  { name: "Fecunditatis", lat: -8, lon: 51, rx: 10, ry: 12 },
  { name: "Crisium", lat: 17, lon: 59, rx: 9, ry: 8 },
  { name: "Nectaris", lat: -15, lon: 35, rx: 7, ry: 7 },
  { name: "Nubium", lat: -21, lon: -16, rx: 13, ry: 9 },
  { name: "Humorum", lat: -24, lon: -39, rx: 8, ry: 8 },
  { name: "Procellarum", lat: 18, lon: -57, rx: 24, ry: 24 },
  { name: "Frigoris", lat: 56, lon: 1, rx: 40, ry: 5 },
];

// Highlighted prominent craters to display on map preview
const PROMINENT_CRATERS = LUNAR_CRATERS.filter(
  (c) =>
    c.type === "RAY_CRATER" ||
    c.type === "COMPLEX_CRATER" ||
    c.id === "shackleton" ||
    c.id === "clavius" ||
    c.id === "tsiolkovskiy" ||
    c.id === "apollo-11"
);

const COLOR: Record<SiteStatus, string> = {
  PRIORITY_CANDIDATE: "#10B981",
  CANDIDATE: "#3B82F6",
  NEEDS_DATA: "#F59E0B",
  UNSTABLE: "#F43F5E",
  UNLIKELY: "#94A3B8",
};

export type MapTextureMode = "nasa_albedo" | "nasa_topo" | "schematic";

export function LunarMap({
  sites,
  selectedId,
  onSelect,
  className = "",
}: {
  sites: RankedSite[];
  selectedId?: string;
  onSelect?: (s: RankedSite) => void;
  className?: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const [textureMode, setTextureMode] = useState<MapTextureMode>("nasa_albedo");
  const [showCraters, setShowCraters] = useState(true);
  const [hoveredCrater, setHoveredCrater] = useState<string | null>(null);

  const hovered = sites.find((s) => s.id === hover);
  const activeCrater = LUNAR_CRATERS.find((c) => c.name === hoveredCrater);

  return (
    <div className={`relative ${className}`}>
      {/* Top Map Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 bg-card/85 p-1 rounded-2xl border border-border text-xs font-mono backdrop-blur-md">
          <span className="text-[10px] text-amber-500 dark:text-amber-400 font-bold px-2 flex items-center gap-1">
            <Layers className="size-3" /> TEXTURE:
          </span>
          <button
            onClick={() => {
              sfx.playClick(900);
              setTextureMode("nasa_albedo");
            }}
            className={`px-2 py-0.5 rounded-xl text-[10px] transition-all ${
              textureMode === "nasa_albedo"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            NASA Visible (LROC)
          </button>
          <button
            onClick={() => {
              sfx.playClick(900);
              setTextureMode("nasa_topo");
            }}
            className={`px-2 py-0.5 rounded-xl text-[10px] transition-all ${
              textureMode === "nasa_topo"
                ? "bg-blue-500 text-white font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            LOLA Topo
          </button>
          <button
            onClick={() => {
              sfx.playClick(900);
              setTextureMode("schematic");
            }}
            className={`px-2 py-0.5 rounded-xl text-[10px] transition-all ${
              textureMode === "schematic"
                ? "bg-slate-700 text-white font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Schematic
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Crater Labels */}
          <button
            onClick={() => {
              sfx.playClick(900);
              setShowCraters(!showCraters);
            }}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all ${
              showCraters
                ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/50 font-semibold shadow-sm"
                : "bg-slate-900/50 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            {showCraters ? "Crater Labels: ON" : "Crater Labels: OFF"}
          </button>

          {/* Launch Full 3D Atlas */}
          <Link
            href="/craters"
            onClick={() => sfx.playSelect()}
            className="sheen-sweep interactive-press inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-cyan-500/50 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-[11px] font-mono font-bold shadow-md shadow-cyan-500/20"
          >
            <Globe className="size-3.5" />
            <span>OPEN 3D ATLAS APP</span>
          </Link>
        </div>
      </div>

      {/* SVG Map Container */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 shadow-xl bg-slate-950">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto rounded-2xl block"
          role="img"
          aria-label="NASA Texture Map of candidate lava-tube sites and lunar craters"
        >
          <defs>
            <linearGradient id="moonbg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e2330" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0f131f" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Background Layer: Real NASA Texture or Vector Gradient */}
          {textureMode === "nasa_albedo" ? (
            <image
              href="/textures/moon/nasa_moon_albedo_2k.jpg"
              x="0"
              y="0"
              width={W}
              height={H}
              preserveAspectRatio="none"
            />
          ) : textureMode === "nasa_topo" ? (
            <image
              href="/textures/moon/nasa_moon_topo_color.jpg"
              x="0"
              y="0"
              width={W}
              height={H}
              preserveAspectRatio="none"
            />
          ) : (
            <rect width={W} height={H} fill="url(#moonbg)" rx="12" />
          )}

          {/* Coordinate Graticule Grid */}
          {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lon) => (
            <line
              key={lon}
              x1={x(lon)}
              x2={x(lon)}
              y1={0}
              y2={H}
              stroke="#F8FAFC"
              strokeOpacity={lon === 0 ? 0.45 : 0.12}
              strokeWidth={lon === 0 ? 1.2 : 0.5}
            />
          ))}
          {[-60, -30, 0, 30, 60].map((lat) => (
            <line
              key={lat}
              x1={0}
              x2={W}
              y1={y(lat)}
              y2={y(lat)}
              stroke="#F8FAFC"
              strokeOpacity={lat === 0 ? 0.45 : 0.12}
              strokeWidth={lat === 0 ? 1.2 : 0.5}
            />
          ))}

          {/* Maria Labels and Boundaries */}
          {MARIA.map((m) => (
            <g key={m.name} className="pointer-events-none">
              {textureMode === "schematic" && (
                <ellipse
                  cx={x(m.lon)}
                  cy={y(m.lat)}
                  rx={(m.rx / 360) * W}
                  ry={(m.ry / 180) * H}
                  fill="#1f2433"
                  fillOpacity={0.45}
                />
              )}
              <text
                x={x(m.lon)}
                y={y(m.lat) + 3}
                textAnchor="middle"
                fontSize="8.5"
                fontWeight="bold"
                fill="#F8FAFC"
                fillOpacity={0.65}
                style={{
                  textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                }}
              >
                {m.name}
              </text>
            </g>
          ))}

          {/* Labeled Lunar Craters (Authentic Positions) */}
          {showCraters &&
            PROMINENT_CRATERS.map((c) => {
              const cx = x(c.lon);
              const cy = y(c.lat);
              const color = FEATURE_TYPE_COLORS[c.type];
              return (
                <g
                  key={c.id}
                  transform={`translate(${cx}, ${cy})`}
                  onMouseEnter={() => setHoveredCrater(c.name)}
                  onMouseLeave={() => setHoveredCrater(null)}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    r="3.5"
                    fill={color}
                    fillOpacity={0.85}
                    stroke="#0B0E14"
                    strokeWidth="1"
                  />
                  <text
                    x="5"
                    y="2.5"
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill="#FDE047"
                    style={{
                      textShadow: "0 1px 2px #000, 0 0 4px #000",
                      pointerEvents: "none",
                    }}
                  >
                    {c.name}
                  </text>
                </g>
              );
            })}

          {/* Axis Labels & Hemisphere Indicators */}
          <text x={x(0)} y={H - 5} textAnchor="middle" fontSize="8" fill="#F8FAFC" fillOpacity={0.7} fontFamily="monospace">
            0°
          </text>
          <text x={6} y={H - 5} fontSize="8" fill="#F8FAFC" fillOpacity={0.7} fontFamily="monospace">
            180° W
          </text>
          <text x={W - 6} y={H - 5} textAnchor="end" fontSize="8" fill="#F8FAFC" fillOpacity={0.7} fontFamily="monospace">
            180° E
          </text>
          <text x={x(0) + 4} y={12} fontSize="8.5" fontWeight="bold" fill="#F8FAFC" fillOpacity={0.75} fontFamily="monospace">
            near side ↔ far side at the edges
          </text>

          {/* Candidate Lava Tube Sites (Ranked 1-5) */}
          {sites.map((s) => {
            const sel = s.id === selectedId;
            const c = COLOR[s.status];
            return (
              <g
                key={s.id}
                transform={`translate(${x(s.lon)} ${y(s.lat)})`}
                tabIndex={0}
                role="button"
                aria-label={`${s.name}, rank ${s.rank}`}
                onClick={() => onSelect?.(s)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.(s)}
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(s.id)}
                onBlur={() => setHover(null)}
                style={{ cursor: "pointer", outline: "none" }}
              >
                {sel && (
                  <circle
                    r="13"
                    fill="none"
                    stroke={c}
                    strokeWidth="1.8"
                    strokeDasharray="3 3"
                    className="animate-spin"
                    style={{ animationDuration: "8s" }}
                  />
                )}
                <circle
                  r={sel ? 7.5 : 6}
                  fill={c}
                  stroke="#0B0E14"
                  strokeWidth="1.8"
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))",
                  }}
                />
                <text
                  y="3"
                  textAnchor="middle"
                  fontSize="7.5"
                  fontWeight="900"
                  fill="#0B0E14"
                  style={{ pointerEvents: "none" }}
                >
                  {s.rank}
                </text>
                {s.isSynthetic && (
                  <circle
                    r="9.5"
                    fill="none"
                    stroke="#F8FAFC"
                    strokeOpacity="0.5"
                    strokeDasharray="1.5 2"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip for Candidate Site */}
        {hovered && (
          <div className="pointer-events-none absolute left-3 bottom-3 rounded-2xl border border-cyan-500/40 bg-card/95 text-foreground px-3.5 py-2 text-xs shadow-xl backdrop-blur-md">
            <div className="font-sans font-bold text-cyan-600 dark:text-cyan-300">{hovered.name}</div>
            <div className="font-mono text-muted-foreground text-[11px]">
              Rank #{hovered.rank} &bull; Score {hovered.habitatScore.toFixed(0)} &bull; Lava tube {Math.round(hovered.detection.probability * 100)}%
            </div>
          </div>
        )}

        {/* Hover Tooltip for Crater */}
        {activeCrater && !hovered && (
          <div className="pointer-events-none absolute right-3 bottom-3 rounded-2xl border border-border bg-card/95 text-foreground px-3.5 py-2 text-xs shadow-xl backdrop-blur-md">
            <div className="font-sans font-bold text-foreground">{activeCrater.name}</div>
            <div className="font-mono text-muted-foreground text-[11px]">
              {activeCrater.diameterKm < 1 ? `${Math.round(activeCrater.diameterKm * 1000)}m` : `${activeCrater.diameterKm}km diam`} &bull; {activeCrater.hemisphere.replace("_", " ")}
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-y-2 text-[11px] font-mono text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {(Object.keys(COLOR) as SiteStatus[]).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: COLOR[k] }} />
              {k.replace("_", " ").toLowerCase()}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-full border border-dashed border-current opacity-60" /> synthetic demo
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-cyan-400">
            <span className="size-2 rounded-full bg-cyan-400" /> Craters & Landmarks
          </span>
          <Link
            href="/craters"
            onClick={() => sfx.playSelect()}
            className="text-[#3B82F6] dark:text-[#A5F3FC] hover:underline flex items-center gap-1 font-bold"
          >
            Launch Full Atlas <ExternalLink className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
