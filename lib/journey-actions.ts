const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({
    behavior: prefersReduced() ? 'auto' : 'smooth',
    block: 'start',
  })
}

/** Scroll to the simulation and fire a fresh data burst. */
export function startJourney() {
  scrollToId('simulation')
  window.dispatchEvent(new CustomEvent('journey:send'))
}
