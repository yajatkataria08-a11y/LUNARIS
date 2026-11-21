"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft, Copy, CheckCircle2 } from "lucide-react";
import { sfx } from "@/lib/audio-sfx";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function CitationsPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // These references are the standard literature on lunar pits, skylights and lava-tube stability.
  // They were written from memory, not checked against publisher records: verify volume/page numbers before citing.
  const bibtexEntries = [
    {
      id: "haruyama2009",
      title: "Possible lunar lava tube skylight (Marius Hills hole)",
      role: "First report of a pit in Marius Hills consistent with a lava-tube skylight, from SELENE (Kaguya) cameras.",
      bibtex: `@article{haruyama2009,
  title={Possible lunar lava tube skylight observed by {SELENE} cameras},
  author={Haruyama, Junichi and Hioki, Kazuyuki and Shirao, Motomaro and others},
  journal={Geophysical Research Letters},
  volume={36},
  pages={L21206},
  year={2009}
}`,
    },
    {
      id: "robinson2012",
      title: "Confirmation of sublunarean voids in mare deposits",
      role: "LRO imaging evidence that mare pits open into sub-surface voids.",
      bibtex: `@article{robinson2012,
  title={Confirmation of sublunarean voids and thin layering in mare deposits},
  author={Robinson, Mark S. and Ashley, James W. and Boyd, Aaron K. and others},
  journal={Planetary and Space Science},
  volume={69},
  pages={18--27},
  year={2012}
}`,
    },
    {
      id: "wagner2014",
      title: "Occurrence and origin of lunar pits",
      role: "Catalogue of lunar pits and discussion of how they form.",
      bibtex: `@article{wagner2014,
  title={Occurrence and origin of lunar pits: Observations from a new catalog},
  author={Wagner, Robert V. and Robinson, Mark S.},
  journal={Icarus},
  volume={237},
  pages={52--60},
  year={2014}
}`,
    },
    {
      id: "kaku2017",
      title: "Intact lava tubes at Marius Hills from radar sounding",
      role: "Radar-sounder evidence for intact sub-surface tubes. The type of evidence behind Task 1's radar signal.",
      bibtex: `@article{kaku2017,
  title={Detection of intact lava tubes at Marius Hills on the Moon by {SELENE} ({Kaguya}) Lunar Radar Sounder},
  author={Kaku, Takao and Haruyama, Junichi and Miyake, Wataru and others},
  journal={Geophysical Research Letters},
  volume={44},
  pages={10155--10161},
  year={2017}
}`,
    },
    {
      id: "blair2017",
      title: "Structural stability of lunar lava tubes",
      role: "Models how large a lunar lava tube can be before its roof is likely to collapse. Background for Task 2's roof-stability reasoning.",
      bibtex: `@article{blair2017,
  title={Structural stability of lunar lava tubes},
  author={Blair, David M. and Chappaz, Loic and Sood, Rohan and others},
  journal={Icarus},
  volume={282},
  pages={47--55},
  year={2017}
}`,
    },
    {
      id: "sauro2020",
      title: "Lava tubes on Earth, Moon and Mars",
      role: "Review of lava-tube size and morphology across worlds by comparative planetology.",
      bibtex: `@article{sauro2020,
  title={Lava tubes on Earth, Moon and Mars: A review on their size and morphology revealed by comparative planetology},
  author={Sauro, Francesco and Pozzobon, Riccardo and Massironi, Matteo and others},
  journal={Earth-Science Reviews},
  volume={209},
  pages={103288},
  year={2020}
}`,
    },
  ];

  const copyToClipboard = (id: string, text: string) => {
    sfx.playClick(1100);
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="cosmic-void-canvas min-h-screen text-foreground flex flex-col font-sans relative">
      <main className="p-4 md:px-8 max-w-4xl mx-auto w-full py-12 space-y-8">
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-[#94A3B8] hover:text-[#B48A28] dark:hover:text-[#D4AF37] transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>RETURN HOME</span>
        </Link>

        <ScrollReveal direction="down" duration={600}>
        <div className="space-y-2 border-b border-slate-300 dark:border-slate-800 pb-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#B48A28] dark:text-[#D4AF37]">
            <BookOpen className="size-4" /> REFERENCES
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#1E1B4B] dark:text-[#F8FAFC]">
            References &amp; Background Reading
          </h1>
          <p className="text-xs font-mono text-slate-500 dark:text-[#94A3B8]">
            Key literature on lunar pits, skylights and lava-tube stability. Entries were written from memory: verify against the publisher record before citing.
          </p>
        </div>
        </ScrollReveal>

        <div className="space-y-6">
          {bibtexEntries.map((entry) => (
            <div
              key={entry.id}
              className="glass-royal-deck rounded-2xl p-6 border border-amber-600/20 dark:border-amber-400/20 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#1E1B4B] dark:text-[#F8FAFC]">
                    {entry.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-0.5">{entry.role}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(entry.id, entry.bibtex)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-[#070912]/60 hover:border-[#B48A28] dark:hover:border-[#D4AF37] text-xs font-mono text-slate-700 dark:text-[#CBD5E1] transition-all"
                >
                  {copiedKey === entry.id ? (
                    <>
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copy BibTeX</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-100/90 dark:bg-[#070912]/90 border border-slate-300 dark:border-slate-800 font-mono text-xs text-[#1E1B4B] dark:text-[#A5F3FC] overflow-x-auto">
                {entry.bibtex}
              </pre>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

