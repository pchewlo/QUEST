import { cn } from "@/lib/utils"

type QuestBadgeProps = {
  variant: 'rg_hold' | 'rg_caution' | 'success' | 'warning' | 'info' | 'neutral'
  children: React.ReactNode
}

const variantStyles: Record<QuestBadgeProps['variant'], string> = {
  rg_hold: "bg-quest-danger-soft text-quest-danger",
  rg_caution: "bg-quest-warning-soft text-quest-warning",
  success: "bg-quest-success-soft text-quest-success",
  warning: "bg-quest-warning-soft text-quest-warning",
  info: "bg-quest-info-soft text-quest-info",
  neutral: "bg-quest-surface-muted text-quest-ink-muted",
}

export function QuestBadge({ variant, children }: QuestBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium uppercase",
        variantStyles[variant],
      )}
    >
      {children}
    </span>
  )
}
