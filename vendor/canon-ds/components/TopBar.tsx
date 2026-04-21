import { FileText } from 'lucide-react'
import type { Status } from '../data/assetRegistry'
import { StatusChip } from './StatusDot'
import { CopyButton } from './CopyButton'

export function TopBar({
  title,
  status,
  copyValue,
  onOpenDocs,
}: {
  title: string
  status?: Status
  copyValue?: string
  onOpenDocs?: () => void
}) {
  return (
    <header
      style={{
        /* HARD RULE: always fills 100% of available width. */
        width: '100%',
        minWidth: 0,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        height: 'var(--topbar-height)',
        padding: '0 24px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </h1>
      {status && <StatusChip status={status} />}
      <div style={{ flex: 1 }} />
      {copyValue && <CopyButton value={copyValue} label="Copy code" />}
      {onOpenDocs && (
        <button
          onClick={onOpenDocs}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--btn-bg)',
            color: 'var(--btn-fg)',
            border: '1px solid var(--btn-border)',
            fontSize: 13,
            fontWeight: 500,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--btn-bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--btn-bg)')}
        >
          <FileText size={14} />
          Documentation
        </button>
      )}
    </header>
  )
}
