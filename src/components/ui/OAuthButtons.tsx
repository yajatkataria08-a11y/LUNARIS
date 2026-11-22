"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, UserCheck, Compass, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { sfx } from "@/lib/audio-sfx";

export function OAuthButtons({ next }: { next: string }) {
  const router = useRouter();
  const { continueAsGuest, loginAsDemo } = useAuth();

  const handleGuest = () => {
    sfx.playSuccess();
    continueAsGuest();
    router.replace(next);
  };

  const handleDemoDirector = () => {
    sfx.playSuccess();
    loginAsDemo("director");
    router.replace(next);
  };

  const handleDemoAnalyst = () => {
    sfx.playSuccess();
    loginAsDemo("analyst");
    router.replace(next);
  };

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground uppercase">
        <span className="h-px flex-1 bg-border/60" /> 1-Click Open-Source Instant Access <span className="h-px flex-1 bg-border/60" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={handleGuest}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted p-2.5 text-xs font-mono font-medium text-foreground hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 shadow-sm"
        >
          <Compass className="size-3.5 text-cyan-500" />
          <span>Guest Pass</span>
        </button>

        <button
          type="button"
          onClick={handleDemoDirector}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 p-2.5 text-xs font-mono font-medium text-amber-700 dark:text-amber-300 transition-all duration-200 shadow-sm"
        >
          <Shield className="size-3.5 text-amber-500" />
          <span>ISRO Director</span>
        </button>

        <button
          type="button"
          onClick={handleDemoAnalyst}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 p-2.5 text-xs font-mono font-medium text-emerald-700 dark:text-emerald-300 transition-all duration-200 shadow-sm"
        >
          <UserCheck className="size-3.5 text-emerald-500" />
          <span>Data Analyst</span>
        </button>
      </div>

      <p className="text-[10px] text-center font-mono text-muted-foreground">
        Zero external API keys required &bull; 100% Open-source local authentication
      </p>
    </div>
  );
}
