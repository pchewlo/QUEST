import { useState } from 'react'

/**
 * BrandLogo — the illustrated Millennial Saver logo.
 *
 * The actual artwork lives at /public/logo.png. If that file is missing,
 * this component falls back to a tasteful script-wordmark placeholder so
 * the layout never breaks.
 *
 * To replace:
 *   1. Drop the PNG/SVG into `public/logo.png` (or update `src` below).
 *   2. The image will appear automatically — no other changes needed.
 */
export interface BrandLogoProps {
  /** Rendered size (px). Height is `size`, width scales with aspect-ratio. */
  size?: number
  /** Override the image source. Defaults to /logo.png. */
  src?: string
  /** Alt text for accessibility. */
  alt?: string
}

export function BrandLogo({
  size = 160,
  src = '/logo.png',
  alt = 'The Millennial Saver',
}: BrandLogoProps) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={{
          height: size,
          minWidth: size,
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-surface-alt)',
          border: '1px dashed var(--border-default)',
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontSize: Math.round(size * 0.07),
            fontWeight: 500,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          The
        </span>
        <span
          style={{
            fontFamily: 'var(--font-script)',
            fontSize: Math.round(size * 0.26),
            fontWeight: 700,
            color: 'var(--accent)',
            marginTop: Math.round(size * 0.03),
          }}
        >
          Millennial Saver
        </span>
        <span
          style={{
            marginTop: Math.round(size * 0.05),
            fontSize: Math.round(size * 0.055),
            color: 'var(--text-muted)',
            textAlign: 'center',
            maxWidth: size * 1.8,
          }}
        >
          Drop <code style={{ fontFamily: 'var(--font-mono)' }}>logo.png</code> in <code style={{ fontFamily: 'var(--font-mono)' }}>/public</code>
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      style={{
        height: size,
        width: 'auto',
        display: 'block',
      }}
    />
  )
}
