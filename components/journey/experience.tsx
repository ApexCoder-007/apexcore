'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  Activity,
  Gauge,
  ImageIcon,
  MessageSquare,
  Radio,
  RotateCcw,
  Ruler,
  Send,
  Video,
  Waypoints,
} from 'lucide-react'
import NetworkCanvas, {
  type DataMode,
  type NetworkHandle,
  type Scenario,
  type SimStats,
} from '@/components/journey/network-canvas'
import { Eyebrow } from '@/components/journey/ui'
import { usePrefersReducedMotion } from '@/hooks/use-reveal'
import { cn } from '@/lib/utils'

const MODES: {
  id: DataMode
  label: string
  icon: typeof MessageSquare
  hint: string
}[] = [
  { id: 'message', label: 'Message', icon: MessageSquare, hint: 'A few quick packets' },
  { id: 'image', label: 'Image', icon: ImageIcon, hint: 'Many packets at once' },
  { id: 'video', label: 'Video', icon: Video, hint: 'A continuous stream' },
]

const SCENARIOS: { id: Scenario; label: string; desc: string }[] = [
  { id: 'normal', label: 'Balanced', desc: 'A calm, typical network' },
  { id: 'low', label: 'Low traffic', desc: 'Fast, near-empty routes' },
  { id: 'high', label: 'High traffic', desc: 'Congested, higher latency' },
  { id: 'longer', label: 'Longer route', desc: 'Packets cross more nodes' },
  { id: 'busy', label: 'Busy node', desc: 'Traffic reroutes around it' },
]

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin: '120px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return { ref, inView }
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: typeof Activity
  label: string
  value: string
  unit?: string
}) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl border border-border p-4 sm:p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 text-primary" aria-hidden="true" />
        <span className="font-mono text-[0.65rem] tracking-[0.18em] uppercase">
          {label}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1 font-heading">
        <span className="text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
          {value}
        </span>
        {unit ? (
          <span className="text-sm font-medium text-muted-foreground">{unit}</span>
        ) : null}
      </div>
    </div>
  )
}

