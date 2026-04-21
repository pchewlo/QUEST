import { Field } from '../components/Field'
import { TextInput } from '../components/TextInput'
import { Textarea } from '../components/Textarea'
import { Select } from '../components/Select'
import { Button } from '../components/Button'

/**
 * Form Layout pattern — workspace settings page. Two-column layout
 * (description left, inputs right) is the Canon standard for settings.
 */
export function FormLayoutPattern() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      style={{
        width: '100%',
        maxWidth: 720,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <header style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--border-subtle)' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>
          Workspace settings
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Manage how Canon HQ appears to members and guests.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {sections.map((s, i) => (
          <Row key={s.label} last={i === sections.length - 1}>
            <Left label={s.label} hint={s.hint} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {s.content}
            </div>
          </Row>
        ))}
      </div>

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
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Save changes</Button>
      </footer>
    </form>
  )
}

function Row({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-6)',
        padding: 'var(--space-5) var(--space-6)',
        borderBottom: last ? 'none' : '1px solid var(--border-subtle)',
      }}
    >
      {children}
    </div>
  )
}

function Left({ label, hint }: { label: string; hint: string }) {
  return (
    <div style={{ width: 200, flexShrink: 0 }}>
      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>
        {label}
      </div>
      <div style={{ marginTop: 4, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 'var(--leading-snug)' }}>
        {hint}
      </div>
    </div>
  )
}

const sections = [
  {
    label: 'Workspace name',
    hint: 'How your workspace shows up across Canon.',
    content: (
      <Field label="Name" required>
        <TextInput defaultValue="Canon HQ" style={{ height: 36 }} />
      </Field>
    ),
  },
  {
    label: 'Domain',
    hint: 'Members signing up with this domain are auto-approved.',
    content: (
      <Field label="Allowed email domain" hint="Example: acme.com">
        <TextInput placeholder="acme.com" style={{ height: 36 }} />
      </Field>
    ),
  },
  {
    label: 'Description',
    hint: 'Shown on your public workspace page.',
    content: (
      <Field label="About">
        <Textarea placeholder="A short blurb about Canon HQ…" />
      </Field>
    ),
  },
  {
    label: 'Default access',
    hint: 'What new members can do by default.',
    content: (
      <Field label="Role">
        <Select
          options={[
            { label: 'Viewer — read-only',     value: 'viewer' },
            { label: 'Member — read & write',   value: 'member' },
            { label: 'Admin — full access',     value: 'admin' },
          ]}
        />
      </Field>
    ),
  },
]
