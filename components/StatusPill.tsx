import { cn } from "@/lib/utils"

type StatusPillProps = {
  status: 'active' | 'calibrating' | 'paused' | 'ended' | 'draft' | 'cooldown' | 'held'
  supplementary?: string
}

const config: Record<StatusPillProps['status'], { label: string; dotClass: string; pillClass: string }> = {
  active: {
    label: "Active",
    dotClass: "bg-quest-info",
    pillClass: "bg-quest-info-soft text-quest-info",
  },
  calibrating: {
    label: "Calibrating",
    dotClass: "bg-quest-warning",
    pillClass: "bg-quest-warning-soft text-quest-warning",
  },
  paused: {
    label: "Paused",
    dotClass: "bg-quest-ink-faint",
    pillClass: "bg-quest-surface-muted text-quest-ink-faint",
  },
  ended: {
    label: "Ended",
    dotClass: "bg-quest-ink-faint",
    pillClass: "bg-quest-surface-muted text-quest-ink-faint",
  },
  draft: {
    label: "Draft",
    dotClass: "bg-quest-ink-faint/50",
    pillClass: "bg-quest-surface-muted/60 text-quest-ink-faint",
  },
  cooldown: {
    label: "Cooldown",
    dotClass: "bg-quest-info",
    pillClass: "bg-quest-info-soft text-quest-info",
  },
  held: {
    label: "Held",
    dotClass: "bg-quest-danger",
    pillClass: "bg-quest-danger-soft text-quest-danger",
  },
}

export function StatusPill({ status, supplementary }: StatusPillProps) {
  const { label, dotClass, pillClass } = config[status]

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium", pillClass)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
      {label}
      {supplementary && (
        <span className="text-[11px] opacity-70">{supplementary}</span>
      )}
    </span>
  )
}
