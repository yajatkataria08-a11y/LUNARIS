"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Radar, Layers, Trophy, Moon } from "lucide-react";
import { useSites } from "@/lib/hooks";
import { LunarMap } from "@/components/lunar/LunarMap";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { sfx } from "@/lib/audio-sfx";

const TASKS = [
  {
    n: 1,
    icon: Radar,
    title: "Detect potential lava tubes",
    body: "Analyse satellite imagery and radar data to find possible underground tunnels and their entrances.",
    chips: ["Orbital imagery", "Radar echoes", "Gravity anomalies"],
  },
  {
    n: 2,
    icon: Layers,
    title: "Analyse skylights & roof stability",
    body: "Identify openings, cracks, geological structures and potential collapse risks around each tunnel.",
    chips: ["Skylight detection", "Fracture mapping", "Collapse risk"],
  },
  {
    n: 3,
    icon: Trophy,
    title: "Recommend habitat locations",
    body: "Combine geological and structural information to rank sites by suitability for a future lunar habitat.",
    chips: ["Transparent score", "Uncertainty range", "Validation checklist"],
  },
];

const QUESTIONS = [
  "Is there potentially a lava tube beneath this location?",
  "Is the entrance or skylight detectable?",
  "How stable is the surrounding roof?",
  "Is this location potentially suitable for a human habitat?",
];

export default function HomePage() {
  const { ranked, source } = useSites(60);

  return (
    <div className="cosmic-void-canvas min-h-screen text-foreground flex flex-col font-sans relative">
      {/* Hero */}
      <section className="relative pt-12 pb-12 md:pt-20 md:pb-16 px-4 md:px-8 max-w-[1780px] mx-auto w-full">
        <ScrollReveal direction="up" delay={50} className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#B48A28]/40 dark:border-[#D4AF37]/40 bg-[#DDD6FE]/30 dark:bg-[#1E2761]/50 text-xs font-mono">
            <Moon className="size-3.5 text-[#B48A28] dark:text-[#D4AF37]" />
            <span className="font-serif font-bold tracking-wider text-[#B48A28] dark:text-[#D4AF37]">LUNAR LAVA TUBE ASSESSMENT</span>
            <span className="opacity-40">&bull;</span>
            <span>AI-POWERED EXPLORATION</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.12]">
            Natural shelters beneath{" "}
            <span className="bg-gradient-to-r from-[#1E1B4B] via-[#4F46E5] to-[#3B82F6] dark:from-[#D4AF37] dark:via-[#A5F3FC] dark:to-[#E2E8F0] bg-clip-text text-transparent">
              the Moon&rsquo;s surface
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Lava tubes could shield future astronauts from radiation, micrometeorites and extreme temperatures. But no one knows which tunnels are intact, how big they are, or whether their roofs will hold.
            This system estimates exactly that from remote-sensing data.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/pipelines"
              onClick={() => sfx.playSelect()}
              className="sheen-sweep interactive-press interactive-glow-cyan relative flex items-center gap-2 rounded-2xl border border-[#B48A28]/60 dark:border-[#D4AF37]/60 bg-gradient-to-r from-[#1E1B4B] via-[#2E4A9E] to-[#4F46E5] dark:from-[#2E4A9E] dark:via-[#5C1D42] dark:to-[#7A2048] text-white font-serif text-sm font-bold tracking-wider px-6 py-3.5 shadow-xl"
            >
              <span>OPEN ASSESSMENT CONSOLE</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/about"
              onClick={() => sfx.playClick(900)}
              className="interactive-press flex items-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-800 bg-[#F1F5F9]/90 dark:bg-[#0F1322]/80 font-serif text-sm font-bold tracking-wider px-6 py-3.5 shadow-md"
            >
              <BookOpen className="size-4 text-[#3B82F6] dark:text-[#A5F3FC]" />
              <span>WHAT ARE LAVA TUBES?</span>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Map preview */}
      <section className="px-4 md:px-8 max-w-[1180px] mx-auto w-full pb-6">
        <ScrollReveal direction="up">
          <div className="glass-royal-deck rounded-3xl p-4 sm:p-6 border border-amber-600/25 dark:border-amber-400/20">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="font-serif text-lg font-bold">Candidate sites</h2>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-slate-400/50 text-muted-foreground">
                {source === "api" ? "LIVE FROM BACKEND" : source === "loading" ? "CONNECTING…" : "DEMO DATA: placeholder values"}
              </span>
            </div>
            <LunarMap
              sites={ranked}
              onSelect={() => sfx.playSelect()}
              className="text-slate-900 dark:text-slate-200"
            />
          </div>
        </ScrollReveal>
      </section>

      {/* Three tasks */}
      <section className="py-10 px-4 md:px-8 max-w-[1780px] mx-auto w-full space-y-6">
        <ScrollReveal direction="up" className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#B48A28] dark:text-[#D4AF37]">What the system does</div>
          <h2 className="font-serif text-3xl font-black">Three tasks, one assessment</h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TASKS.map((t, i) => {
            const Icon = t.icon;
            return (
              <ScrollReveal key={t.n} direction="up" delay={i * 90} className="h-full">
                <div className="glass-royal-deck relative rounded-3xl p-6 border border-amber-600/25 dark:border-amber-400/25 h-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-[#3B82F6]/15 dark:bg-[#408EC6]/20">
                      <Icon className="size-5 text-[#3B82F6] dark:text-[#A5F3FC]" />
                    </span>
                    <span className="font-mono text-[11px] font-bold text-muted-foreground">TASK {t.n}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold leading-snug">{t.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.body}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                    {t.chips.map((c) => (
                      <span key={c} className="text-[10.5px] font-mono px-2 py-0.5 rounded-full border border-border text-muted-foreground">{c}</span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Four questions */}
      <section className="py-6 px-4 md:px-8 max-w-[1180px] mx-auto w-full space-y-5">
        <ScrollReveal direction="up" className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-black">The four questions</h2>
          <p className="text-sm text-muted-foreground">Every site in the console is answered against these.</p>
        </ScrollReveal>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUESTIONS.map((q, i) => (
            <ScrollReveal key={q} direction="up" delay={i * 70}>
              <li className="glass-royal-card rounded-2xl p-5 border border-[#B48A28]/20 dark:border-[#D4AF37]/20 flex gap-4 items-start list-none">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#DDD6FE]/60 dark:bg-[#1E2761]/80 font-serif font-black">{i + 1}</span>
                <span className="font-serif text-base font-semibold leading-snug">{q}</span>
              </li>
            </ScrollReveal>
          ))}
        </ol>
      </section>

      <section className="px-4 md:px-8 max-w-[1180px] mx-auto w-full py-8">
        <Disclaimer />
      </section>
    </div>
  );
}
