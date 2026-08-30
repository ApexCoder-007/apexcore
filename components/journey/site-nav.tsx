'use client'

import { useEffect, useState } from 'react'
import { Menu, Waypoints, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#simulation', label: 'Journey' },
  { href: '#follow', label: 'How it works' },
  { href: '#invisible', label: 'Invisible → Visible' },
]

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled ? 'glass border-b border-border' : 'border-b border-transparent',
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6"
      >
        <a
          href="#top"
          className="flex items-center gap-2 font-heading text-sm font-semibold tracking-[0.14em] uppercase"
        >
          <Waypoints className="size-5 text-primary" aria-hidden="true" />
          <span>The Journey</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#simulation"
          className="hidden items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03] md:inline-flex"
        >
          Start the journey
        </a>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-foreground md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {/* mobile menu */}
      <div
        className={cn(
          'glass overflow-hidden border-t border-border transition-[max-height] duration-300 md:hidden',
          open ? 'max-h-96' : 'max-h-0 border-transparent',
        )}
      >
        <ul className="flex flex-col gap-1 px-4 py-3">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-base text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#simulation"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-lg bg-primary px-3 py-3 text-center text-base font-medium text-primary-foreground"
            >
              Start the journey
            </a>
          </li>
        </ul>
      </div>
    </header>
  )
}
