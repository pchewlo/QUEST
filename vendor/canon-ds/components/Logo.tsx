import type { ReactNode } from 'react'

/**
 * Logo — brand mark + wordmark container.
 *
 * Source: Figma spec
 *   display: flex; height: 36px; padding: 8px 16px;
 *   justify-content: center; align-items: center; gap: 4px;
 *
 * All raw values live as component tokens in index.css
 * (--logo-height, --logo-padding-y, --logo-padding-x, --logo-gap).
 */
export interface LogoProps {
  /** Mark rendered before the wordmark. Defaults to an accent-colored square. */
  mark?: ReactNode
  /** Wordmark text. Defaults to "ACME". */
  wordmark?: ReactNode
}

export function Logo({ mark, wordmark = 'ACME' }: LogoProps) {
  return (
    <div
      style={{
        display: 'flex',
        height: 'var(--logo-height)',
        padding: 'var(--logo-padding-y) var(--logo-padding-x)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 'var(--logo-gap)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-md)',
        fontWeight: 'var(--weight-bold)',
        letterSpacing: 0.4,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'calc(var(--logo-height) - var(--logo-padding-y) * 2)',
          height: 'calc(var(--logo-height) - var(--logo-padding-y) * 2)',
          borderRadius: 'var(--radius-xs)',
          background: 'var(--accent)',
          color: 'var(--accent-fg)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-bold)',
        }}
      >
        {mark ?? 'A'}
      </span>
      <span>{wordmark}</span>
    </div>
  )
}
