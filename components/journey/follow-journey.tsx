'use client'

import { useEffect, useRef, useState } from 'react'
import NetworkCanvas from '@/components/journey/network-canvas'
import { Eyebrow } from '@/components/journey/ui'
import { usePrefersReducedMotion } from '@/hooks/use-reveal'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    n: '01',
    title: 'Your message becomes data',
    body: 'Text, pixels and sound are all encoded as bits — long strings of ones and zeros a computer can process and store.',
  },
  {
    n: '02',
    title: 'Data becomes packets',
    body: 'That information is divided into small packets. Each carries a piece of the whole, plus an address describing where it should go.',
  },
  {
    n: '03',
    title: 'Routers find a path',
    body: 'Routers read each packet and forward it onward — choosing a route through the network toward its destination.',
  },
  {
    n: '04',
    title: 'Data crosses the network',
    body: 'Packets travel through infrastructure — cables, fibre and many intermediary devices — hopping node to node across the world.',
  },
  {
    n: '05',
    title: 'The server responds',
    body: 'The destination reassembles the packets, understands the request, and sends its own data back along the network to you.',
  },
]

export default function FollowJourney() {
  const reduced = usePrefersReducedMotion()
  const [active, setActive] = useState(0)
  const [inView, setInView] = useState(false)
  const stepRefs = useRef<(HTMLLIElement | null)[]>([])
  const canvasWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.index)
            setActive(idx)
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    for (const el of stepRefs.current) if (el) io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const el = canvasWrapRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: '100px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section
      id="follow"
      aria-labelledby="follow-title"
      className="relative mx-auto w-full max-w-7xl scroll-mt-16 px-4 py-20 sm:px-6 sm:py-28"
    >
      <header className="max-w-3xl">
        <Eyebrow>Follow the journey</Eyebrow>
        <h2
          id="follow-title"
          className="mt-5 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
        >
          Five steps, one invisible trip
        </h2>
        <p className="mt-4 max-w-xl text-pretty text-muted-foreground leading-relaxed">
          Scroll through the story. Each step lights up the part of the network
          where it happens.
        </p>
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-16">
        {/* sticky visual */}
        <div className="order-1 lg:order-2">
          <div
            ref={canvasWrapRef}
            className="glass sticky top-20 overflow-hidden rounded-3xl border border-border"
          >
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
            <NetworkCanvas
              mode="message"
              traffic={20}
              scenario="normal"
              activeStage={active}
              running={inView}
              reducedMotion={reduced}
              className="h-[240px] w-full sm:h-[320px] lg:h-[440px]"
            />
            <div className="pointer-events-none absolute bottom-3 left-4 font-mono text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground">
              Stage {STEPS[active].n}
            </div>
          </div>
        </div>

        {/* steps */}
        <ol className="order-2 space-y-4 lg:order-1">
          {STEPS.map((s, i) => {
            const isActive = active === i
            return (
              <li
                key={s.n}
                ref={(el) => {
                  stepRefs.current[i] = el
                }}
                data-index={i}
                className={cn(
                  'rounded-2xl border p-6 transition-all duration-500 sm:p-7',
                  isActive
                    ? 'glass border-primary/50 bg-primary/[0.06]'
                    : 'border-border/60 opacity-60',
                )}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={cn(
                      'font-heading text-2xl font-bold tabular-nums transition-colors sm:text-3xl',
                      isActive ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-semibold sm:text-xl">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {s.body}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
