import type { Status } from '../data/assetRegistry'

const colorFor = (s: Status) =>
  s === 'ready' ? 'var(--status-ready)' :
  s === 'in-progress' ? 'var(--status-inprogress)' :
  'var(--status-draft)'

export function StatusDot({ status, size = 8 }: { status: Status; size?: number }) {
  return (
    <span
      aria-label={`status: ${status}`}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: colorFor(status),
        flexShrink: 0,
      }}
    />
  )
}

export function StatusChip({ status }: { status: Status }) {
  const bg =
    status === 'ready' ? 'var(--status-ready-bg)' :
    status === 'in-progress' ? 'var(--status-inprogress-bg)' :
    'var(--status-draft-bg)'
  const fg = colorFor(status)
  const label = status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 8px',
        borderRadius: 999,
        background: bg,
        color: fg,
        fontSize: 11,
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <StatusDot status={status} size={6} />
      {label}
    </span>
  )
}
