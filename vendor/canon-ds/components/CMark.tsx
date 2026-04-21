import type { CSSProperties } from 'react'

export type CMarkVariant = 'default' | 'inverse' | 'onBrand'

/**
 * CMark — companion serif "C" mark for favicons, avatars, and any context
 * where the full wordmark would render below 14px or won't fit.
 *
 * Same serif as the wordmark, single character, centered in a square tile.
 */
export interface CMarkProps {
  size?: number
  variant?: CMarkVariant
  /** Show the tile background. If false, the glyph sits transparent. */
  tile?: boolean
  style?: CSSProperties
}

export function CMark({ size = 64, variant = 'default', tile = true, style }: CMarkProps) {
  const bg =
    variant === 'inverse' ? 'var(--canon-navy)' :
    variant === 'onBrand' ? 'var(--canon-cream-brand)' :
    'var(--canon-cream-brand)'

  const fg =
    variant === 'inverse' ? 'var(--canon-cream-brand)' :
    variant === 'onBrand' ? 'var(--canon-navy)' :
    'var(--canon-navy)'

  return (
    <span
      aria-label="Canon"
      role="img"
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: tile ? bg : 'transparent',
        borderRadius: Math.max(2, Math.round(size * 0.12)),
        color: fg,
        fontFamily: 'var(--font-brand)',
        fontWeight: 400,
        /* Optical sizing — cap-height ≈ 0.72 of the tile */
        fontSize: Math.round(size * 0.72),
        lineHeight: 1,
        flexShrink: 0,
        ...style,
      }}
    >
      C
    </span>
  )
}
