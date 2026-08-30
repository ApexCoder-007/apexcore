export function SiteFooter() {
  const links = [
    { label: "About", href: "#about" },
    { label: "Journey", href: "#follow" },
    { label: "Simulation", href: "#simulation" },
    { label: "How it works", href: "#invisible" },
  ]

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-sans text-lg font-bold tracking-tight">
            THE JOURNEY
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Making the invisible visible.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="rounded text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border/40">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-muted-foreground/70 sm:px-8">
          An interactive visualization for educational purposes. All statistics
          are simulated and do not represent real network traffic.
        </p>
      </div>
    </footer>
  )
}
