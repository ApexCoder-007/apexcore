import { Eye, Layers, Route } from 'lucide-react'
import { Eyebrow, Reveal } from '@/components/journey/ui'

const POINTS = [
  {
    icon: Layers,
    title: 'Data becomes packets',
    body: 'Whatever you send is split into tiny packets, each finding its own way.',
  },
  {
    icon: Route,
    title: 'Routes are chosen live',
    body: 'Routers pick paths across a mesh of nodes that spans the planet.',
  },
  {
    icon: Eye,
    title: 'The invisible, revealed',
    body: 'What feels instant is a measurable journey you can finally watch.',
  },
]

export default function Intro() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6"
    >
      <Reveal className="max-w-3xl">
        <Eyebrow>The invisible phenomenon</Eyebrow>
        <h2
          id="about-title"
          className="mt-5 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl"
        >
          How data travels through the internet
        </h2>
        <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
          A click feels instantaneous. In reality, your request is torn into
          packets, handed from your router to your ISP, and raced across a global
          web of machines before an answer returns — all in the blink of an eye.
          This exhibition slows that journey down so you can see it.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        {POINTS.map((p, i) => (
          <Reveal
            key={p.title}
            delay={i * 90}
            className="glass rounded-2xl border border-border p-6"
          >
            <p.icon className="size-6 text-primary" aria-hidden="true" />
            <h3 className="mt-4 font-heading text-lg font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {p.body}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
