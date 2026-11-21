"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function TermsPage() {
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
            <Scale className="size-4" /> LEGAL AGREEMENT &amp; USAGE
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#1E1B4B] dark:text-[#F8FAFC]">
            Terms of Service
          </h1>
          <p className="text-xs font-mono text-slate-500 dark:text-[#94A3B8]">
            Applicable to Academic, Industrial, and Public Researchers
          </p>
        </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={80} duration={650}>
        <div className="glass-royal-deck rounded-3xl p-6 sm:p-8 border border-amber-600/20 dark:border-amber-400/20 space-y-6 text-sm text-slate-700 dark:text-[#CBD5E1] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold text-[#1E1B4B] dark:text-[#F8FAFC]">
              1. Acceptance of Terms
            </h2>
            <p>
              By using LUNARIS and its lava-tube detection, roof-stability and habitat-ranking tools, you agree to comply with academic integrity standards and fair data attribution.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold text-[#1E1B4B] dark:text-[#F8FAFC]">
              2. Permitted Academic &amp; Research Use
            </h2>
            <p>
              You may reproduce and discuss the visual analyses in academic work provided you credit the project and the underlying data sources. Confirm the licence that applies to any bundled dataset before redistributing it.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold text-[#1E1B4B] dark:text-[#F8FAFC]">
              3. API Rate Limits &amp; Automated Crawling
            </h2>
            <p>
              Please keep automated queries to the site endpoints reasonable. Bulk scraping without prior authorization is prohibited to preserve availability.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold text-[#1E1B4B] dark:text-[#F8FAFC]">
              4. Disclaimer: No Safety Certification
            </h2>
            <p>
              All outputs are estimates inferred from remote-sensing data. The system cannot certify that a lava tube is intact or safe; that requires direct geological measurements and independent validation. Scores are not calibrated accuracy guarantees.
            </p>
          </section>
        </div>
        </ScrollReveal>
      </main>
    </div>
  );
}

