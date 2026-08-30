'use client'

import { ArrowRight, ChevronDown, MousePointerClick } from 'lucide-react'
import HeroNetwork from '@/components/journey/hero-network'
import { scrollToId, startJourney } from '@/lib/journey-actions'

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pt-16 sm:px-6"
    >
      {/* layered background */}
      <HeroNetwork className="absolute inset-0 -z-10" />
      <div className="absolute inset-0 -z-10 bg-grid opacity-40" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-radial-fade" aria-hidden="true" />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-t from-background to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <p className="reveal is-visible inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-4 py-1.5 font-mono text-[0.65rem] tracking-[0.24em] uppercase text-primary/90 backdrop-blur">
          <MousePointerClick className="size-3.5" aria-hidden="true" />
          An interactive data exhibition
        </p>

        <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl md:text-7xl">
          You clicked.
          <br />
          <span className="text-primary text-glow-cyan">The internet moved.</span>
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Every message, image and video becomes digital information travelling
          through an invisible global network. This is that journey — made visible.
        </p>

        <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={startJourney}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 font-heading text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-[0.99] sm:w-auto"
          >
            Start the journey
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={() => scrollToId('follow')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background/40 px-7 py-3.5 text-base font-medium text-foreground backdrop-blur transition-colors hover:bg-secondary sm:w-auto"
          >
            See how it works
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollToId('about')}
        aria-label="Scroll to learn more"
        className="animate-float-slow absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
      >
        <ChevronDown className="size-6" aria-hidden="true" />
      </button>
    </section>
  )
}
