import { X } from 'lucide-react'
import { CopyButton } from './CopyButton'

export interface DocContent {
  title: string
  description: string
  usage?: string
  donts?: string[]
  examples?: { label: string; code: string }[]
}

export function DocPanel({ doc, onClose }: { doc: DocContent | null; onClose: () => void }) {
  const open = !!doc
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 40,
          }}
        />
      )}
      <aside
        aria-hidden={!open}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'var(--docpanel-width)',
          maxWidth: '90vw',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 200ms ease',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {doc && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--text-muted)' }}>
                Documentation
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32,
                  height: 32,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-sm)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 20, overflow: 'auto', flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                {doc.title}
              </h2>
              <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {doc.description}
              </p>

              {doc.usage && (
                <section style={{ marginTop: 24 }}>
                  <h3 style={sectionTitle}>Usage</h3>
                  <p style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                    {doc.usage}
                  </p>
                </section>
              )}

              {doc.donts && doc.donts.length > 0 && (
                <section style={{ marginTop: 24 }}>
                  <h3 style={sectionTitle}>Don'ts</h3>
                  <ul style={{ marginTop: 6, paddingLeft: 16, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                    {doc.donts.map((d, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{d}</li>
                    ))}
                  </ul>
                </section>
              )}

              {doc.examples && doc.examples.length > 0 && (
                <section style={{ marginTop: 24 }}>
                  <h3 style={sectionTitle}>Examples</h3>
                  {doc.examples.map((ex, i) => (
                    <div key={i} style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ex.label}</div>
                        <CopyButton value={ex.code} label="Copy" />
                      </div>
                      <pre
                        style={{
                          margin: 0,
                          padding: 12,
                          background: 'var(--bg-surface-alt)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 12,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-primary)',
                          overflow: 'auto',
                          lineHeight: 1.5,
                          whiteSpace: 'pre',
                        }}
                      >
                        {ex.code}
                      </pre>
                    </div>
                  ))}
                </section>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  )
}

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  color: 'var(--text-muted)',
  fontWeight: 600,
}
