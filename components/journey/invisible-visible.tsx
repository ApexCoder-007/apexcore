import { ArrowRight } from 'lucide-react'
import { Eyebrow, Reveal } from '@/components/journey/ui'

const PAIRS: [string, string][] = [
  ['Digital information', 'Moving data'],
  ['Bits & signals', 'Animated packets'],
  ['Routing decisions', 'Network paths'],
  ['Invisible nodes', 'Glowing nodes'],
  ['Network traffic', 'Traffic levels'],
  ['Latency', 'Simulated statistics'],
]

export default function InvisibleVisible() {
  return (
    <section
      id="invisible"
      aria-labelledby="invisible-title"
      className="relative mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28"
    >
      <Reveal className="mx-auto max-w-3xl text-center">
        <div className="flex justify-center">
          <Eyebrow>The core idea</Eyebrow>
        </div>
        <h2
          id="invisible-title"
          className="mt-5 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
        >
          From invisible to visible
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground leading-relaxed">
          The challenge: make an unseen phenomenon perceptible. Every abstract
          concept on the left becomes something you can watch on the right.
        </p>
      </Reveal>

      <div className="mt-14 space-y-3">
        {/* column headers */}
        <div className="flex items-center gap-3 px-1 sm:gap-6">
          <span className="flex-1 font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">
            Invisible
          </span>
          <span className="w-4 sm:w-5" aria-hidden="true" />
          <span className="flex-1 font-mono text-xs tracking-[0.2em] uppercase text-primary">
            Visible
          </span>
        </div>

        {PAIRS.map(([inv, vis], i) => (
          <Reveal
            key={inv}
            delay={i * 70}
            className="flex items-stretch gap-3 sm:gap-6"
          >
            <div className="flex flex-1 items-center rounded-xl border border-dashed border-border/70 bg-secondary/30 px-3 py-4 text-sm text-muted-foreground sm:px-5 sm:text-base">
              {inv}
            </div>
            <div className="flex items-center justify-center text-primary/70">
              <ArrowRight className="size-4 sm:size-5" aria-hidden="true" />
            </div>
            <div className="flex flex-1 items-center rounded-xl border border-primary/40 bg-primary/[0.07] px-3 py-4 text-sm font-medium text-foreground shadow-[0_0_30px_-12px_color-mix(in_oklab,var(--cyan)_60%,transparent)] sm:px-5 sm:text-base">
              {vis}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
