'use client'

import { cn } from "@/lib/utils"

type KPICardProps = {
  label: string
  value: string | number
  delta?: string
  deltaType?: 'positive' | 'negative' | 'neutral'
  suffix?: string
  prefix?: string
  subtitle?: string
  progress?: number
}

export function KPICard({
  label,
  value,
  delta,
  deltaType = 'neutral',
  suffix,
  prefix,
  subtitle,
  progress,
}: KPICardProps) {
  return (
    <div className="relative flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4 overflow-hidden">
      <span className="text-[12px] font-medium uppercase tracking-wide text-quest-ink-faint">
        {label}
      </span>

      <div className="flex items-baseline gap-2">
        <span className="text-[24px] font-medium tabular-nums text-quest-ink">
          {prefix}
          {value}
          {suffix}
        </span>

        {delta && (
          <span
            className={cn(
              "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium",
              deltaType === 'positive' && "bg-quest-success-soft text-quest-success",
              deltaType === 'negative' && "bg-quest-danger-soft text-quest-danger",
              deltaType === 'neutral' && "bg-quest-surface-muted text-quest-ink-muted",
            )}
          >
            {delta}
          </span>
        )}
      </div>

      {subtitle && (
        <span className="text-[12px] text-quest-ink-faint">
          {subtitle}
        </span>
      )}

      {progress !== undefined && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-quest-surface-muted">
          <div
            className="h-full bg-quest-accent transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  )
}
