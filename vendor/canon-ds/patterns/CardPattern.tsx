import { MoreHorizontal, FileText } from 'lucide-react'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { Avatar } from '../components/Avatar'

/**
 * Card pattern — a single rich content container. Notion-style:
 * top eyebrow, title, body, meta strip with avatars + badge + action.
 */
export function CardPattern() {
  return (
    <article
      style={{
        width: 420,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xs)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-4) var(--space-5) 0',
      }}>
        <FileText size={14} color="var(--text-muted)" />
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>
          DOCUMENT
        </span>
        <span style={{ flex: 1 }} />
        <Badge tone="success">Published</Badge>
      </div>

      <div style={{ padding: 'var(--space-3) var(--space-5) var(--space-5)' }}>
        <h3
          style={{
            margin: 0,
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--text-primary)',
            lineHeight: 'var(--leading-snug)',
          }}
        >
          Q3 product roadmap
        </h3>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--leading-normal)',
          }}
        >
          What we're shipping this quarter — focused on collaboration, permissions,
          and speed. Review and comment by Friday.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          padding: 'var(--space-4) var(--space-5)',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-sunk)',
        }}
      >
        <div style={{ display: 'flex', gap: -6 }}>
          {['Ada Lovelace', 'Grace Hopper', 'Alan Turing'].map((n, i) => (
            <div key={n} style={{ marginLeft: i === 0 ? 0 : -6, border: '2px solid var(--bg-sunk)', borderRadius: '50%' }}>
              <Avatar name={n} size={22} />
            </div>
          ))}
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Updated 2 hours ago
        </span>
        <span style={{ flex: 1 }} />
        <Button variant="ghost" size="sm" leading={<MoreHorizontal size={14} />} aria-label="More" />
      </div>
    </article>
  )
}
