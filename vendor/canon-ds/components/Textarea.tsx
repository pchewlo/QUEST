import type { TextareaHTMLAttributes } from 'react'

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%',
        minHeight: 80,
        padding: 'var(--space-3) var(--input-padding-x)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--input-radius)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
        lineHeight: 'var(--leading-normal)',
        outline: 'none',
        resize: 'vertical',
        boxShadow: 'var(--shadow-xs)',
        ...props.style,
      }}
    />
  )
}
