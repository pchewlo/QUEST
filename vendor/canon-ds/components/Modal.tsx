import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  maxWidth?: number
}

/**
 * Modal — blocking dialog. Notion-style: subtle shadow, compact radius,
 * header with title + close, optional footer for actions.
 */
export function Modal({ open, onClose, title, description, children, footer, maxWidth = 480 }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 15, 15, 0.35)',
        padding: 'var(--space-5)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth,
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-popover)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
          overflow: 'hidden',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
              {title}
            </h2>
            {description && (
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 28, height: 28,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={16} />
          </button>
        </header>

        <div style={{ padding: 'var(--space-5) var(--space-6)', overflow: 'auto', flex: 1 }}>
          {children}
        </div>

        {footer && (
          <footer
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-3)',
              padding: 'var(--space-4) var(--space-6)',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-sunk)',
            }}
          >
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}
