'use client'

import { cn } from "@/lib/utils"
import { Shield, UserPlus, Sprout, TrendingUp, Heart } from "lucide-react"
import type { PlanObjective } from "@/lib/types"

type ObjectiveOption = {
  id: PlanObjective
  title: string
  description: string
  icon: React.ElementType
  cpep: string
}

const objectives: ObjectiveOption[] = [
  {
    id: "retain_at_risk",
    title: "Retain at-risk",
    description: "Keep players showing churn signals engaged",
    icon: Shield,
    cpep: "Typical CPEP \u00A30.40\u20130.80",
  },
  {
    id: "win_back_lapsed",
    title: "Win back lapsed",
    description: "Reactivate players after 7+ days idle",
    icon: UserPlus,
    cpep: "Typical CPEP \u00A30.60\u20131.20",
  },
  {
    id: "new_player_nurture",
    title: "New player nurture",
    description: "Guide players through their first 30 days",
    icon: Sprout,
    cpep: "Typical CPEP \u00A30.30\u20130.60",
  },
  {
    id: "responsible_ltv_growth",
    title: "Grow LTV responsibly",
    description: "Increase lifetime value within RG envelope",
    icon: TrendingUp,
    cpep: "Typical CPEP \u00A30.80\u20131.50",
  },
  {
    id: "reduce_loss_chasing",
    title: "Reduce loss chasing",
    description: "Identify and intervene on loss-chasing behaviour",
    icon: Heart,
    cpep: "Typical CPEP \u00A30.20\u20130.50",
  },
]

type ObjectiveStepProps = {
  selected?: PlanObjective
  onSelect: (objective: PlanObjective) => void
}

export function ObjectiveStep({ selected, onSelect }: ObjectiveStepProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="mb-1 text-[13px] text-quest-ink-muted">
        What should QUEST optimize for?
      </p>

      {objectives.map((obj) => {
        const Icon = obj.icon
        const isSelected = selected === obj.id
        return (
          <button
            key={obj.id}
            type="button"
            onClick={() => onSelect(obj.id)}
            className={cn(
              "flex items-start gap-3.5 rounded-lg border p-4 text-left transition-colors",
              isSelected
                ? "border-quest-accent bg-quest-accent-soft/40"
                : "border-border bg-card hover:bg-quest-surface-muted/50",
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                isSelected
                  ? "bg-quest-accent text-white"
                  : "bg-quest-surface-muted text-quest-ink-faint",
              )}
            >
              <Icon size={18} strokeWidth={1.5} />
            </div>

            <div className="flex flex-col gap-0.5">
              <span
                className={cn(
                  "text-[14px] font-medium",
                  isSelected ? "text-quest-accent" : "text-quest-ink",
                )}
              >
                {obj.title}
              </span>
              <span className="text-[13px] text-quest-ink-muted">
                {obj.description}
              </span>
              <span className="mt-1 text-[11px] text-quest-ink-faint">
                {obj.cpep}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
