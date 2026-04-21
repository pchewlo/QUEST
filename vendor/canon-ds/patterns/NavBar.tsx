import { Search, Bell, Plus } from 'lucide-react'
import { Button } from '../components/Button'
import { Avatar } from '../components/Avatar'
import { TextInput } from '../components/TextInput'
import { CMark } from '../components/CMark'
import { CanonWordmark } from '../components/CanonWordmark'

/**
 * NavBar — horizontal app bar. Brand left, search center, actions right.
 * Notion-style: slim (44px), hairline separator, neutral palette.
 */
export function NavBar() {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-5)',
        width: '100%',
        height: 44,
        padding: '0 var(--space-5)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <CMark size={24} />
        <CanonWordmark size="sm" />
      </div>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
        {['Workspace', 'Docs', 'Reports', 'Members'].map((l, i) => (
          <button
            key={l}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              background: i === 0 ? 'var(--bg-hover)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 320, marginLeft: 'auto' }}>
        <TextInput
          placeholder="Search…"
          leading={<Search size={14} />}
          style={{ height: 30 }}
        />
      </div>

      {/* Actions */}
      <Button variant="ghost" size="sm" leading={<Bell size={14} />} aria-label="Notifications" />
      <Button variant="primary" size="sm" leading={<Plus size={14} />}>New</Button>
      <Avatar name="Ada Lovelace" size={26} />
    </nav>
  )
}
