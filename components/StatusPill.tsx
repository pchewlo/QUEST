import { cn } from "@/lib/utils"

type StatusPillProps = {
  status: 'active' | 'calibrating' | 'paused' | 'ended' | 'draft' | 'cooldown' | 'held'
}

const config: Record<StatusPillProps['status'], { label: string; dotClass: string }> = {
  active: { label: "Active", dotClass: "bg-quest-success" },
  calibrating: { label: "Calibrating", dotClass: "bg-quest-warning" },
  paused: { label: "Paused", dotClass: "bg-quest-ink-faint" },
  ended: { label: "Ended", dotClass: "bg-quest-ink-faint" },
  draft: { label: "Draft", dotClass: "bg-quest-surface-muted" },
  cooldown: { label: "Cooldown", dotClass: "bg-quest-info" },
  held: { label: "Held", dotClass: "bg-quest-danger" },
}

export function StatusPill({ status }: StatusPillProps) {
  const { label, dotClass } = config[status]

  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-quest-ink-muted">
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
      {label}
    </span>
  )
}