export default function Experience() {
  const netRef = useRef<NetworkHandle>(null)
  const reduced = usePrefersReducedMotion()
  const { ref: sectionRef, inView } = useInView<HTMLElement>()

  const [mode, setMode] = useState<DataMode>('message')
  const [traffic, setTraffic] = useState(28)
  const [scenario, setScenario] = useState<Scenario>('normal')
  const [stats, setStats] = useState<SimStats>({
    packetsSent: 0,
    nodesCrossed: 0,
    latency: 24,
    distance: 0,
  })
  const [sending, setSending] = useState(false)
  const firedRef = useRef(false)

  const onStats = useCallback((s: SimStats) => setStats(s), [])

  const handleSend = useCallback(() => {
    netRef.current?.sendData()
    setSending(true)
    window.setTimeout(() => setSending(false), 1400)
  }, [])

  const handleReset = useCallback(() => {
    netRef.current?.reset()
  }, [])

  // First automatic burst when the simulation scrolls into view
  useEffect(() => {
    if (inView && !firedRef.current) {
      firedRef.current = true
      const id = window.setTimeout(() => netRef.current?.sendData(), 500)
      return () => window.clearTimeout(id)
    }
  }, [inView])

  // Respond to hero / final-cta triggers
  useEffect(() => {
    const onExternalSend = () => {
      netRef.current?.reset()
      window.setTimeout(() => handleSend(), 350)
    }
    window.addEventListener('journey:send', onExternalSend)
    return () => window.removeEventListener('journey:send', onExternalSend)
  }, [handleSend])

  const fmt = (n: number) => Math.round(n).toLocaleString('en-US')
  const distanceDisplay =
    stats.distance >= 1_000_000
      ? `${(stats.distance / 1_000_000).toFixed(2)}M`
      : fmt(stats.distance)

  return (
    <section
      id="simulation"
      ref={sectionRef}
      aria-labelledby="simulation-title"
      className="relative mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28"
    >
      <header className="mx-auto max-w-3xl text-center">
        <div className="flex justify-center">
          <Eyebrow>The Interactive Experience</Eyebrow>
        </div>
        <h2
          id="simulation-title"
          className="mt-5 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
        >
          Watch your data cross the network
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground leading-relaxed">
          Press <span className="text-foreground">Send data</span> and follow the
          packets as they leave your device, hop through routers and the global
          backbone, reach the server, and return. Every value here is a{' '}
          <span className="text-foreground">simulated visualization</span>, not your
          real traffic.
        </p>
      </header>

      {/* Canvas */}
      <div className="relative mt-12">
        <div className="glass relative overflow-hidden rounded-3xl border border-border">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/5 to-transparent" />

          {/* live badge */}
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 backdrop-blur">
            <span className="relative flex size-2">
              <span
                className={cn(
                  'absolute inline-flex size-2 rounded-full bg-primary opacity-75',
                  !reduced && 'animate-ping',
                )}
              />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground">
              Simulation live
            </span>
          </div>

          {/* mode label */}
          <div className="absolute right-4 top-4 z-10 rounded-full border border-border bg-background/60 px-3 py-1.5 font-mono text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground backdrop-blur">
            {mode} mode
          </div>

          <NetworkCanvas
            ref={netRef}
            mode={mode}
            traffic={traffic}
            scenario={scenario}
            activeStage={null}
            running={inView}
            reducedMotion={reduced}
            onStats={onStats}
            className="h-[300px] w-full sm:h-[420px] md:h-[500px]"
          />

          {/* node legend */}
          <div className="pointer-events-none absolute bottom-4 left-4 z-10 hidden items-center gap-4 font-mono text-[0.6rem] tracking-wide text-muted-foreground sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" /> Outgoing
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-accent" /> Returning
            </span>
          </div>
        </div>
      </div>

      {/* Primary controls */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-stretch">
        {/* mode segmented */}
        <div
          role="group"
          aria-label="Data type"
          className="glass flex flex-1 gap-1.5 rounded-2xl border border-border p-1.5"
        >
          {MODES.map((m) => {
            const active = mode === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                aria-pressed={active}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-3 py-3 text-center transition-colors sm:flex-row sm:gap-2',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <m.icon className="size-4" aria-hidden="true" />
                <span className="text-sm font-medium">{m.label}</span>
              </button>
            )
          })}
        </div>

        {/* send / reset */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSend}
            className={cn(
              'group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary px-8 py-4 font-heading text-base font-semibold text-primary-foreground transition-transform lg:flex-none',
              'hover:scale-[1.02] active:scale-[0.99]',
              'shadow-[0_0_0_1px_color-mix(in_oklab,var(--cyan)_40%,transparent),0_10px_40px_-10px_color-mix(in_oklab,var(--cyan)_70%,transparent)]',
            )}
          >
            <Send
              className={cn('size-5 transition-transform', sending && 'translate-x-6 opacity-0')}
              aria-hidden="true"
            />
            <span>{sending ? 'Sending…' : 'Send data'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset simulation counters"
            className="flex items-center justify-center rounded-2xl border border-border bg-secondary px-4 text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Traffic slider */}
      <div className="glass mt-4 rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="traffic"
            className="flex items-center gap-2 font-mono text-xs tracking-[0.18em] uppercase text-muted-foreground"
          >
            <Radio className="size-4 text-primary" aria-hidden="true" />
            Network traffic
          </label>
          <span className="font-heading text-sm font-semibold tabular-nums text-foreground">
            {traffic}%
          </span>
        </div>
        <input
          id="traffic"
          type="range"
          min={0}
          max={100}
          value={traffic}
          onChange={(e) => setTraffic(Number(e.target.value))}
          className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary"
          style={{ accentColor: 'var(--cyan)' }}
          aria-describedby="traffic-scale"
        />
        <div
          id="traffic-scale"
          className="mt-2 flex justify-between font-mono text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground"
        >
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* What if scenarios */}
      <div className="mt-4">
        <div className="mb-3 flex items-center gap-2 px-1">
          <span className="font-mono text-xs tracking-[0.18em] uppercase text-muted-foreground">
            What if the network changes?
          </span>
        </div>
        <div
          role="group"
          aria-label="Network scenarios"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        >
          {SCENARIOS.map((s) => {
            const active = scenario === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenario(s.id)}
                aria-pressed={active}
                className={cn(
                  'glass group rounded-2xl border p-4 text-left transition-all',
                  active
                    ? 'border-primary/60 bg-primary/10'
                    : 'border-border hover:border-primary/30',
                )}
              >
                <span
                  className={cn(
                    'font-heading text-sm font-semibold',
                    active ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {s.label}
                </span>
                <span className="mt-1 block text-xs leading-snug text-muted-foreground">
                  {s.desc}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={Activity}
          label="Packets sent"
          value={fmt(stats.packetsSent)}
        />
        <StatCard
          icon={Waypoints}
          label="Nodes crossed"
          value={fmt(stats.nodesCrossed)}
        />
        <StatCard
          icon={Gauge}
          label="Latency"
          value={fmt(stats.latency)}
          unit="ms"
        />
        <StatCard
          icon={Ruler}
          label="Distance"
          value={distanceDisplay}
          unit="km"
        />
      </div>
      <p className="mt-4 text-center font-mono text-[0.65rem] tracking-wide text-muted-foreground">
        Simulated values for visualization and education — not a measurement of
        real network traffic.
      </p>
    </section>
  )
}
