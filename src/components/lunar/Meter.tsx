import React from "react";

/** Horizontal 0–1 meter with a label. Colour reflects `tone`, not just the number, so it is readable at a glance. */
export function Meter({
  label,
  value,
  hint,
  tone = "auto",
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: "auto" | "good" | "mid" | "bad" | "neutral";
}) {
  const v = Math.max(0, Math.min(1, value));
  const t = tone === "auto" ? (v >= 0.66 ? "good" : v >= 0.4 ? "mid" : "bad") : tone;
  const bar =
    t === "good" ? "bg-emerald-500" : t === "mid" ? "bg-amber-500" : t === "bad" ? "bg-rose-500" : "bg-[#3B82F6]";
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">{Math.round(v * 100)}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-300/50 dark:bg-slate-800/80 overflow-hidden" role="meter" aria-valuenow={Math.round(v * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={`h-full rounded-full transition-all duration-500 ${bar}`} style={{ width: `${v * 100}%` }} />
      </div>
      {hint && <p className="text-[11px] text-muted-foreground leading-snug">{hint}</p>}
    </div>
  );
}
