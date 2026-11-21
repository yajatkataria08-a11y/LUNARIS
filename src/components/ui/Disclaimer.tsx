import React from "react";
import { ShieldAlert } from "lucide-react";

/** The one caveat that must never be hidden: this system estimates from remote sensing only. */
export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="note"
      className="rounded-2xl border border-slate-800 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-md px-4 py-3 flex gap-3 items-start text-slate-300"
    >
      <ShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-400/90" />
      <div className="text-xs leading-relaxed text-slate-300/90 font-sans">
        <strong className="font-semibold text-slate-200 tracking-wide">REMOTE-SENSING ESTIMATE, NOT A SAFETY CERTIFICATION:</strong>{" "}
        {compact
          ? "A tunnel can only be called safe after direct geological measurements and validation."
          : "These results are inferred from satellite imagery, radar and gravity data. The system cannot certify that a tunnel is intact or safe; that requires direct geological measurements and independent validation on site."}
      </div>
    </div>
  );
}
