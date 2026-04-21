import { cn } from "@/lib/utils"

type InsightCardProps = {
  headline: string
  explanation: string
  metric?: { label: string; value: string; delta: string; deltaType: 'positive' | 'negative' | 'neutral' }
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
  accent?: boolean
}

export function InsightCard({
  headline,
  explanation,
  metric,
  actionLabel,
  onAction,
  icon,
  accent = false,
}: InsightCardProps) {
  return (
    <div className={cn(
      "rounded-lg border border-border bg-card border-l-4 p-4",
      accent ? "border-l-quest-accent" : "border-l-border"
    )}>
      <div className="flex gap-3">
        {icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-quest-accent-soft text-quest-accent">
            {icon}
          </div>
        )}

        <div className="flex flex-1 flex-col gap-2">
          <h4 className="text-[15px] font-medium text-quest-ink">{headline}</h4>
          <p className="text-[13px] leading-relaxed text-quest-ink-muted">{explanation}</p>

          {metric && (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-[12px] text-quest-ink-faint">{metric.label}</span>
              <span className="text-[18px] font-medium tabular-nums text-quest-ink">
                {metric.value}
              </span>
              <span
                className={cn(
                  "text-[12px] font-medium",
                  metric.deltaType === 'positive' && "text-quest-success",
                  metric.deltaType === 'negative' && "text-quest-danger",
                  metric.deltaType === 'neutral' && "text-quest-ink-faint",
                )}
              >
                {metric.delta}
              </span>
            </div>
          )}

          {actionLabel && onAction && (
            <div className="mt-2 flex justify-end">
              <button
                onClick={onAction}
                className="rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-quest-ink-muted hover:bg-quest-surface-muted transition-colors"
              >
                {actionLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
