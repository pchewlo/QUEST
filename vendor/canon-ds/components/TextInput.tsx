import type { InputHTMLAttributes, ReactNode } from 'react'

/**
 * TextInput — single-line text field.
 *
 * Source: Figma spec
 *   display: flex; height: 64px; padding: 12px 16px;
 *   justify-content: center; align-items: center; gap: 8px;
 *   align-self: stretch;
 *
 * All raw values are expressed as semantic tokens in index.css
 * (--input-height, --input-padding-y, --input-padding-x, --input-gap).
 */
export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leading?: ReactNode
  trailing?: ReactNode
}

export function TextInput({ leading, trailing, style, ...rest }: TextInputProps) {
  return (
    <label
      style={{
        /* align-self: stretch → the wrapper fills its parent's cross axis */
        alignSelf: 'stretch',
        display: 'flex',
        height: 'var(--input-height)',
        padding: 'var(--input-padding-y) var(--input-padding-x)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 'var(--input-gap)',
        background: 'var(--bg-surface-alt)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        transition: 'border-color 120ms, background 120ms',
        cursor: 'text',
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
    >
      {leading && (
        <span style={{ display: 'inline-flex', color: 'var(--text-muted)', flexShrink: 0 }}>
          {leading}
        </span>
      )}
      <input
        {...rest}
        style={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-md)',
          fontWeight: 'var(--weight-regular)',
          lineHeight: 'var(--leading-normal)',
        }}
      />
      {trailing && (
        <span style={{ display: 'inline-flex', color: 'var(--text-muted)', flexShrink: 0 }}>
          {trailing}
        </span>
      )}
    </label>
  )
}
