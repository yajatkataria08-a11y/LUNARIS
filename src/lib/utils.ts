import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRaDec(ra: number, dec: number): string {
  if (!Number.isFinite(ra) || !Number.isFinite(dec)) return "—";
  const raHours = Math.floor(ra / 15);
  const raMinutes = Math.floor((ra / 15 - raHours) * 60);
  const raSeconds = (((ra / 15 - raHours) * 60 - raMinutes) * 60).toFixed(1);

  const decSign = dec >= 0 ? "+" : "-";
  const decAbs = Math.abs(dec);
  const decDeg = Math.floor(decAbs);
  const decMin = Math.floor((decAbs - decDeg) * 60);
  const decSec = (((decAbs - decDeg) * 60 - decMin) * 60).toFixed(1);

  return `${raHours}h ${raMinutes}m ${raSeconds}s | ${decSign}${decDeg}° ${decMin}' ${decSec}"`;
}


/** Null/NaN-safe number formatting: missing catalog values render as an em dash instead of crashing. */
export function fmt(v: number | null | undefined, digits = 2): string {
  return typeof v === "number" && Number.isFinite(v) ? v.toFixed(digits) : "—";
}
export function fmtInt(v: number | null | undefined): string {
  return typeof v === "number" && Number.isFinite(v) ? v.toLocaleString() : "—";
}

/** Selenographic coordinates, e.g. "14.09° N, 56.72° W". */
export function formatLatLon(lat: number, lon: number): string {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return "—";
  return `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? "E" : "W"}`;
}

export const pct = (v: number) => `${Math.round(v * 100)}%`;
