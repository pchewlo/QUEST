import type { CSSProperties, ElementType } from 'react'

export type WordmarkSize  = 'xl' | 'lg' | 'md' | 'sm'
export type WordmarkColor = 'navy' | 'green' | 'graphite' | 'inverse'

/**
 * CanonWordmark — the canonical brand mark.
 *
 * Small-caps serif with wide letter-spacing. Institutional, not a tech logo.
 * Letter-spacing widens as size shrinks to preserve optical balance —
 * do not interpolate sizes; pick one of the approved scale steps.
 *
 * Source of truth: /brand/logo spec (v1).
 */
export interface CanonWordmarkProps {
  size?: WordmarkSize
  color?: WordmarkColor
  as?: ElementType
  className?: string
  style?: CSSProperties
}

const sizeMap: Record<WordmarkSize, { font: number; tracking: string }> = {
  xl: { font: 56, tracking: 'var(--canon-tracking-xl)' },
  lg: { font: 36, tracking: 'var(--canon-tracking-lg)' },
  md: { font: 22, tracking: 'var(--canon-tracking-md)' },
  sm: { font: 14, tracking: 'var(--canon-tracking-sm)' },
}

const colorMap: Record<WordmarkColor, string> = {
  navy:     'var(--canon-navy)',
  green:    'var(--canon-green)',
  graphite: 'var(--canon-graphite)',
  inverse:  'var(--canon-cream-brand)',
}

export function CanonWordmark({
  size = 'lg',
  color = 'navy',
  as: Tag = 'span',
  className,
  style,
}: CanonWordmarkProps) {
  const { font, tracking } = sizeMap[size]
  return (
    <Tag
      className={className}
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-brand)',
        fontWeight: 400,
        fontSize: font,
        lineHeight: 1,
        textTransform: 'uppercase',
        letterSpacing: tracking,
        /* Compensates for the trailing tracking so the wordmark centers optically */
        paddingLeft: tracking,
        color: colorMap[color],
        ...style,
      }}
    >
      Canon
    </Tag>
  )
}
