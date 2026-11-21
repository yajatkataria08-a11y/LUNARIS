"use client";

import React from "react";
import { MapPin } from "lucide-react";
import type { RankedSite } from "@/lib/types";
import { sfx } from "@/lib/audio-sfx";

/** Horizontal site switcher shared by the console pages. */
export function SiteStrip({ sites, selectedId, onSelect }: { sites: RankedSite[]; selectedId: string; onSelect: (s: RankedSite) => void }) {
  return (
    <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2">
      <span className="text-[10.5px] font-mono font-bold tracking-widest uppercase text-cyan-400 flex items-center gap-1.5 shrink-0">
        <MapPin className="size-3 text-cyan-400" /> Active site
      </span>
      <div className="flex items-center gap-2 py-1">
        {sites.map((s) => {
          const on = s.id === selectedId;
          return (
            <button
              key={s.id}
              onClick={() => {
                sfx.playSelect();
                onSelect(s);
              }}
              aria-pressed={on}
              className={`interactive-press shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all duration-200 ${
                on
                  ? "bg-cyan-500/15 dark:bg-cyan-950/40 border-cyan-400/80 text-cyan-200 font-semibold shadow-[0_0_16px_rgba(14,165,233,0.2)]"
                  : "bg-slate-900/50 dark:bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <span className="text-[10px] opacity-60">#{s.rank}</span>
              <span className="max-w-[160px] truncate">{s.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
