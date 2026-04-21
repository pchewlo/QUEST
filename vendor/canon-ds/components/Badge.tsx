import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger'

export function Badge({
  children,
  tone = 'neutral',
  leading,
}: {
  children: ReactNode
  tone?: BadgeTone
  leading?: ReactNode
}) {
  const tones: Record<BadgeTone, { bg: string; fg: string }> = {
    neutral: { bg: 'var(--bg-surface-alt)',     fg: 'var(--text-secondary)' },
    brand:   { bg: 'var(--accent-soft)',         fg: 'var(--accent)' },
    success: { bg: 'var(--status-ready-bg)',     fg: 'var(--status-ready)' },
    warning: { bg: 'var(--status-inprogress-bg)',fg: 'var(--status-inprogress)' },
    danger:  { bg: 'var(--status-danger-bg)',    fg: 'var(--status-danger)' },
  }
  const { bg, fg } = tones[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: '2px var(--space-3)',
        borderRadius: 'var(--radius-sm)',
        background: bg,
        color: fg,
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-medium)',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {leading}
      {children}
    </span>
  )
}
