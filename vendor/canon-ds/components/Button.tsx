import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leading?: ReactNode
  trailing?: ReactNode
  fullWidth?: boolean
}

/**
 * Button — Notion-style. Tight padding, small radius, medium weight.
 * All colors resolved via semantic tokens — zero raw hex.
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  leading,
  trailing,
  fullWidth,
  children,
  style,
  ...rest
}: ButtonProps) {
  const heights: Record<ButtonSize, string> = {
    sm: 'var(--btn-height-sm)',
    md: 'var(--btn-height-md)',
    lg: 'var(--btn-height-lg)',
  }
  const fontSizes: Record<ButtonSize, string> = {
    sm: 'var(--text-xs)',
    md: 'var(--text-sm)',
    lg: 'var(--text-base)',
  }
  const px: Record<ButtonSize, string> = {
    sm: 'var(--space-3)',
    md: 'var(--space-4)',
    lg: 'var(--space-5)',
  }

  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background: 'var(--accent)',
      color: 'var(--accent-fg)',
      border: '1px solid var(--accent)',
    },
    secondary: {
      background: 'var(--bg-surface)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-xs)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid transparent',
    },
    danger: {
      background: 'var(--status-danger)',
      color: 'var(--accent-fg)',
      border: '1px solid var(--status-danger)',
    },
  }

  const hoverBg: Record<ButtonVariant, string> = {
    primary:   'var(--accent-hover)',
    secondary: 'var(--bg-hover)',
    ghost:     'var(--bg-hover)',
    danger:    'color-mix(in srgb, var(--status-danger) 88%, black)',
  }

  return (
    <button
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        height: heights[size],
        padding: `0 ${px[size]}`,
        borderRadius: 'var(--btn-radius)',
        fontFamily: 'var(--font-sans)',
        fontSize: fontSizes[size],
        fontWeight: 'var(--weight-medium)',
        lineHeight: 1,
        cursor: rest.disabled ? 'not-allowed' : 'pointer',
        opacity: rest.disabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
        width: fullWidth ? '100%' : undefined,
        transition: 'background 120ms, border-color 120ms',
        ...variants[variant],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!rest.disabled) e.currentTarget.style.background = hoverBg[variant]
      }}
      onMouseLeave={(e) => {
        if (!rest.disabled) e.currentTarget.style.background = (variants[variant].background as string) ?? 'transparent'
      }}
    >
      {leading}
      {children}
      {trailing}
    </button>
  )
}
