import React from "react";
import type { RoofAnalysis, TubeDetection } from "@/lib/types";

/**
 * Cut-away schematic of the selected site. Proportions follow the estimated numbers
 * (roof thickness, skylight width, tube width), but the picture is an illustration, not a survey.
 */
export function CrossSection({ roof, detection }: { roof: RoofAnalysis; detection: TubeDetection }) {
  const W = 640;
  const H = 280;
  const surfaceY = 70;
  const known = roof.roofThicknessM != null;
  const roofM = roof.roofThicknessM ?? 8;
  const widthM = detection.estWidthM ?? 50;

  // scale: map metres → px with caps so extreme values keep the picture legible
  const roofPx = Math.max(14, Math.min(90, roofM * 5));
  const tubeW = Math.max(110, Math.min(420, widthM * 3.4));
  const tubeH = Math.max(60, Math.min(110, widthM * 0.9));
  const cx = W / 2;
  const tubeTop = surfaceY + roofPx;
  const tubeBottom = tubeTop + tubeH;
  const skyW = roof.skylightDetected ? Math.max(18, Math.min(120, (roof.skylightDiameterM ?? 30) * 1.4)) : 0;

  const stab = roof.stability;
  const roofColor = stab >= 0.65 ? "#10B981" : stab >= 0.4 ? "#F59E0B" : "#F43F5E";

  // a few fracture lines in the roof; more when crack density is higher
  const nCracks = roof.crackDensity === "high" ? 6 : roof.crackDensity === "moderate" ? 3 : 1;
  const cracks = Array.from({ length: nCracks }, (_, i) => {
    const px = cx - tubeW / 2 + ((i + 1) / (nCracks + 1)) * tubeW;
    return { x1: px, y1: surfaceY + 4, x2: px + (i % 2 ? 9 : -9), y2: tubeTop - 2 };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-xl" role="img"
      aria-label={`Cross-section: roof about ${known ? roofM + " metres" : "unknown"} thick, ${roof.skylightDetected ? "skylight present" : "no skylight detected"}`}>
      <rect width={W} height={H} rx="12" fill="#10131c" fillOpacity="0.55" />
      {/* vacuum above the surface */}
      <text x="14" y="22" fontSize="10" fill="#9BA6B8">vacuum</text>

      {/* bedrock mass with the tube cut out (even-odd) */}
      <path
        fillRule="evenodd"
        fill="#59606e"
        d={`M0 ${surfaceY} H${W} V${H} H0 Z
            M${cx - tubeW / 2} ${tubeBottom}
            V${tubeTop + 14}
            Q${cx - tubeW / 2} ${tubeTop} ${cx - tubeW / 2 + 22} ${tubeTop}
            H${cx + tubeW / 2 - 22}
            Q${cx + tubeW / 2} ${tubeTop} ${cx + tubeW / 2} ${tubeTop + 14}
            V${tubeBottom} Z`}
      />
      {/* skylight opening through the roof */}
      {roof.skylightDetected && (
        <rect x={cx - skyW / 2} y={surfaceY - 1} width={skyW} height={roofPx + 2} fill="#10131c" />
      )}
      {/* surface line */}
      <line x1="0" x2={W} y1={surfaceY} y2={surfaceY} stroke="#d6dae3" strokeWidth="2" />

      {/* roof highlight */}
      <rect x={cx - tubeW / 2} y={surfaceY} width={tubeW} height={roofPx} fill={roofColor} fillOpacity="0.22" />
      {cracks.map((c, i) => (
        <line key={i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="#f1f5f9" strokeOpacity="0.55" strokeWidth="1" strokeDasharray="3 2" />
      ))}

      {/* floor rubble hint under skylight */}
      {roof.skylightDetected && (
        <path d={`M${cx - skyW / 2 - 12} ${tubeBottom} Q${cx} ${tubeBottom - 22} ${cx + skyW / 2 + 12} ${tubeBottom} Z`} fill="#7b8190" />
      )}

      {/* dimension: roof thickness */}
      <g stroke="#E5C158" strokeWidth="1.2" fill="#E5C158" fontSize="11" fontFamily="monospace">
        <line x1={cx - tubeW / 2 - 24} x2={cx - tubeW / 2 - 24} y1={surfaceY} y2={tubeTop} />
        <line x1={cx - tubeW / 2 - 30} x2={cx - tubeW / 2 - 18} y1={surfaceY} y2={surfaceY} />
        <line x1={cx - tubeW / 2 - 30} x2={cx - tubeW / 2 - 18} y1={tubeTop} y2={tubeTop} />
        <text x={cx - tubeW / 2 - 32} y={(surfaceY + tubeTop) / 2 + 4} textAnchor="end" stroke="none">
          roof {known ? `~${roofM} m` : "? m"}
        </text>
      </g>
      {/* dimension: tube width */}
      <g stroke="#A5F3FC" strokeWidth="1.2" fill="#A5F3FC" fontSize="11" fontFamily="monospace">
        <line x1={cx - tubeW / 2} x2={cx + tubeW / 2} y1={tubeBottom + 16} y2={tubeBottom + 16} />
        <line x1={cx - tubeW / 2} x2={cx - tubeW / 2} y1={tubeBottom + 10} y2={tubeBottom + 22} />
        <line x1={cx + tubeW / 2} x2={cx + tubeW / 2} y1={tubeBottom + 10} y2={tubeBottom + 22} />
        <text x={cx} y={tubeBottom + 32} textAnchor="middle" stroke="none">
          {detection.estWidthM != null ? `interior ~${detection.estWidthM} m wide (estimated)` : "width unknown"}
        </text>
      </g>
      {roof.skylightDetected && (
        <text x={cx} y={surfaceY - 10} textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#f1f5f9">
          skylight ~{roof.skylightDiameterM ?? "?"} m
        </text>
      )}
      <text x={cx} y={tubeTop + tubeH / 2 + 4} textAnchor="middle" fontSize="11" fill="#9BA6B8">
        hollow lava tube
      </text>
      <text x={W - 12} y={H - 10} textAnchor="end" fontSize="9" fill="#9BA6B8">
        schematic, not to survey scale
      </text>
    </svg>
  );
}
