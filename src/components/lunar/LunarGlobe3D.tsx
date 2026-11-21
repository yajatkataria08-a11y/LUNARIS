"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  RotateCcw,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Sun,
  Eye,
  Crosshair,
  Sparkles,
  MapPin,
  Flame,
  ShieldCheck,
  Target,
} from "lucide-react";
import {
  LunarFeature,
  LUNAR_CRATERS,
  FEATURE_TYPE_COLORS,
  FEATURE_TYPE_LABELS,
  getFeatureMLAssessment,
  MLCandidateAssessment,
} from "@/lib/lunar-craters-data";
import { sfx } from "@/lib/audio-sfx";

export type TextureOption = "albedo" | "topo" | "elevation" | "mosdac_analog";

interface LunarGlobe3DProps {
  selectedFeature?: LunarFeature | null;
  onSelectFeature?: (f: LunarFeature) => void;
  textureType?: TextureOption;
  showLabels?: boolean;
  filterType?: string;
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

const TEXTURE_PATHS: Record<TextureOption, string> = {
  albedo: "/textures/moon/nasa_moon_albedo_2k.jpg",
  topo: "/textures/moon/nasa_moon_topo_color.jpg",
  elevation: "/textures/moon/nasa_moon_elevation.jpg",
  mosdac_analog: "/textures/moon/isro_mosdac_analog_twin.jpg",
};

const MOON_RADIUS = 1.45;

/** Convert lunar latitude and longitude to 3D Cartesian coordinates on a sphere of radius R. */
function latLonToMoonVector3(latDeg: number, lonDeg: number, radius = MOON_RADIUS): THREE.Vector3 {
  const phi = (90 - latDeg) * (Math.PI / 180);
  const theta = (lonDeg + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

/** Convert a 3D unit vector on Moon's local surface back to (lat, lon) in degrees. */
function moonVector3ToLatLon(vec: THREE.Vector3): { lat: number; lon: number } {
  const norm = vec.clone().normalize();
  const phi = Math.acos(Math.max(-1, Math.min(1, norm.y)));
  const lat = 90 - (phi * 180) / Math.PI;

  const theta = Math.atan2(norm.z, -norm.x);
  let lon = (theta * 180) / Math.PI - 180;
  while (lon < -180) lon += 360;
  while (lon > 180) lon -= 360;

  return { lat, lon };
}

/** Great-circle distance between two (lat, lon) coordinates on a sphere in degrees. */
function angularDistanceDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const rad = Math.PI / 180;
  const phi1 = lat1 * rad;
  const phi2 = lat2 * rad;
  const dPhi = (lat2 - lat1) * rad;
  const dLambda = (lon2 - lon1) * rad;
  const a =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a))) * (180 / Math.PI);
}

