'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useReveal } from '@/hooks/use-reveal'

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'li' | 'section' | 'article'
}) {
  const { ref, visible } = useReveal<HTMLElement>()
  return (
    <Tag
      ref={ref as never}
      className={cn('reveal', visible && 'is-visible', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-mono text-xs font-medium tracking-[0.25em] text-primary/90 uppercase',
        className,
      )}
    >
      <span className="h-px w-6 bg-primary/50" aria-hidden="true" />
      {children}
    </span>
  )
}
