import { useState } from 'react'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { Field } from '../components/Field'
import { TextInput } from '../components/TextInput'
import { Textarea } from '../components/Textarea'

/**
 * Modal pattern — "Invite teammate" dialog built from the Modal component.
 * Demonstrates a typical Canon flow: form fields + confirmation footer.
 */
export function ModalPattern() {
  const [open, setOpen] = useState(true)

  return (
    <div
      style={{
        width: '100%',
        minHeight: 400,
        position: 'relative',
        background: 'var(--bg-surface-alt)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Button onClick={() => setOpen(true)}>Open invite dialog</Button>

      {/* We render the modal in the DOM with its own backdrop; it still escapes to body. */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Invite teammates"
        description="They'll get email invitations to join Canon HQ."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>Send invites</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Field label="Email addresses" hint="Separate multiple emails with commas.">
            <TextInput placeholder="alan@turing.org, grace@hopper.dev" style={{ height: 36 }} />
          </Field>
          <Field label="Personal note" hint="Optional — helps them know why you're inviting them.">
            <Textarea placeholder="Excited to have you on the team…" />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
