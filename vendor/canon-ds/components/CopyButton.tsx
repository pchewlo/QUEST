import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyButton({
  value,
  label = 'Copy',
  size = 'sm',
}: {
  value: string
  label?: string
  size?: 'sm' | 'md'
}) {
  const [copied, setCopied] = useState(false)
  const handle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }
  const isSm = size === 'sm'
  return (
    <button
      onClick={handle}
      title={`Copy ${value}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: isSm ? '4px 8px' : '6px 12px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--btn-bg)',
        color: 'var(--btn-fg)',
        border: '1px solid var(--btn-border)',
        fontSize: isSm ? 11 : 13,
        fontWeight: 500,
        transition: 'background 120ms',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--btn-bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--btn-bg)')}
    >
      {copied ? <Check size={isSm ? 12 : 14} /> : <Copy size={isSm ? 12 : 14} />}
      {copied ? 'Copied' : label}
    </button>
  )
}
