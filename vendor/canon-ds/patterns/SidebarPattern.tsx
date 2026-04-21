import { useState } from 'react'
import {
  Home, FileText, Inbox, Users, Settings, ChevronDown, ChevronRight, Plus,
} from 'lucide-react'
import { Avatar } from '../components/Avatar'

interface NavRow { label: string; icon: React.ComponentType<{ size?: number }>; count?: number; active?: boolean }
interface PageRow { label: string; emoji: string }

/**
 * Sidebar pattern — workspace-style left nav. Notion-inspired:
 * workspace switcher up top, sections with collapsible trees, quick actions.
 */
export function SidebarPattern() {
  const [pagesOpen, setPagesOpen] = useState(true)

  const main: NavRow[] = [
    { label: 'Home',    icon: Home,     active: true },
    { label: 'Inbox',   icon: Inbox,    count: 3 },
    { label: 'Docs',    icon: FileText },
    { label: 'Members', icon: Users },
    { label: 'Settings',icon: Settings },
  ]

  const pages: PageRow[] = [
    { label: 'Q3 Roadmap',     emoji: '📍' },
    { label: 'Pricing Update', emoji: '💸' },
    { label: 'Onboarding',     emoji: '👋' },
    { label: 'Brand guide',    emoji: '🎨' },
  ]

  return (
    <aside
      style={{
        width: 240,
        height: 480,
        background: 'var(--bg-sunk)',
        borderRight: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontSize: 'var(--text-sm)',
      }}
    >
      {/* Workspace switcher */}
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3)',
          margin: 'var(--space-2)',
          background: 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Avatar name="Canon HQ" size={22} />
        <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>Canon HQ</span>
        <ChevronDown size={12} color="var(--text-muted)" />
      </button>

      {/* Main nav */}
      <nav style={{ padding: '0 var(--space-2)', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {main.map((row) => {
          const Icon = row.icon
          return (
            <button
              key={row.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: '4px var(--space-3)',
                background: row.active ? 'var(--bg-active)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: row.active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 'var(--text-sm)',
                fontWeight: row.active ? 'var(--weight-medium)' : 'var(--weight-regular)',
                textAlign: 'left',
                height: 28,
              }}
              onMouseEnter={(e) => { if (!row.active) e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={(e) => { if (!row.active) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={15} />
              <span style={{ flex: 1 }}>{row.label}</span>
              {row.count !== undefined && (
                <span style={{
                  fontSize: 'var(--text-2xs)',
                  color: 'var(--text-muted)',
                  padding: '1px 6px',
                  background: 'var(--bg-surface-alt)',
                  borderRadius: 'var(--radius-rounded)',
                }}>
                  {row.count}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Pages section */}
      <div style={{ marginTop: 'var(--space-5)' }}>
        <button
          onClick={() => setPagesOpen(!pagesOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '4px var(--space-3)',
            margin: '0 var(--space-2)',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 'var(--text-2xs)',
            fontWeight: 'var(--weight-semibold)',
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            width: 'calc(100% - var(--space-4))',
            textAlign: 'left',
          }}
        >
          {pagesOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          Pages
          <span style={{ flex: 1 }} />
          <Plus size={12} />
        </button>
        {pagesOpen && (
          <div style={{ padding: '2px var(--space-2) 0', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {pages.map((p) => (
              <button
                key={p.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: '4px var(--space-3)',
                  paddingLeft: 'var(--space-5)',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)',
                  textAlign: 'left',
                  height: 26,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: 13 }}>{p.emoji}</span>
                <span style={{ flex: 1 }}>{p.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
