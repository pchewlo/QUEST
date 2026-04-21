import type { ReactNode } from 'react'
import { FileText } from 'lucide-react'
import type { Status } from '../data/assetRegistry'
import { StatusChip } from './StatusDot'
import { CopyButton } from './CopyButton'

export function Card({
  title,
  status,
  placeholder,
  copyValue,
  onOpenDocs,
  children,
  onClick,
}: {
  title: string
  status: Status
  placeholder?: boolean
  copyValue?: string
  onOpenDocs?: () => void
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={placeholder ? 'placeholder-border' : ''}
      style={{
        background: placeholder ? 'transparent' : 'var(--card-bg)',
        border: placeholder ? undefined : '1px solid var(--card-border)',
        borderRadius: 'var(--card-radius)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 120ms, transform 120ms',
      }}
      onMouseEnter={(e) => {
        if (!placeholder) e.currentTarget.style.borderColor = 'var(--border-strong)'
      }}
      onMouseLeave={(e) => {
        if (!placeholder) e.currentTarget.style.borderColor = 'var(--card-border)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <StatusChip status={status} />
          {placeholder && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 0.4,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Placeholder
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {copyValue && <CopyButton value={copyValue} />}
          {onOpenDocs && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenDocs()
              }}
              title="Open documentation"
              style={{
                width: 28,
                height: 28,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                border: '1px solid var(--btn-border)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--btn-bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <FileText size={13} />
            </button>
          )}
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
      {children}
    </div>
  )
}
