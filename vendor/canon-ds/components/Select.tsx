import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value: string }[]
}

export function Select({ options, style, ...rest }: SelectProps) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        height: 'var(--input-height)',
        width: '100%',
      }}
    >
      <select
        {...rest}
        style={{
          appearance: 'none',
          width: '100%',
          height: '100%',
          padding: `0 calc(var(--input-padding-x) + 18px) 0 var(--input-padding-x)`,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--input-radius)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-sm)',
          lineHeight: 1,
          outline: 'none',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-xs)',
          ...style,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown
        size={14}
        style={{
          position: 'absolute',
          right: 'var(--input-padding-x)',
          pointerEvents: 'none',
          color: 'var(--text-muted)',
        }}
      />
    </div>
  )
}
