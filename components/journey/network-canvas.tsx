'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'

export type DataMode = 'message' | 'image' | 'video'
export type Scenario = 'normal' | 'low' | 'high' | 'longer' | 'busy'

export type SimStats = {
  packetsSent: number
  nodesCrossed: number
  latency: number
  distance: number
}

export type NetworkHandle = {
  sendData: () => void
  reset: () => void
}

type Props = {
  mode: DataMode
  /** 0 - 100 */
  traffic: number
  scenario: Scenario
  /** 0..4 for the "follow the journey" highlight, or null */
  activeStage: number | null
  running: boolean
  reducedMotion: boolean
  onStats?: (stats: SimStats) => void
  className?: string
}

type NodeKind = 'device' | 'router' | 'isp' | 'global' | 'server'

type GraphNode = {
  id: number
  label: string
  short: string
  kind: NodeKind
  nx: number
  ny: number
  x: number
  y: number
  activity: number
  load: number
}

type Packet = {
  path: number[]
  seg: number
  t: number
  speed: number
  dir: 'out' | 'back'
  color: [number, number, number]
  size: number
  km: number
  trail: { x: number; y: number }[]
}

const CYAN: [number, number, number] = [86, 200, 232]
const VIOLET: [number, number, number] = [206, 120, 224]
const HOT: [number, number, number] = [250, 150, 90]

// Node graph in normalized coordinates (0..1)
const RAW_NODES: Omit<GraphNode, 'x' | 'y' | 'activity' | 'load'>[] = [
  { id: 0, label: 'Your Device', short: 'DEVICE', kind: 'device', nx: 0.07, ny: 0.5 },
  { id: 1, label: 'Wi-Fi Router', short: 'ROUTER', kind: 'router', nx: 0.2, ny: 0.5 },
  { id: 2, label: 'ISP', short: 'ISP', kind: 'isp', nx: 0.32, ny: 0.5 },
  { id: 3, label: 'Relay', short: 'NODE', kind: 'global', nx: 0.47, ny: 0.2 },
  { id: 4, label: 'Relay', short: 'NODE', kind: 'global', nx: 0.47, ny: 0.4 },
  { id: 5, label: 'Relay', short: 'NODE', kind: 'global', nx: 0.47, ny: 0.6 },
  { id: 6, label: 'Relay', short: 'NODE', kind: 'global', nx: 0.47, ny: 0.8 },
  { id: 7, label: 'Backbone', short: 'NODE', kind: 'global', nx: 0.65, ny: 0.3 },
  { id: 8, label: 'Backbone', short: 'NODE', kind: 'global', nx: 0.65, ny: 0.52 },
  { id: 9, label: 'Backbone', short: 'NODE', kind: 'global', nx: 0.65, ny: 0.72 },
  { id: 10, label: 'Destination Server', short: 'SERVER', kind: 'server', nx: 0.92, ny: 0.5 },
]

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [2, 4],
  [2, 5],
  [2, 6],
  [3, 7],
  [3, 8],
  [4, 7],
  [4, 8],
  [5, 8],
  [5, 9],
  [6, 8],
  [6, 9],
  [7, 8],
  [8, 9],
  [7, 10],
  [8, 10],
  [9, 10],
]

