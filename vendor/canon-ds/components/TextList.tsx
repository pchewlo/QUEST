import type { ReactNode } from 'react'

/**
 * TextList — vertical list of text items.
 *
 * Source: Figma spec ("SAT/Sat 14 R")
 *   color: var(--text-primary, #E6E0E9);
 *   font-family: Satoshi;
 *   font-size: 14px;
 *   font-weight: 400;
 *   line-height: 150%; /* 21px *\/
 *
 * Mapped to existing tokens:
 *   color       → var(--text-primary)
 *   font-family → var(--font-sans)  (Satoshi is first in the stack)
 *   font-size   → var(--text-base)  (14px)
 *   font-weight → var(--weight-regular)
 *   line-height → var(--leading-normal)  (1.5 = 21px at 14px)
 */
export interface TextListProps {
  items: ReactNode[]
  /** Optional ordered (numbered) variant. Defaults to unordered. */
  ordered?: boolean
}

export function TextList({ items, ordered = false }: TextListProps) {
  const Tag = ordered ? 'ol' : 'ul'
  return (
    <Tag
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--weight-regular)',
        lineHeight: 'var(--leading-normal)',
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-2)',
          }}
        >
          <span
            aria-hidden
            style={{
              flexShrink: 0,
              width: 'var(--space-1)',
              height: 'var(--space-1)',
              marginTop: 'calc(var(--text-base) * 0.55)',
              borderRadius: '50%',
              background: 'var(--text-secondary)',
            }}
          />
          <span style={{ minWidth: 0 }}>{item}</span>
        </li>
      ))}
    </Tag>
  )
}
