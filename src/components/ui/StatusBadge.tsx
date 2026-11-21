import React from "react";
import type { SiteStatus } from "@/lib/types";

const CONFIGS: Record<SiteStatus, { label: string; cls: string; dot: string }> = {
  PRIORITY_CANDIDATE: {
    label: "Priority candidate",
    cls: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40",
    dot: "bg-emerald-500",
  },
  CANDIDATE: {
    label: "Candidate",
    cls: "bg-[#3B82F6]/15 text-[#1E1B4B] dark:text-cyan-300 border-[#3B82F6]/40",
    dot: "bg-[#3B82F6]",
  },
  NEEDS_DATA: {
    label: "Needs more data",
    cls: "bg-amber-500/15 text-[#8a6a1c] dark:text-amber-300 border-amber-500/40",
    dot: "bg-amber-500",
  },
  UNSTABLE: {
    label: "Roof risk",
    cls: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/45",
    dot: "bg-rose-500",
  },
  UNLIKELY: {
    label: "Unlikely",
    cls: "bg-slate-200/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700",
    dot: "bg-slate-500",
  },
};

export function StatusBadge({ status, className = "" }: { status: SiteStatus; className?: string }) {
  const c = CONFIGS[status] ?? CONFIGS.CANDIDATE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10.5px] font-mono tracking-wider uppercase whitespace-nowrap ${c.cls} ${className}`}>
      <span className={`size-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