// adjacency lookups used to build packet routes
const A_NODES = [3, 4, 5, 6]
const A_TO_B: Record<number, number[]> = {
  3: [7, 8],
  4: [7, 8],
  5: [8, 9],
  6: [8, 9],
}
const B_TO_B: Record<number, number[]> = {
  7: [8],
  8: [7, 9],
  9: [8],
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const NetworkCanvas = forwardRef<NetworkHandle, Props>(function NetworkCanvas(
  {
    mode,
    traffic,
    scenario,
    activeStage,
    running,
    reducedMotion,
    onStats,
    className,
  },
  ref,
) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // live prop mirrors so the animation loop always reads fresh values
  const propsRef = useRef({ mode, traffic, scenario, activeStage, running, reducedMotion })
  propsRef.current = { mode, traffic, scenario, activeStage, running, reducedMotion }

  const onStatsRef = useRef(onStats)
  onStatsRef.current = onStats

  const nodesRef = useRef<GraphNode[]>(
    RAW_NODES.map((n) => ({ ...n, x: 0, y: 0, activity: 0, load: 0 })),
  )
  const packetsRef = useRef<Packet[]>([])
  const statsRef = useRef<SimStats>({
    packetsSent: 0,
    nodesCrossed: 0,
    latency: 24,
    distance: 0,
  })
  const serverPulseRef = useRef(0)
  const hoverRef = useRef<number | null>(null)
  const sizeRef = useRef({ w: 0, h: 0 })

  // build a route according to current scenario
  const buildPath = (): { path: number[]; km: number } => {
    const busyId = propsRef.current.scenario === 'busy' ? 4 : -1
    let aChoices = A_NODES.filter((id) => id !== busyId)
    if (aChoices.length === 0) aChoices = A_NODES
    const a = pick(aChoices)
    const b = pick(A_TO_B[a])
    let path: number[]
    if (propsRef.current.scenario === 'longer') {
      const b2 = pick(B_TO_B[b])
      path = [0, 1, 2, a, b, b2, 10]
    } else {
      path = [0, 1, 2, a, b, 10]
    }
    // simulated distance in km, scaled by number of hops
    const km = 480 + path.length * (620 + Math.random() * 380)
    return { path, km }
  }

  const spawnPacket = (dir: 'out' | 'back', path: number[], km: number) => {
    if (packetsRef.current.length > 320) return
    const t = propsRef.current.traffic / 100
    const congest = propsRef.current.scenario === 'high' ? 0.5 : 0
    // base speed, slowed by traffic + congestion
    const speed = (0.34 - t * 0.13 - congest * 0.08) * (0.85 + Math.random() * 0.3)
    packetsRef.current.push({
      path,
      seg: 0,
      t: 0,
      speed: Math.max(0.12, speed),
      dir,
      color: dir === 'out' ? CYAN : VIOLET,
      size: 1.8 + Math.random() * 1.4,
      km,
      trail: [],
    })
    if (dir === 'out') statsRef.current.packetsSent += 1
  }

  const sendBurst = (count: number) => {
    for (let i = 0; i < count; i++) {
      const { path, km } = buildPath()
      // stagger via negative t offset simulated by delay through small speed variance
      const p = packetsRef.current
      window.setTimeout(
        () => {
          if (!propsRef.current.running) return
          spawnPacket('out', path, km)
        },
        i * 55,
      )
      void p
    }
  }

  const modeBurstCount = (m: DataMode) =>
    m === 'message' ? 6 : m === 'image' ? 26 : 14

  useImperativeHandle(ref, () => ({
    sendData: () => sendBurst(modeBurstCount(propsRef.current.mode)),
    reset: () => {
      packetsRef.current = []
      statsRef.current = { packetsSent: 0, nodesCrossed: 0, latency: 24, distance: 0 }
      onStatsRef.current?.({ ...statsRef.current })
    },
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const layout = () => {
      const rect = wrap.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      sizeRef.current = { w, h }
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const padX = w * 0.02
      const padY = h * 0.08
      for (const n of nodesRef.current) {
        n.x = padX + n.nx * (w - padX * 2)
        n.y = padY + n.ny * (h - padY * 2)
      }
    }
    layout()

    const ro = new ResizeObserver(layout)
    ro.observe(wrap)

    // pointer interaction
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      let found: number | null = null
      let best = 26
      for (const n of nodesRef.current) {
        const d = Math.hypot(n.x - mx, n.y - my)
        if (d < best) {
          best = d
          found = n.id
        }
      }
      hoverRef.current = found
      canvas.style.cursor = found !== null ? 'pointer' : 'default'
    }
    const onLeave = () => {
      hoverRef.current = null
      canvas.style.cursor = 'default'
    }
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)

    const nodeColor = (n: GraphNode): [number, number, number] => {
      if (propsRef.current.scenario === 'busy' && n.id === 4) return HOT
      if (n.kind === 'server') return VIOLET
      return CYAN
    }

    const stageNodes = (stage: number | null): number[] => {
      if (stage === null) return []
      if (stage === 0) return [0]
      if (stage === 1) return [1]
      if (stage === 2) return [2]
      if (stage === 3) return [3, 4, 5, 6, 7, 8, 9]
      if (stage === 4) return [10]
      return []
    }

    let raf = 0
    let last = performance.now()
    let statsClock = 0
    let ambientClock = 0
    let smoothLatency = 24

    const nodeById = (id: number) => nodesRef.current[id]

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const P = propsRef.current
      const { w, h } = sizeRef.current
      const reduced = P.reducedMotion
      const speedScale = Math.min(w, 900) / 900 // packets move relative to size
      const nodes = nodesRef.current

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(dpr, dpr)

      // ambient background spawns based on traffic
      const t = P.traffic / 100
      if (P.running && !reduced) {
        ambientClock += dt
        const streamBonus = P.mode === 'video' ? 0.22 : 0
        const interval = Math.max(0.05, 0.5 - t * 0.42 - streamBonus)
        while (ambientClock > interval) {
          ambientClock -= interval
          const { path, km } = buildPath()
          spawnPacket('out', path, km)
        }
      }

      // highlight stage nodes
      const hs = stageNodes(P.activeStage)

      // ---- edges ----
      for (const [aI, bI] of EDGES) {
        const a = nodeById(aI)
        const b = nodeById(bI)
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        const highlighted = hs.includes(aI) && hs.includes(bI)
        ctx.strokeStyle = highlighted
          ? 'rgba(86,200,232,0.35)'
          : `rgba(130,165,205,${0.1 + t * 0.06})`
        ctx.lineWidth = highlighted ? 1.6 : 1
        ctx.stroke()
      }

      // ---- packets ----
      const packets = packetsRef.current
      let nextPackets: Packet[] = []
      for (const p of packets) {
        const from = nodeById(p.path[p.seg])
        const to = nodeById(p.path[p.seg + 1])
        if (!to) continue
        const segLen = Math.hypot(to.x - from.x, to.y - from.y) || 1
        // essential motion is kept even under reduced motion, but sped up so
        // packets never linger; decorative trails/pulses/ambient are disabled.
        const advance =
          ((p.speed * speedScale * 220) / segLen) * (reduced ? dt * 1.8 : dt)
        p.t += advance
        while (p.t >= 1) {
          p.t -= 1
          p.seg += 1
          const arrived = nodeById(p.path[p.seg])
          if (arrived) {
            arrived.activity = Math.min(1, arrived.activity + 0.6)
            arrived.load = Math.min(1, arrived.load + 0.15)
            statsRef.current.nodesCrossed += 1
          }
          if (p.seg >= p.path.length - 1) {
            // reached final node of this leg
            if (p.dir === 'out') {
              serverPulseRef.current = 1
              const back = [...p.path].reverse()
              spawnPacket('back', back, p.km)
            } else {
              statsRef.current.distance += p.km // total simulated km travelled
            }
            p.seg = -1
            break
          }
        }
        if (p.seg === -1) continue

        const cf = nodeById(p.path[p.seg])
        const ct = nodeById(p.path[p.seg + 1])
        if (!ct) continue
        const x = cf.x + (ct.x - cf.x) * p.t
        const y = cf.y + (ct.y - cf.y) * p.t

        if (!reduced) {
          p.trail.unshift({ x, y })
          if (p.trail.length > 6) p.trail.pop()
        }

        const [r, g, bl] = p.color
        // trail
        for (let i = p.trail.length - 1; i >= 0; i--) {
          const pt = p.trail[i]
          const alpha = (1 - i / p.trail.length) * 0.28
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, p.size * (1 - i / p.trail.length), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r},${g},${bl},${alpha})`
          ctx.fill()
        }
        // glow head
        ctx.beginPath()
        ctx.arc(x, y, p.size + 3.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${bl},0.18)`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${Math.min(r + 60, 255)},${Math.min(g + 40, 255)},${Math.min(bl + 20, 255)},0.95)`
        ctx.fill()

        nextPackets.push(p)
      }
      packetsRef.current = nextPackets

      // ---- nodes ----
      for (const n of nodes) {
        n.activity = Math.max(0, n.activity - dt * 1.6)
        n.load = Math.max(0, n.load - dt * 0.4)
        if (hs.includes(n.id) && !reduced) {
          n.activity = Math.max(n.activity, 0.6 + Math.sin(now / 200) * 0.25)
        }
        const [r, g, b] = nodeColor(n)
        const isBig = n.kind === 'device' || n.kind === 'server'
        const baseR = isBig ? 9 : n.kind === 'global' ? 4.5 : 6
        const hovered = hoverRef.current === n.id
        const glow = 0.25 + n.activity * 0.6 + (hovered ? 0.3 : 0)

        // outer glow
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, baseR + 22)
        grd.addColorStop(0, `rgba(${r},${g},${b},${0.28 + n.activity * 0.4})`)
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(n.x, n.y, baseR + 22, 0, Math.PI * 2)
        ctx.fill()

        // ring
        ctx.beginPath()
        ctx.arc(n.x, n.y, baseR + 3, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${r},${g},${b},${glow})`
        ctx.lineWidth = 1.4
        ctx.stroke()

        // core
        ctx.beginPath()
        ctx.arc(n.x, n.y, baseR, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},0.95)`
        ctx.fill()

        // server pulse ring
        if (n.kind === 'server' && serverPulseRef.current > 0 && !reduced) {
          const pr = 1 - serverPulseRef.current
          ctx.beginPath()
          ctx.arc(n.x, n.y, baseR + pr * 42, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${r},${g},${b},${serverPulseRef.current * 0.6})`
          ctx.lineWidth = 2
          ctx.stroke()
        }

        // labels for anchor nodes + hovered
        const showLabel = isBig || n.kind === 'router' || n.kind === 'isp' || hovered
        if (showLabel) {
          ctx.font =
            '600 11px Inter, ui-sans-serif, system-ui, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillStyle = hovered
            ? `rgba(${r},${g},${b},1)`
            : 'rgba(226,232,240,0.72)'
          const ly = n.y + baseR + 18
          ctx.fillText(hovered ? n.label : n.short, n.x, ly)
        }
      }

      if (serverPulseRef.current > 0) {
        serverPulseRef.current = Math.max(0, serverPulseRef.current - dt * 1.2)
      }

      ctx.restore()

      // ---- stats reporting ----
      statsClock += dt
      const targetLatency =
        18 +
        t * 90 +
        (P.scenario === 'high' ? 55 : 0) +
        (P.scenario === 'longer' ? 35 : 0) +
        (P.scenario === 'busy' ? 28 : 0) +
        (P.scenario === 'low' ? -8 : 0) +
        Math.sin(now / 700) * 6
      smoothLatency += (Math.max(6, targetLatency) - smoothLatency) * Math.min(1, dt * 3)
      statsRef.current.latency = smoothLatency
      if (statsClock > 0.12) {
        statsClock = 0
        onStatsRef.current?.({
          packetsSent: statsRef.current.packetsSent,
          nodesCrossed: statsRef.current.nodesCrossed,
          latency: Math.round(smoothLatency),
          distance: statsRef.current.distance,
        })
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
})

export default NetworkCanvas
