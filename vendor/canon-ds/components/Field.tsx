import type { ReactNode } from 'react'

export interface FieldProps {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}

/** Form field wrapper — label above, hint/error below. Notion-compact. */
export function Field({ label, hint, error, required, children }: FieldProps) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <span
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--weight-medium)',
          color: 'var(--text-secondary)',
          letterSpacing: 0.1,
        }}
      >
        {label}
        {required && <span style={{ color: 'var(--status-danger)', marginLeft: 4 }}>*</span>}
      </span>
      {children}
      {(hint || error) && (
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: error ? 'var(--status-danger)' : 'var(--text-muted)',
            lineHeight: 'var(--leading-snug)',
          }}
        >
          {error || hint}
        </span>
      )}
    </label>
  )
}
