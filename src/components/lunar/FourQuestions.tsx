import React from "react";
import { CircleHelp, Eye, Mountain, Home } from "lucide-react";
import type { RankedSite } from "@/lib/types";
import { answerQuestions } from "@/lib/scoring";

const TONE = {
  good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  mid: "border-amber-500/25 bg-amber-500/5 text-amber-600 dark:text-amber-300",
  bad: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
} as const;

/** The four questions the whole system exists to answer, answered for one site. */
export function FourQuestions({ site }: { site: RankedSite }) {
  const a = answerQuestions(site);
  const items = [
    { n: 1, q: "Is there potentially a lava tube beneath this location?", icon: CircleHelp, ans: a.q1 },
    { n: 2, q: "Is the entrance or skylight detectable?", icon: Eye, ans: a.q2 },
    { n: 3, q: "How stable is the surrounding roof?", icon: Mountain, ans: a.q3 },
    { n: 4, q: "Is this location potentially suitable for a human habitat?", icon: Home, ans: a.q4 },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {items.map(({ n, q, icon: Icon, ans }) => (
        <div key={n} className="glass-royal-card rounded-2xl p-4 border border-slate-800/80 dark:border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 font-mono text-[11px] font-bold">{n}</span>
            <p className="text-xs font-semibold leading-snug">{q}</p>
          </div>
          <div className={`mt-auto rounded-xl border px-3 py-2 ${TONE[ans.tone]}`}>
            <div className="flex items-center gap-1.5 font-sans text-xs sm:text-sm font-bold">
              <Icon className="size-3.5" /> {ans.label}
            </div>
            <div className="text-[11px] font-mono opacity-90 leading-snug">{ans.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
