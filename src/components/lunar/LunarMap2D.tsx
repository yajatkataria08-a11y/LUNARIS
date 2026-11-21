"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Crosshair,
  Compass,
  Filter,
} from "lucide-react";
import {
  LunarFeature,
  LUNAR_CRATERS,
  FEATURE_TYPE_COLORS,
  lonToX,
  latToY,
  xToLon,
  yToLat,
} from "@/lib/lunar-craters-data";
import { sfx } from "@/lib/audio-sfx";

export type TextureLayer = "albedo" | "topo" | "elevation";

interface LunarMap2DProps {
  selectedFeature?: LunarFeature | null;
  onSelectFeature?: (f: LunarFeature) => void;
  textureType?: TextureLayer;
  showLabels?: boolean;
  filterType?: string;
  className?: string;
}

const W = 1440;
const H = 720;

export function LunarMap2D({
  selectedFeature,
  onSelectFeature,
  textureType = "albedo",
  showLabels = true,
  filterType = "ALL",
  className = "",
}: LunarMap2DProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [activeTexture, setActiveTexture] = useState<TextureLayer>(textureType);
  const [hoverCoord, setHoverCoord] = useState<{ lon: number; lat: number } | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<LunarFeature | null>(null);
  const [showGraticule, setShowGraticule] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const textureUrl = useMemo(() => {
    switch (activeTexture) {
      case "topo":
        return "/textures/moon/nasa_moon_topo_color.jpg";
      case "elevation":
        return "/textures/moon/nasa_moon_elevation.jpg";
      case "albedo":
      default:
        return "/textures/moon/nasa_moon_albedo_2k.jpg";
    }
  }, [activeTexture]);

  const filteredFeatures = useMemo(() => {
    if (filterType === "ALL") return LUNAR_CRATERS;
    return LUNAR_CRATERS.filter((f) => f.type === filterType);
  }, [filterType]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left - pan.x;
      const clientY = e.clientY - rect.top - pan.y;

      const normX = (clientX / (rect.width * zoom)) * W;
      const normY = (clientY / (rect.height * zoom)) * H;

      if (normX >= 0 && normX <= W && normY >= 0 && normY <= H) {
        setHoverCoord({
          lon: Number(xToLon(normX, W).toFixed(1)),
          lat: Number(yToLat(normY, H).toFixed(1)),
        });
      } else {
        setHoverCoord(null);
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoom = (delta: number) => {
    sfx.playClick(1000);
    setZoom((prev) => Math.max(1, Math.min(4, prev + delta)));
  };

  const resetView = () => {
    sfx.playSelect();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-3xl border border-amber-600/25 dark:border-amber-400/20 bg-slate-950 shadow-2xl ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        handleMouseUp();
        setHoverCoord(null);
      }}
    >
      {/* SVG Viewport */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          transition: isPanning ? "none" : "transform 0.15s ease-out",
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block"
          role="img"
          aria-label="High-resolution cartographic NASA map of the Moon"
        >
          {/* NASA Texture Background Image */}
          <image
            href={textureUrl}
            x="0"
            y="0"
            width={W}
            height={H}
            preserveAspectRatio="none"
          />

          {/* Graticule: Coordinate Grid Overlay */}
          {showGraticule && (
            <g className="pointer-events-none opacity-40">
              {/* Meridians (Longitude lines) */}
              {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lon) => {
                const px = lonToX(lon, W);
                const isPrime = lon === 0;
                return (
                  <g key={`lon-${lon}`}>
                    <line
                      x1={px}
                      y1={0}
                      x2={px}
                      y2={H}
                      stroke={isPrime ? "#FDE047" : "#E2E8F0"}
                      strokeWidth={isPrime ? 1.5 : 0.6}
                      strokeDasharray={isPrime ? "" : "3 3"}
                    />
                    <text
                      x={px}
                      y={H - 8}
                      textAnchor="middle"
                      fontSize="10"
                      fill={isPrime ? "#FDE047" : "#CBD5E1"}
                      fontFamily="monospace"
                    >
                      {lon === 0 ? "0°" : `${Math.abs(lon)}°${lon < 0 ? "W" : "E"}`}
                    </text>
                  </g>
                );
              })}

              {/* Parallels (Latitude lines) */}
              {[-60, -30, 0, 30, 60].map((lat) => {
                const py = latToY(lat, H);
                const isEquator = lat === 0;
                return (
                  <g key={`lat-${lat}`}>
                    <line
                      x1={0}
                      y1={py}
                      x2={W}
                      y2={py}
                      stroke={isEquator ? "#FDE047" : "#E2E8F0"}
                      strokeWidth={isEquator ? 1.5 : 0.6}
                      strokeDasharray={isEquator ? "" : "3 3"}
                    />
                    <text
                      x={8}
                      y={py - 3}
                      fontSize="10"
                      fill={isEquator ? "#FDE047" : "#CBD5E1"}
                      fontFamily="monospace"
                    >
                      {lat === 0 ? "EQ 0°" : `${Math.abs(lat)}°${lat < 0 ? "S" : "N"}`}
                    </text>
                  </g>
                );
              })}

              {/* Hemisphere Region Banners */}
              <text x={W / 2} y={24} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#F8FAFC" letterSpacing="4">
                NEAR SIDE (EARTH FACING)
              </text>
              <text x={W * 0.12} y={24} textAnchor="middle" fontSize="11" fill="#94A3B8" letterSpacing="2">
                FAR SIDE (WEST)
              </text>
              <text x={W * 0.88} y={24} textAnchor="middle" fontSize="11" fill="#94A3B8" letterSpacing="2">
                FAR SIDE (EAST)
              </text>
            </g>
          )}

          {/* Interactive Crater, Pit & Landing Pins */}
          {filteredFeatures.map((f) => {
            const px = lonToX(f.lon, W);
            const py = latToY(f.lat, H);
            const isSelected = selectedFeature?.id === f.id;
            const isHovered = hoveredFeature?.id === f.id;
            const color = FEATURE_TYPE_COLORS[f.type];
            const isLavaTube = f.type === "LAVA_TUBE_PIT";
            const isLanding = f.type === "LANDING_SITE";
            const isMare = f.type === "MARE";

            // Visual size based on actual diameter (with min/max clamps)
            const baseRadius = isMare
              ? Math.max(12, Math.min(32, (f.diameterKm / 2000) * 45))
              : isLavaTube
              ? 8
              : Math.max(4, Math.min(16, (f.diameterKm / 100) * 8));

            return (
              <g
                key={f.id}
                transform={`translate(${px}, ${py})`}
                onClick={(e) => {
                  e.stopPropagation();
                  sfx.playClick(1200);
                  onSelectFeature?.(f);
                }}
                onMouseEnter={() => setHoveredFeature(f)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{ cursor: "pointer" }}
                className="transition-all duration-200"
              >
                {/* Mare Boundary Indication */}
                {isMare && (
                  <ellipse
                    rx={baseRadius * 1.5}
                    ry={baseRadius * 0.9}
                    fill={color}
                    fillOpacity={isSelected ? 0.25 : 0.12}
                    stroke={color}
                    strokeWidth={isSelected ? 2 : 1}
                    strokeDasharray="4 2"
                  />
                )}

                {/* Pulsing Selection Ring */}
                {(isSelected || isLavaTube) && (
                  <circle
                    r={baseRadius + 6}
                    fill="none"
                    stroke={isSelected ? "#FDE047" : color}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="animate-spin"
                    style={{ animationDuration: "12s" }}
                  />
                )}

                {/* Pin Core */}
                {!isMare && (
                  <circle
                    r={isSelected ? baseRadius + 2 : baseRadius}
                    fill={color}
                    stroke="#0B0E17"
                    strokeWidth="1.5"
                    fillOpacity={0.9}
                  />
                )}

                {/* Candidate Rank / Icon Badge */}
                {isLavaTube && f.candidateSiteId && (
                  <text
                    y="3"
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="bold"
                    fill="#0B0E17"
                    style={{ pointerEvents: "none" }}
                  >
                    {f.candidateSiteId.replace("SITE-0", "#")}
                  </text>
                )}

                {/* Label text */}
                {(showLabels || isSelected || isHovered || isLavaTube || isLanding) && (
                  <text
                    x={isMare ? 0 : baseRadius + 4}
                    y={isMare ? 0 : 3}
                    textAnchor={isMare ? "middle" : "start"}
                    fontSize={isMare ? "11" : isLavaTube ? "10" : "9"}
                    fontWeight={isSelected || isLavaTube || isMare ? "bold" : "normal"}
                    fill={isSelected ? "#FDE047" : isLavaTube ? "#34D399" : "#F8FAFC"}
                    style={{
                      textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8)",
                      pointerEvents: "none",
                    }}
                  >
                    {f.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Top Left Toolbar */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
        <div className="glass-royal-deck flex items-center gap-1.5 p-1.5 rounded-2xl border border-amber-500/30 bg-slate-900/80 backdrop-blur-md">
          <span className="text-[10px] font-mono font-bold text-amber-400 px-2 flex items-center gap-1">
            <Layers className="size-3" /> NASA TEXTURE:
          </span>
          <button
            onClick={() => {
              sfx.playSelect();
              setActiveTexture("albedo");
            }}
            className={`px-2.5 py-1 text-xs font-mono rounded-xl transition-all ${
              activeTexture === "albedo"
                ? "bg-amber-500 text-slate-950 font-bold shadow"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            LROC Color
          </button>
          <button
            onClick={() => {
              sfx.playSelect();
              setActiveTexture("topo");
            }}
            className={`px-2.5 py-1 text-xs font-mono rounded-xl transition-all ${
              activeTexture === "topo"
                ? "bg-cyan-500 text-slate-950 font-bold shadow"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            LOLA Topo
          </button>
          <button
            onClick={() => {
              sfx.playSelect();
              setActiveTexture("elevation");
            }}
            className={`px-2.5 py-1 text-xs font-mono rounded-xl transition-all ${
              activeTexture === "elevation"
                ? "bg-indigo-500 text-white font-bold shadow"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            Relief
          </button>
        </div>

        {/* Graticule & Grid Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sfx.playClick(900);
              setShowGraticule(!showGraticule);
            }}
            className={`px-3 py-1 rounded-xl border text-[11px] font-mono backdrop-blur-md ${
              showGraticule
                ? "bg-slate-900/80 text-amber-300 border-amber-500/40"
                : "bg-slate-900/60 text-slate-400 border-slate-700/40"
            }`}
          >
            {showGraticule ? "Graticule: ON" : "Graticule: OFF"}
          </button>
        </div>
      </div>

      {/* Top Right Zoom & Pan Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <div className="flex items-center rounded-2xl bg-slate-900/80 border border-slate-700/50 p-0.5 backdrop-blur-md">
          <button
            onClick={() => handleZoom(0.3)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl"
            title="Zoom In"
          >
            <ZoomIn className="size-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.3)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl"
            title="Zoom Out"
          >
            <ZoomOut className="size-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl"
            title="Reset Pan/Zoom"
          >
            <Maximize2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Bottom Status Bar: Coordinates and Zoom */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-300 pointer-events-none z-10">
        <div className="flex items-center gap-3 bg-slate-950/80 px-3.5 py-1.5 rounded-2xl backdrop-blur-md border border-slate-800">
          <Crosshair className="size-3.5 text-amber-400" />
          <span>
            {hoverCoord
              ? `LON: ${Math.abs(hoverCoord.lon)}°${hoverCoord.lon < 0 ? "W" : "E"} · LAT: ${Math.abs(hoverCoord.lat)}°${hoverCoord.lat < 0 ? "S" : "N"}`
              : "Drag to pan · Scroll or use + / - to zoom"}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-2xl backdrop-blur-md border border-slate-800">
          <span className="text-amber-400 font-bold">{Math.round(zoom * 100)}%</span>
          <span>Zoom</span>
        </div>
      </div>
    </div>
  );
}