export function LunarGlobe3D({
  selectedFeature,
  onSelectFeature,
  textureType = "albedo",
  showLabels = true,
  filterType = "ALL",
  className = "",
  liveSites,
}: LunarGlobe3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const moonMeshRef = useRef<THREE.Mesh | null>(null);
  const moonGroupRef = useRef<THREE.Group | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  // Interactive camera & rotation state
  const rotationRef = useRef({ yaw: 0, pitch: 0 });
  const targetRotationRef = useRef<{ yaw: number; pitch: number } | null>(null);
  const zoomRef = useRef(1.0);
  const isDraggingRef = useRef(false);
  const mouseDownPosRef = useRef({ x: 0, y: 0, time: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ yaw: 0, pitch: 0 });
  const autoRotateRef = useRef(true);

  const [autoRotate, setAutoRotate] = useState(true);
  const [activeTexture, setActiveTexture] = useState<TextureOption>(textureType);
  const [sunAngle, setSunAngle] = useState(45);
  const [hoveredFeature, setHoveredFeature] = useState<LunarFeature | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [pinPositions, setPinPositions] = useState<
    Array<{
      feature: LunarFeature;
      x: number;
      y: number;
      visible: boolean;
      assessment: MLCandidateAssessment;
    }>
  >([]);

  // Keep autoRotate state and ref in sync
  const toggleAutoRotate = () => {
    sfx.playClick(1000);
    const next = !autoRotate;
    autoRotateRef.current = next;
    setAutoRotate(next);
  };

  // Fly to selected feature smoothly
  const flyToFeature = useCallback((f: LunarFeature) => {
    autoRotateRef.current = false;
    setAutoRotate(false);
    const targetPitch = (f.lat * Math.PI) / 180;
    const targetYaw = -(f.lon * Math.PI) / 180;
    targetRotationRef.current = { yaw: targetYaw, pitch: targetPitch };
  }, []);

  useEffect(() => {
    if (selectedFeature) {
      flyToFeature(selectedFeature);
    }
  }, [selectedFeature, flyToFeature]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera: True spherical perspective with square pixel aspect ratio
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.6 / zoomRef.current);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and high pixel ratio
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // 4. Deep Space Procedural Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 800;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 45.0 + Math.random() * 20.0;

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const isBlue = Math.random() > 0.8;
      const isGold = Math.random() > 0.88;
      if (isBlue) {
        starColors[i * 3] = 0.7;
        starColors[i * 3 + 1] = 0.9;
        starColors[i * 3 + 2] = 1.0;
      } else if (isGold) {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.92;
        starColors[i * 3 + 2] = 0.6;
      } else {
        const b = 0.6 + Math.random() * 0.4;
        starColors[i * 3] = b;
        starColors[i * 3 + 1] = b;
        starColors[i * 3 + 2] = b;
      }
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 5. Moon Group (contains Moon Mesh and Crater Anchor Points)
    const moonGroup = new THREE.Group();
    scene.add(moonGroup);
    moonGroupRef.current = moonGroup;

    // 6. True Sphere Geometry: (radius, widthSegments, heightSegments)
    // 64x64 segments guarantees a geometrically perfect sphere with zero elongation.
    const sphereGeometry = new THREE.SphereGeometry(MOON_RADIUS, 64, 64);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const albedoTex = textureLoader.load(TEXTURE_PATHS[activeTexture]);
    const elevTex = textureLoader.load(TEXTURE_PATHS.elevation);

    albedoTex.wrapS = THREE.ClampToEdgeWrapping;
    albedoTex.wrapT = THREE.ClampToEdgeWrapping;
    albedoTex.colorSpace = THREE.SRGBColorSpace;

    elevTex.wrapS = THREE.ClampToEdgeWrapping;
    elevTex.wrapT = THREE.ClampToEdgeWrapping;

    // High quality lunar material with bump relief
    const isAnalogTwin = activeTexture === "mosdac_analog";
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: albedoTex,
      bumpMap: elevTex,
      bumpScale: isAnalogTwin ? 0.055 : 0.045,
      roughness: isAnalogTwin ? 0.86 : 0.92,
      metalness: isAnalogTwin ? 0.10 : 0.04,
    });

    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
    moonGroup.add(moonMesh);
    moonMeshRef.current = moonMesh;

    // 7. Lighting Model
    // Ambient cosmic light
    const ambientLight = new THREE.AmbientLight(0x181e2b, 0.55);
    scene.add(ambientLight);

    // Directional Sun Light
    const sunRad = (sunAngle * Math.PI) / 180;
    const dirLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    dirLight.position.set(Math.cos(sunRad) * 10, 2.5, Math.sin(sunRad) * 10);
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Subtle opposite rim light for lunar limb edge definition
    const rimLight = new THREE.DirectionalLight(0x223555, 0.45);
    rimLight.position.set(0, 0, -10);
    scene.add(rimLight);

    // 8. Animation & Render Loop
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Handle Smooth Rotation / Orbiting
      if (targetRotationRef.current) {
        const tr = targetRotationRef.current;
        const cur = rotationRef.current;
        let diffYaw = tr.yaw - cur.yaw;
        diffYaw = ((diffYaw + Math.PI) % (2 * Math.PI)) - Math.PI;

        const diffPitch = tr.pitch - cur.pitch;
        cur.yaw += diffYaw * 0.09;
        cur.pitch += diffPitch * 0.09;

        if (Math.abs(diffYaw) < 0.0015 && Math.abs(diffPitch) < 0.0015) {
          cur.yaw = tr.yaw;
          cur.pitch = tr.pitch;
          targetRotationRef.current = null;
        }
      } else if (autoRotateRef.current && !isDraggingRef.current) {
        rotationRef.current.yaw -= 0.0022;
      } else if (!isDraggingRef.current) {
        rotationRef.current.yaw += velocityRef.current.yaw;
        rotationRef.current.pitch += velocityRef.current.pitch;
        velocityRef.current.yaw *= 0.92;
        velocityRef.current.pitch *= 0.92;
      }

      // Clamp pitch to avoid gimbal lock
      rotationRef.current.pitch = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, rotationRef.current.pitch)
      );

      // Apply rotation to Moon group
      moonGroup.rotation.y = rotationRef.current.yaw;
      moonGroup.rotation.x = rotationRef.current.pitch;

      // Update camera distance for zoom
      camera.position.z = 5.6 / zoomRef.current;

      // Render Three.js scene
      renderer.render(scene, camera);

      // Calculate 2D Screen Projections for Crater Pins
      const filtered =
        filterType === "ALL"
          ? LUNAR_CRATERS
          : LUNAR_CRATERS.filter((c) => c.type === filterType);

      const w = container.clientWidth;
      const h = container.clientHeight;
      const camPos = camera.position;

      const computedPins = filtered.map((c) => {
        // Point on Moon surface in local coordinates
        const localPos = latLonToMoonVector3(c.lat, c.lon, MOON_RADIUS * 1.002);

        // Convert to world coordinates
        const worldPos = localPos.clone().applyMatrix4(moonGroup.matrixWorld);

        // Visibility test: Angle between surface normal and vector to camera
        const toCam = camPos.clone().sub(worldPos).normalize();
        const normal = worldPos.clone().sub(moonGroup.position).normalize();
        const isFacingCamera = normal.dot(toCam) > 0.15;

        // Project world coordinates to normalized device coordinates (-1 to +1)
        const screenPos = worldPos.clone().project(camera);

        // Convert NDC to screen pixel coordinates
        const screenX = (screenPos.x * 0.5 + 0.5) * w;
        const screenY = (-(screenPos.y * 0.5) + 0.5) * h;

        const assessment = getFeatureMLAssessment(c, liveSites);

        return {
          feature: c,
          x: screenX,
          y: screenY,
          visible: isFacingCamera && screenPos.z < 1.0,
          assessment,
        };
      });

      setPinPositions(computedPins);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      sphereGeometry.dispose();
      moonMaterial.dispose();
      albedoTex.dispose();
      elevTex.dispose();
      starGeo.dispose();
      starMat.dispose();
    };
  }, [activeTexture, liveSites, filterType]);

  // Update Directional Sun Light when sunAngle changes
  useEffect(() => {
    if (!dirLightRef.current) return;
    const sunRad = (sunAngle * Math.PI) / 180;
    dirLightRef.current.position.set(Math.cos(sunRad) * 10, 2.5, Math.sin(sunRad) * 10);
  }, [sunAngle]);

  // Raycasting on Moon Sphere from Mouse Coordinates
  const raycastToMoon = (clientX: number, clientY: number): { lat: number; lon: number } | null => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    const moonMesh = moonMeshRef.current;
    if (!container || !camera || !moonMesh) return null;

    const rect = container.getBoundingClientRect();
    const mouseNdc = new THREE.Vector2(
      ((clientX - rect.left) / container.clientWidth) * 2 - 1,
      -((clientY - rect.top) / container.clientHeight) * 2 + 1
    );

    raycasterRef.current.setFromCamera(mouseNdc, camera);
    const intersects = raycasterRef.current.intersectObject(moonMesh, false);

    if (intersects.length > 0) {
      const hitWorld = intersects[0].point;
      // Convert world coordinate into Moon mesh's local coordinates
      const hitLocal = moonMesh.worldToLocal(hitWorld.clone());
      return moonVector3ToLatLon(hitLocal);
    }
    return null;
  };

  // Find nearest crater to a given (lat, lon) on the Moon
  const findNearestFeature = (lat: number, lon: number): LunarFeature | null => {
    let nearest: LunarFeature | null = null;
    let minDist = Infinity;

    for (const f of LUNAR_CRATERS) {
      const d = angularDistanceDeg(lat, lon, f.lat, f.lon);
      if (d < minDist) {
        minDist = d;
        nearest = f;
      }
    }
    return minDist <= 28 ? nearest : null;
  };

  // Mouse / Pointer Drag and Click Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { yaw: 0, pitch: 0 };
    autoRotateRef.current = false;
    setAutoRotate(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Raycast to get hover coordinates
    const coords = raycastToMoon(e.clientX, e.clientY);
    setCursorCoords(coords);

    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    const speed = 0.005;
    rotationRef.current.yaw += dx * speed;
    rotationRef.current.pitch -= dy * speed;

    velocityRef.current = {
      yaw: dx * speed * 0.8,
      pitch: -dy * speed * 0.8,
    };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;

    // Check if this was a click rather than a drag (< 6px movement)
    const dx = e.clientX - mouseDownPosRef.current.x;
    const dy = e.clientY - mouseDownPosRef.current.y;
    const distSq = dx * dx + dy * dy;

    if (distSq < 36 && wasDragging) {
      const coords = raycastToMoon(e.clientX, e.clientY);
      if (coords) {
        const nearest = findNearestFeature(coords.lat, coords.lon);
        if (nearest) {
          sfx.playClick(1200);
          onSelectFeature?.(nearest);
          flyToFeature(nearest);
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.0015;
    zoomRef.current = Math.max(0.5, Math.min(2.5, zoomRef.current + zoomDelta));
  };

  // Preset Navigation
  const setPreset = (yawDeg: number, pitchDeg: number) => {
    sfx.playSelect();
    autoRotateRef.current = false;
    setAutoRotate(false);
    targetRotationRef.current = {
      yaw: (yawDeg * Math.PI) / 180,
      pitch: (pitchDeg * Math.PI) / 180,
    };
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl shadow-cyan-950/15 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        className="w-full h-full cursor-grab active:cursor-grabbing block relative z-10"
      />

      {/* Floating 3D Crater Pins & Interactive Overlays */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
        {pinPositions.map((p) => {
          if (!p.visible) return null;
          const isSelected = selectedFeature?.id === p.feature.id;
          const isHovered = hoveredFeature?.id === p.feature.id;
          const color = FEATURE_TYPE_COLORS[p.feature.type];
          const isLavaTube = p.feature.type === "LAVA_TUBE_PIT";
          const assessment = p.assessment;

          return (
            <div
              key={p.feature.id}
              style={{
                transform: `translate(${p.x}px, ${p.y}px)`,
                left: 0,
                top: 0,
              }}
              className="absolute pointer-events-auto transition-transform duration-75"
            >
              {/* Pin button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sfx.playClick(1200);
                  onSelectFeature?.(p.feature);
                  flyToFeature(p.feature);
                }}
                onMouseEnter={() => setHoveredFeature(p.feature)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-1 focus:outline-none"
                aria-label={p.feature.name}
              >
                {/* Active targeting reticle when selected */}
                {isSelected && (
                  <div className="absolute size-10 -top-1 -left-1 pointer-events-none border-2 border-dashed border-cyan-400 rounded-full animate-spin [animation-duration:8s] opacity-80" />
                )}

                {/* Pulsing ring for selected or candidate lava tube pits */}
                {(isSelected || isLavaTube) && (
                  <span
                    className="absolute size-6 rounded-full animate-ping opacity-60 pointer-events-none"
                    style={{ backgroundColor: color }}
                  />
                )}

                {/* Pin core marker */}
                <span
                  style={{
                    backgroundColor: color,
                    borderColor: isSelected ? "#38BDF8" : "#0B0E17",
                  }}
                  className={`size-3.5 rounded-full border-2 shadow-xl transition-all duration-200 ${
                    isSelected
                      ? "scale-150 ring-4 ring-cyan-400/60 shadow-cyan-400/50"
                      : "group-hover:scale-125"
                  }`}
                />

                {/* Crater Label & ML Score Badge */}
                {(showLabels || isSelected || isHovered || isLavaTube) && (
                  <div
                    className={`absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 whitespace-nowrap text-[11px] font-mono rounded-xl px-2.5 py-1 shadow-2xl backdrop-blur-md border transition-all pointer-events-none ${
                      isSelected
                        ? "bg-cyan-500 text-slate-950 border-cyan-300 font-extrabold z-40 scale-105 shadow-cyan-500/25 ring-2 ring-cyan-400"
                        : isLavaTube
                        ? "bg-slate-900/90 text-emerald-300 border-emerald-500/50 z-30 group-hover:border-emerald-400"
                        : "bg-slate-950/85 text-slate-200 border-slate-700/60 group-hover:border-slate-500 z-10"
                    }`}
                  >
                    <span className="font-bold">{p.feature.name}</span>

                    {/* Prominent Authentic ML Score Badge (Zero Fake Data) */}
                    {assessment.isCandidate && assessment.score > 0 ? (
                      <span
                        className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md ${
                          isSelected
                            ? "bg-slate-950 text-amber-300"
                            : "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40"
                        }`}
                      >
                        ML: {assessment.score.toFixed(1)}/100
                      </span>
                    ) : isLavaTube ? (
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                        CANDIDATE PIT
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-muted-foreground opacity-80">
                        {p.feature.diameterKm < 1
                          ? `${Math.round(p.feature.diameterKm * 1000)}m`
                          : `${p.feature.diameterKm}km`}
                      </span>
                    )}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Top Left: Controls & Texture Selector */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-30">
        <div className="glass-royal-deck flex items-center gap-1.5 p-1.5 rounded-2xl border border-amber-500/30 bg-slate-900/85 backdrop-blur-md shadow-lg">
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
                ? "bg-slate-200 text-slate-950 font-bold shadow"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            LROC Albedo
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
          <button
            onClick={() => {
              sfx.playSelect();
              setActiveTexture("mosdac_analog");
            }}
            className={`px-2.5 py-1 text-xs font-mono rounded-xl transition-all flex items-center gap-1.5 ${
              activeTexture === "mosdac_analog"
                ? "bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/30 scale-105"
                : "text-emerald-300/90 hover:text-white hover:bg-emerald-500/20"
            }`}
            title="ISRO MOSDAC Terrestrial Volcanic Analog Twin (Deccan Traps & Lonar Crater)"
          >
            <span
              className={`size-2 rounded-full ${
                activeTexture === "mosdac_analog" ? "bg-slate-950" : "bg-emerald-400 animate-pulse"
              }`}
            />
            MOSDAC Analog Twin
          </button>
        </div>

        {/* Quick View Presets */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-2xl border border-slate-800 bg-slate-900/85 backdrop-blur-md max-w-xs sm:max-w-none shadow-lg">
          <button
            onClick={() => setPreset(0, 0)}
            className="px-2 py-0.5 text-[10px] font-mono rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
          >
            Near Side
          </button>
          <button
            onClick={() => setPreset(180, 0)}
            className="px-2 py-0.5 text-[10px] font-mono rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
          >
            Far Side
          </button>
          <button
            onClick={() => setPreset(0, -90)}
            className="px-2 py-0.5 text-[10px] font-mono rounded-lg text-emerald-400 hover:bg-emerald-500/20"
          >
            South Pole (Artemis)
          </button>
          <button
            onClick={() => setPreset(0, 90)}
            className="px-2 py-0.5 text-[10px] font-mono rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
          >
            North Pole
          </button>
          <button
            onClick={() => setPreset(-33, 8)}
            className="px-2 py-0.5 text-[10px] font-mono rounded-lg text-cyan-300 hover:bg-cyan-500/20 font-bold"
          >
            Tranquillitatis Pit (Rank #1)
          </button>
          <button
            onClick={() => setPreset(57, -14)}
            className="px-2 py-0.5 text-[10px] font-mono rounded-lg text-cyan-300 hover:bg-cyan-500/20"
          >
            Marius Hills (#2)
          </button>
        </div>
      </div>

      {/* Top Right: Camera & Lighting Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
        {/* Sun Angle Slider */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/85 border border-slate-800 backdrop-blur-md text-xs font-mono text-slate-300 shadow-lg">
          <Sun className="size-3.5 text-cyan-400" />
          <span className="text-[10px]">Sun Azimuth:</span>
          <input
            type="range"
            min="0"
            max="360"
            value={sunAngle}
            onChange={(e) => setSunAngle(Number(e.target.value))}
            className="w-16 accent-cyan-400 cursor-pointer"
            title="Adjust Sun Azimuth"
          />
        </div>

        {/* Auto-Rotate Toggle */}
        <button
          onClick={toggleAutoRotate}
          title={autoRotate ? "Pause rotation" : "Auto rotate"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-mono font-bold transition-all backdrop-blur-md shadow-lg ${
            autoRotate
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
              : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
          }`}
        >
          <RotateCcw className={`size-3.5 ${autoRotate ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">{autoRotate ? "Spinning" : "Orbit"}</span>
        </button>

        {/* Zoom Controls */}
        <div className="flex items-center rounded-2xl bg-slate-900/85 border border-slate-700/50 p-0.5 backdrop-blur-md shadow-lg">
          <button
            onClick={() => {
              sfx.playClick(1000);
              zoomRef.current = Math.min(2.5, zoomRef.current + 0.2);
            }}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl"
            title="Zoom In"
          >
            <ZoomIn className="size-3.5" />
          </button>
          <button
            onClick={() => {
              sfx.playClick(800);
              zoomRef.current = Math.max(0.5, zoomRef.current - 0.2);
            }}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl"
            title="Zoom Out"
          >
            <ZoomOut className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Overlay Instructions & Live Telemetry Coordinates */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-400 pointer-events-none z-30">
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl backdrop-blur-md border border-slate-800 shadow-md">
          <Crosshair className="size-3.5 text-amber-400" />
          <span>
            Click crater on Moon to inspect &bull; Drag to rotate &bull; Scroll to zoom
          </span>
        </div>

        {/* Live Cursor Lunar Coordinates Readout */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-950/85 px-3 py-1.5 rounded-xl backdrop-blur-md border border-slate-800 text-[10px] font-mono text-amber-400">
          <Target className="size-3 text-cyan-400" />
          {cursorCoords ? (
            <span>
              Target: {Math.abs(cursorCoords.lat).toFixed(1)}°{cursorCoords.lat >= 0 ? "N" : "S"},{" "}
              {Math.abs(cursorCoords.lon).toFixed(1)}°{cursorCoords.lon >= 0 ? "E" : "W"}
            </span>
          ) : (
            <span className="text-muted-foreground">Hover over Moon for coordinates</span>
          )}
        </div>

        {activeTexture === "mosdac_analog" ? (
          <div className="hidden md:flex items-center gap-1.5 bg-emerald-950/85 px-3 py-1.5 rounded-xl backdrop-blur-md border border-emerald-500/50 text-[10px] text-emerald-300 font-bold shadow-md shadow-emerald-900/40">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            <span>ISRO MOSDAC & RISAT-1 Basalt Twin &bull; &epsilon;r: 6.8 &ndash; 8.1 (2048x1024)</span>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl backdrop-blur-md border border-slate-800 text-[10px]">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>NASA LRO / LOLA 2048x1024</span>
          </div>
        )}
      </div>
    </div>
  );
}
