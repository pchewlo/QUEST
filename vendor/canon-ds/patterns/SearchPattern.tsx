import { useState, useMemo } from 'react'
import { Search, FileText, Users, Hash, CornerDownLeft } from 'lucide-react'
import { TextInput } from '../components/TextInput'

interface Result {
  id: string
  title: string
  kind: 'doc' | 'person' | 'tag'
  subtitle: string
}

const ALL: Result[] = [
  { id: '1', title: 'Q3 product roadmap',     kind: 'doc',    subtitle: 'Updated 2h ago · Ada Lovelace' },
  { id: '2', title: 'Pricing page redesign',  kind: 'doc',    subtitle: 'Updated yesterday · Grace Hopper' },
  { id: '3', title: 'Onboarding flow v4',     kind: 'doc',    subtitle: 'Draft · Alan Turing' },
  { id: '4', title: 'Brand voice guide',      kind: 'doc',    subtitle: 'Published · Katherine Johnson' },
  { id: '5', title: 'Ada Lovelace',           kind: 'person', subtitle: 'Product lead · ada@canon.app' },
  { id: '6', title: 'Grace Hopper',           kind: 'person', subtitle: 'Engineering · grace@canon.app' },
  { id: '7', title: '#launch-q3',             kind: 'tag',    subtitle: '12 documents' },
  { id: '8', title: '#pricing',               kind: 'tag',    subtitle: '5 documents' },
]

const iconFor = (k: Result['kind']) =>
  k === 'doc' ? FileText : k === 'person' ? Users : Hash

/**
 * Search pattern — Notion-style omnibar with grouped results.
 */
export function SearchPattern() {
  const [q, setQ] = useState('')
  const filtered = useMemo(
    () => (q.trim()
      ? ALL.filter((r) => r.title.toLowerCase().includes(q.toLowerCase()))
      : ALL),
    [q],
  )

  const groups = {
    doc:    filtered.filter((r) => r.kind === 'doc'),
    person: filtered.filter((r) => r.kind === 'person'),
    tag:    filtered.filter((r) => r.kind === 'tag'),
  }

  return (
    <div
      style={{
        width: 520,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-popover)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: 'var(--space-3)' }}>
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search or jump to…"
          autoFocus
          leading={<Search size={14} />}
          style={{ height: 36 }}
        />
      </div>
      <div style={{ borderTop: '1px solid var(--border-subtle)', maxHeight: 320, overflow: 'auto' }}>
        {(Object.entries(groups) as [Result['kind'], Result[]][]).map(([kind, items]) =>
          items.length === 0 ? null : (
            <section key={kind} style={{ padding: 'var(--space-3) 0' }}>
              <div
                style={{
                  padding: '0 var(--space-4)',
                  fontSize: 'var(--text-2xs)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginBottom: 'var(--space-2)',
                }}
              >
                {kind === 'doc' ? 'Documents' : kind === 'person' ? 'People' : 'Tags'}
              </div>
              {items.map((r) => {
                const Icon = iconFor(r.kind)
                return (
                  <button
                    key={r.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      width: '100%',
                      padding: 'var(--space-2) var(--space-4)',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Icon size={15} color="var(--text-muted)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>
                        {r.title}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {r.subtitle}
                      </div>
                    </div>
                  </button>
                )
              })}
            </section>
          ),
        )}
        {filtered.length === 0 && (
          <div style={{
            padding: 'var(--space-6)',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 'var(--text-sm)',
          }}>
            No results for "{q}"
          </div>
        )}
      </div>
      <footer
        style={{
          display: 'flex',
          gap: 'var(--space-4)',
          padding: 'var(--space-3) var(--space-4)',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-sunk)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-muted)',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <kbd style={kbdStyle}><CornerDownLeft size={10} /></kbd> to select
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <kbd style={kbdStyle}>esc</kbd> to close
        </span>
      </footer>
    </div>
  )
}

const kbdStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 18,
  height: 18,
  padding: '0 4px',
  borderRadius: 3,
  background: 'var(--bg-surface-alt)',
  border: '1px solid var(--border-subtle)',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  color: 'var(--text-secondary)',
}
