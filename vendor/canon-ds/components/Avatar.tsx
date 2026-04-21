export interface AvatarProps {
  name: string
  src?: string
  size?: number
}

/** Simple initials-avatar, Notion-style. Deterministic color based on the name. */
export function Avatar({ name, src, size = 24 }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

  // Deterministic hue from name
  const hash = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)
  const hue = Math.abs(hash) % 360

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: 'var(--radius-rounded)',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    )
  }

  return (
    <span
      aria-label={name}
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--radius-rounded)',
        background: `hsl(${hue} 55% 92%)`,
        color: `hsl(${hue} 35% 30%)`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.round(size * 0.42),
        fontWeight: 'var(--weight-semibold)',
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {initials || '?'}
    </span>
  )
}
