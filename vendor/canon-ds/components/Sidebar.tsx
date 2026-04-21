import {
  Home,
  Palette,
  Type,
  Shapes,
  Box,
  Layout,
  PanelLeft,
  PanelLeftClose,
  Moon,
  Sun,
  Monitor,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import { StatusDot } from './StatusDot'
import { CanonWordmark } from './CanonWordmark'
import { CMark } from './CMark'
import {
  colors,
  typography,
  icons,
  components,
  patterns,
  prototypes,
  rollupStatus,
  stats,
} from '../data/assetRegistry'
import type { Status } from '../data/assetRegistry'

export type Route =
  | { type: 'home' }
  | { type: 'colors' }
  | { type: 'typography' }
  | { type: 'icons' }
  | { type: 'components' }
  | { type: 'pattern'; slug: string }
  | { type: 'prototype'; slug: string }

interface NavItem {
  label: string
  icon: React.ComponentType<{ size?: number }>
  route: Route
  status: Status
}

export function Sidebar({
  route,
  onNavigate,
  collapsed,
  onToggleCollapsed,
  theme,
  onToggleTheme,
}: {
  route: Route
  onNavigate: (r: Route) => void
  collapsed: boolean
  onToggleCollapsed: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}) {
  const [dsOpen, setDsOpen] = useState(true)
  const [patternsOpen, setPatternsOpen] = useState(true)
  const [protoOpen, setProtoOpen] = useState(true)

  const s = stats()

  const dsItems: NavItem[] = [
    { label: 'Colors',     icon: Palette, route: { type: 'colors' },     status: rollupStatus(colors) },
    { label: 'Typography', icon: Type,    route: { type: 'typography' }, status: rollupStatus(typography) },
    { label: 'Icons',      icon: Shapes,  route: { type: 'icons' },      status: rollupStatus(icons) },
    { label: 'Components', icon: Box,     route: { type: 'components' }, status: rollupStatus(components) },
  ]

  const isActive = (r: Route) => JSON.stringify(r) === JSON.stringify(route)

  return (
    <aside
      style={{
        width: collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)',
        flexShrink: 0,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        transition: 'width 180ms ease',
        fontSize: 12,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: collapsed ? '12px 8px' : '14px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}
      >
        {collapsed ? (
          <CMark size={28} />
        ) : (
          <>
            <CMark size={26} />
            <CanonWordmark size="sm" />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 'var(--space-2)' }}>
              Design Library
            </span>
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
              style={{
                marginLeft: 'auto',
                width: 26,
                height: 26,
                borderRadius: 6,
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '8px 4px' : '10px 8px' }}>
        <NavButton
          icon={Home}
          label="Home"
          collapsed={collapsed}
          active={isActive({ type: 'home' })}
          onClick={() => onNavigate({ type: 'home' })}
          status={rollupStatus([...colors, ...typography, ...icons, ...components])}
        />

        <NavSection
          title="Design System"
          collapsed={collapsed}
          open={dsOpen}
          onToggle={() => setDsOpen(!dsOpen)}
        />
        {(dsOpen || collapsed) && dsItems.map((item) => (
          <NavButton
            key={item.label}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
            active={isActive(item.route)}
            onClick={() => onNavigate(item.route)}
            status={item.status}
          />
        ))}

        <NavSection
          title="Patterns"
          collapsed={collapsed}
          open={patternsOpen}
          onToggle={() => setPatternsOpen(!patternsOpen)}
        />
        {(patternsOpen || collapsed) && patterns.map((p) => (
          <NavButton
            key={p.id}
            icon={Layout}
            label={p.name}
            collapsed={collapsed}
            active={isActive({ type: 'pattern', slug: p.slug })}
            onClick={() => onNavigate({ type: 'pattern', slug: p.slug })}
            status={p.status}
          />
        ))}

        <NavSection
          title="Prototype"
          collapsed={collapsed}
          open={protoOpen}
          onToggle={() => setProtoOpen(!protoOpen)}
        />
        {(protoOpen || collapsed) && prototypes.map((p) => (
          <NavButton
            key={p.id}
            icon={Monitor}
            label={p.name}
            collapsed={collapsed}
            active={isActive({ type: 'prototype', slug: p.slug })}
            onClick={() => onNavigate({ type: 'prototype', slug: p.slug })}
            status={p.status}
          />
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: collapsed ? '8px 4px' : '10px 14px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {!collapsed && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {s.total} assets · {s.readyPct}% ready
          </div>
        )}
        <button
          onClick={onToggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8,
            padding: collapsed ? '6px 0' : '6px 8px',
            width: '100%',
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            fontSize: 11,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {collapsed ? <PanelLeft size={13} /> : <><PanelLeftClose size={13} /> Collapse</>}
        </button>
      </div>
    </aside>
  )
}

function NavSection({
  title,
  collapsed,
  open,
  onToggle,
}: {
  title: string
  collapsed: boolean
  open: boolean
  onToggle: () => void
}) {
  if (collapsed) return <div style={{ height: 8 }} />
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginTop: 12,
        marginBottom: 4,
        padding: '4px 8px',
        background: 'transparent',
        border: 'none',
        color: 'var(--text-muted)',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        width: '100%',
        textAlign: 'left',
      }}
    >
      {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
      {title}
    </button>
  )
}

function NavButton({
  icon: Icon,
  label,
  collapsed,
  active,
  onClick,
  status,
}: {
  icon: React.ComponentType<{ size?: number }>
  label: string
  collapsed: boolean
  active: boolean
  onClick: () => void
  status: Status
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: collapsed ? '8px 0' : '6px 8px',
        marginBottom: 2,
        justifyContent: collapsed ? 'center' : 'flex-start',
        background: active ? 'var(--bg-active)' : 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontSize: 12,
        fontWeight: active ? 500 : 400,
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'var(--bg-hover)'
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent'
      }}
    >
      <Icon size={14} />
      {!collapsed && (
        <>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label}
          </span>
          <StatusDot status={status} />
        </>
      )}
    </button>
  )
}
