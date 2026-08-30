'use client'

import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-reveal'

type Node = { x: number; y: number; vx: number; vy: number; r: number }
type Spark = { a: number; b: number; t: number; speed: number }

/**
 * Abstract constellation network used behind the hero. Nodes drift slowly,
 * near nodes are linked, and occasional data sparks travel along links.
 * Pauses when offscreen and respects reduced motion.
 */
export default function HeroNetwork({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let nodes: Node[] = []
    let sparks: Spark[] = []
    const LINK_DIST = 150

    const build = () => {
      const rect = wrap.getBoundingClientRect()
      w = rect.width
      h = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const count = Math.min(64, Math.max(26, Math.round((w * h) / 26000)))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 0.8 + Math.random() * 1.8,
      }))
      sparks = []
    }
    build()

    const ro = new ResizeObserver(build)
    ro.observe(wrap)

    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(wrap)

    let raf = 0
    let last = performance.now()
    let sparkClock = 0

    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      raf = requestAnimationFrame(render)
      if (!visible) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(dpr, dpr)

      const still = reducedRef.current
      if (!still) {
        for (const n of nodes) {
          n.x += n.vx
          n.y += n.vy
          if (n.x < 0 || n.x > w) n.vx *= -1
          if (n.y < 0 || n.y > h) n.vy *= -1
        }
      }

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * 0.18
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(120,170,210,${alpha})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      // sparks travelling along random near links
      if (!still) {
        sparkClock += dt
        if (sparkClock > 0.5 && sparks.length < 18) {
          sparkClock = 0
          const a = Math.floor(Math.random() * nodes.length)
          // find a nearby node
          let b = -1
          for (let k = 0; k < nodes.length; k++) {
            if (k === a) continue
            if (Math.hypot(nodes[a].x - nodes[k].x, nodes[a].y - nodes[k].y) < LINK_DIST) {
              b = k
              break
            }
          }
          if (b >= 0) sparks.push({ a, b, t: 0, speed: 0.6 + Math.random() * 0.7 })
        }
        sparks = sparks.filter((s) => {
          s.t += s.speed * dt
          if (s.t >= 1) return false
          const a = nodes[s.a]
          const b = nodes[s.b]
          const x = a.x + (b.x - a.x) * s.t
          const y = a.y + (b.y - a.y) * s.t
          ctx.beginPath()
          ctx.arc(x, y, 2.2, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(120,220,240,0.9)'
          ctx.fill()
          ctx.beginPath()
          ctx.arc(x, y, 5, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(120,220,240,0.15)'
          ctx.fill()
          return true
        })
      }

      // nodes
      for (const n of nodes) {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(150,200,225,0.55)'
        ctx.fill()
      }

      ctx.restore()
    }
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
