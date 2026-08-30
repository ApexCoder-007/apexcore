"use client"

import { Reveal } from "./ui"
import { startJourney } from "@/lib/journey-actions"

export function FinalCta() {
  return (
    <section
      id="final"
      className="relative overflow-hidden py-28 sm:py-36"
      aria-labelledby="final-heading"
    >
      {/* radial glow backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, var(--cyan) 16%, transparent) 0%, transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <h2
            id="final-heading"
            className="text-balance font-sans text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          >
            The next time you click,{" "}
            <span className="text-primary">look closer.</span>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mx-auto mt-7 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            What feels instantaneous is actually a journey through a massive
            invisible network.
          </p>
        </Reveal>
        <Reveal delay={220}>
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={startJourney}
              className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-primary-foreground transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring active:scale-95"
            >
              Replay the journey
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                &rarr;
              </span>
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
