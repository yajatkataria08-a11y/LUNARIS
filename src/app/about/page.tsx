import React from "react";
import Link from "next/link";
import { Flame, Snowflake, Waves, Mountain, ArrowRight, Check, X as XIcon } from "lucide-react";
import { Disclaimer } from "@/components/ui/Disclaimer";

export const metadata = { title: "What are lunar lava tubes? // Lunar Lava Tube Assessment" };

const FORMATION = [
  { icon: Flame, title: "1. Volcanic eruptions", body: "Millions or billions of years ago the Moon was volcanically active. Molten lava flowed across its surface." },
  { icon: Snowflake, title: "2. The crust forms", body: "The outer layer of the flow cooled and hardened, while lava kept flowing underneath it." },
  { icon: Waves, title: "3. The lava drains", body: "Eventually the lava drained away, leaving the hardened crust standing as a roof." },
  { icon: Mountain, title: "4. A hollow tunnel remains", body: "The result is a long, hollow tunnel under the surface: a naturally formed underground cave." },
];

const HAZARDS = [
  "Radiation from the Sun and cosmic rays",
  "Extreme temperature fluctuations",
  "Micrometeorite impacts",
  "No breathable atmosphere",
  "Very difficult conditions for long-term human habitation",
];

const COMPARE = [
  ["Exposed to radiation", "Potentially shielded by rock"],
  ["Exposed to micrometeorites", "Naturally protected"],
  ["Extreme temperature variations", "Potentially more stable temperatures"],
  ["Requires extensive protective construction", "Natural geological structure may reduce construction requirements"],
];

const TASKS = [
  { n: 1, title: "Detect potential lava tubes", body: "Analyse satellite images and radar data to identify possible underground tunnels and their entrances." },
  { n: 2, title: "Analyse skylights and roof stability", body: "Identify openings, cracks, geological structures and potential collapse risks." },
  { n: 3, title: "Recommend potential habitat locations", body: "Combine geological and structural information to rank locations according to their suitability for future lunar habitats." },
];

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <div>
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#B48A28] dark:text-[#D4AF37]">{eyebrow}</div>
        <h2 className="font-serif text-2xl sm:text-3xl font-black mt-1">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="cosmic-void-canvas min-h-screen text-foreground font-sans">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 space-y-14">
        <header className="space-y-4">
          <div className="text-[10px] font-mono font-bold inline-block px-2.5 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-[#B48A28] dark:text-[#D4AF37]">UNDERSTAND THE PROBLEM</div>
          <h1 className="font-serif text-4xl sm:text-5xl font-black leading-tight">What are lunar lava tubes?</h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
            Underground tunnels left behind by ancient volcanic activity: think of them as naturally formed underground caves on the Moon.
          </p>
        </header>

        <Section eyebrow="How they form" title="From lava river to hollow tunnel">
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FORMATION.map(({ icon: Icon, title, body }) => (
              <li key={title} className="glass-royal-card rounded-2xl p-5 border border-[#B48A28]/20 dark:border-[#D4AF37]/20 flex gap-4 list-none">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6]/15 dark:bg-[#408EC6]/20">
                  <Icon className="size-5 text-[#3B82F6] dark:text-[#A5F3FC]" />
                </span>
                <div>
                  <h3 className="font-serif font-bold">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section eyebrow="Why scientists care" title="The surface is harsh. Underground may not be.">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            <div className="md:col-span-2 glass-royal-card rounded-2xl p-5 border border-rose-500/25">
              <h3 className="font-serif font-bold mb-3">Lunar surface hazards</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {HAZARDS.map((h) => (
                  <li key={h} className="flex gap-2"><XIcon className="size-4 shrink-0 mt-0.5 text-rose-500" />{h}</li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-3 glass-royal-deck rounded-2xl border border-amber-600/25 dark:border-amber-400/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th scope="col" className="px-4 py-3 font-serif font-bold">Surface habitat</th>
                      <th scope="col" className="px-4 py-3 font-serif font-bold">Underground lava tube</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE.map(([a, b]) => (
                      <tr key={a} className="border-b border-border/60 last:border-0 align-top">
                        <td className="px-4 py-3 text-muted-foreground">{a}</td>
                        <td className="px-4 py-3"><span className="flex gap-2"><Check className="size-4 shrink-0 mt-0.5 text-emerald-500" />{b}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <p className="text-sm sm:text-base leading-relaxed">
            <strong>The opportunity:</strong>{" "}
            <span className="text-muted-foreground">instead of building everything from scratch on the Moon, we could potentially use naturally existing underground structures as shelters for astronauts.</span>
          </p>
        </Section>

        <Section eyebrow="The gap" title="One major problem">
          <div className="glass-royal-deck rounded-2xl p-6 border border-amber-600/25 dark:border-amber-400/25 space-y-3">
            <p className="text-sm sm:text-base leading-relaxed">We don&rsquo;t know:</p>
            <ul className="grid sm:grid-cols-3 gap-3 text-sm">
              {["Which tunnels are intact", "How large they are", "Whether their roofs are structurally stable"].map((x) => (
                <li key={x} className="rounded-xl border border-border bg-muted/40 px-4 py-3 font-semibold">{x}</li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">That&rsquo;s where this project comes in.</p>
          </div>
        </Section>

        <Section eyebrow="What the project does" title="An AI-powered lunar exploration and habitat assessment system">
          <ol className="space-y-3">
            {TASKS.map((t) => (
              <li key={t.n} className="glass-royal-card rounded-2xl p-5 border border-[#B48A28]/20 dark:border-[#D4AF37]/20 flex gap-4 list-none">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#DDD6FE]/60 dark:bg-[#1E2761]/80 font-serif font-black">{t.n}</span>
                <div>
                  <h3 className="font-serif font-bold">Task {t.n}: {t.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">{t.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="rounded-2xl border border-border p-5">
            <h3 className="font-serif font-bold mb-2">The system tries to answer</h3>
            <ol className="list-decimal pl-5 space-y-1.5 text-sm text-muted-foreground">
              <li>Is there potentially a lava tube beneath this location?</li>
              <li>Is the entrance or skylight detectable?</li>
              <li>How stable is the surrounding roof?</li>
              <li>Is this location potentially suitable for a human habitat?</li>
            </ol>
          </div>
          <Disclaimer />
        </Section>

        <div className="flex flex-wrap gap-3 pb-4">
          <Link href="/pipelines" className="interactive-press inline-flex items-center gap-2 rounded-2xl border border-[#B48A28]/60 dark:border-[#D4AF37]/60 bg-gradient-to-r from-[#1E1B4B] via-[#2E4A9E] to-[#4F46E5] text-white font-serif text-sm font-bold tracking-wider px-6 py-3">
            TRY THE CONSOLE <ArrowRight className="size-4" />
          </Link>
          <Link href="/ranking" className="interactive-press inline-flex items-center gap-2 rounded-2xl border border-border font-serif text-sm font-bold tracking-wider px-6 py-3">
            SEE THE RANKING
          </Link>
          <Link href="/citations" className="interactive-press inline-flex items-center gap-2 rounded-2xl border border-border font-serif text-sm font-bold tracking-wider px-6 py-3">
            REFERENCES
          </Link>
        </div>
      </div>
    </div>
  );
}
