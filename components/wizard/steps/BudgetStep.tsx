'use client'

import { useMemo } from "react"

type BudgetStepProps = {
  dailyBudget: number
  perPlayerCap: number
  onDailyBudgetChange: (value: number) => void
  onPerPlayerCapChange: (value: number) => void
}

export function BudgetStep({
  dailyBudget,
  perPlayerCap,
  onDailyBudgetChange,
  onPerPlayerCapChange,
}: BudgetStepProps) {
  const projections = useMemo(() => {
    if (!dailyBudget || !perPlayerCap) {
      return { estimatedAgents: 0, calibrationDays: 0 }
    }
    const estimatedAgents = Math.floor(dailyBudget / perPlayerCap)
    // Simple heuristic: more agents = faster calibration
    const calibrationDays = Math.max(3, Math.ceil(14 - Math.log2(estimatedAgents + 1) * 2))
    return { estimatedAgents, calibrationDays }
  }, [dailyBudget, perPlayerCap])

  return (
    <div className="flex gap-6">
      {/* Inputs */}
      <div className="flex flex-1 flex-col gap-4">
        <p className="text-[13px] text-quest-ink-muted">
          Set your daily spend limits. QUEST will allocate budget across active agents.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium uppercase tracking-wide text-quest-ink-faint">
            Daily total budget
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-quest-ink-faint">
              \u00A3
            </span>
            <input
              type="number"
              min={0}
              step={10}
              value={dailyBudget || ''}
              onChange={(e) => onDailyBudgetChange(Number(e.target.value))}
              placeholder="500"
              className="h-9 w-full rounded-md border border-border bg-card pl-7 pr-3 text-[14px] tabular-nums text-quest-ink placeholder:text-quest-ink-faint outline-none focus:ring-1 focus:ring-quest-accent"
            />
          </div>
          <span className="text-[11px] text-quest-ink-faint">
            Total amount QUEST can spend per day across all agents
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium uppercase tracking-wide text-quest-ink-faint">
            Per-player daily cap
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-quest-ink-faint">
              \u00A3
            </span>
            <input
              type="number"
              min={0}
              step={0.5}
              value={perPlayerCap || ''}
              onChange={(e) => onPerPlayerCapChange(Number(e.target.value))}
              placeholder="2.00"
              className="h-9 w-full rounded-md border border-border bg-card pl-7 pr-3 text-[14px] tabular-nums text-quest-ink placeholder:text-quest-ink-faint outline-none focus:ring-1 focus:ring-quest-accent"
            />
          </div>
          <span className="text-[11px] text-quest-ink-faint">
            Maximum spend on any single player per day
          </span>
        </div>
      </div>

      {/* Projections panel */}
      <div className="flex w-[200px] shrink-0 flex-col gap-3 rounded-lg border border-border bg-quest-surface-muted/50 p-4">
        <span className="text-[12px] font-medium uppercase tracking-wide text-quest-ink-faint">
          Projections
        </span>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-quest-ink-faint">Est. agents</span>
            <span className="text-[24px] font-medium tabular-nums text-quest-ink">
              {projections.estimatedAgents > 0 ? projections.estimatedAgents.toLocaleString() : "\u2014"}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-quest-ink-faint">Calibration time</span>
            <span className="text-[24px] font-medium tabular-nums text-quest-ink">
              {projections.calibrationDays > 0 ? `${projections.calibrationDays}d` : "\u2014"}
            </span>
            <span className="text-[11px] text-quest-ink-faint">
              Before full optimization
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
