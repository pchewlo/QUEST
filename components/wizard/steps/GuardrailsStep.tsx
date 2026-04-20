'use client'

import { cn } from "@/lib/utils"
import type { Guardrails } from "@/lib/types"

type GuardrailsStepProps = {
  guardrails: Guardrails
  onChange: (guardrails: Guardrails) => void
  selectedTemplates: string[]
  onTemplatesChange: (templates: string[]) => void
}

type TemplateOption = {
  id: string
  name: string
  archetype: string
  description: string
}

const availableTemplates: TemplateOption[] = [
  { id: "t1", name: "Daily streak", archetype: "streak", description: "Progressive reward for consecutive logins" },
  { id: "t2", name: "Free spin drop", archetype: "free_spin", description: "Surprise free spins on favoured slot" },
  { id: "t3", name: "Cashback safety net", archetype: "cashback", description: "Loss-triggered partial refund" },
  { id: "t4", name: "Bonus bet unlock", archetype: "bonus_bet", description: "Earned bonus bet after qualifying play" },
  { id: "t5", name: "Take a break nudge", archetype: "cooldown_nudge", description: "Gentle reminder after extended sessions" },
  { id: "t6", name: "F2P challenge", archetype: "f2p_engagement", description: "Free-to-play mini-game challenge" },
]

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-quest-accent" : "bg-quest-surface-muted border border-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </button>
      <div className="flex flex-col">
        <span className="text-[13px] font-medium text-quest-ink">{label}</span>
        {description && (
          <span className="text-[12px] text-quest-ink-faint">{description}</span>
        )}
      </div>
    </label>
  )
}

function NumberControl({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  suffix,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-quest-ink">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-8 w-[72px] rounded-md border border-border bg-card px-2 text-center text-[13px] tabular-nums text-quest-ink outline-none focus:ring-1 focus:ring-quest-accent"
        />
        {suffix && (
          <span className="text-[12px] text-quest-ink-faint">{suffix}</span>
        )}
      </div>
    </div>
  )
}

export function GuardrailsStep({
  guardrails,
  onChange,
  selectedTemplates,
  onTemplatesChange,
}: GuardrailsStepProps) {
  function update(partial: Partial<Guardrails>) {
    onChange({ ...guardrails, ...partial })
  }

  function toggleTemplate(id: string) {
    if (selectedTemplates.includes(id)) {
      onTemplatesChange(selectedTemplates.filter((t) => t !== id))
    } else {
      onTemplatesChange([...selectedTemplates, id])
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[13px] text-quest-ink-muted">
        Configure safety limits and select mission templates for this plan.
      </p>

      {/* Safety controls */}
      <div className="flex flex-col gap-4">
        <span className="text-[12px] font-medium uppercase tracking-wide text-quest-ink-faint">
          Safety controls
        </span>

        <NumberControl
          label="Max missions per player per day"
          value={guardrails.maxMissionsPerPlayerPerDay}
          onChange={(v) => update({ maxMissionsPerPlayerPerDay: v })}
          min={1}
          max={20}
        />

        <NumberControl
          label="Max bonus value per player per day"
          value={guardrails.maxBonusValuePerPlayerPerDay}
          onChange={(v) => update({ maxBonusValuePerPlayerPerDay: v })}
          min={0}
          max={100}
          step={0.5}
          suffix="\u00A3"
        />

        <Toggle
          checked={guardrails.coolOffAfterLoss}
          onChange={(v) => update({ coolOffAfterLoss: v })}
          label="Cool-off after loss sequence"
          description="Pause missions for a player after 3+ consecutive losses"
        />

        <Toggle
          checked={guardrails.complianceReviewRequired}
          onChange={(v) => update({ complianceReviewRequired: v })}
          label="Require compliance review"
          description="New mission types must be approved before deployment"
        />

        <div className="flex items-center gap-2 rounded-md bg-quest-surface-muted/50 px-3 py-2 border border-border">
          <span className="text-[12px] text-quest-ink-faint">
            Self-exclusion is always respected (non-configurable)
          </span>
        </div>
      </div>

      {/* Template picker */}
      <div className="flex flex-col gap-3">
        <span className="text-[12px] font-medium uppercase tracking-wide text-quest-ink-faint">
          Mission templates
        </span>
        <p className="text-[12px] text-quest-ink-faint">
          Select which templates agents can use. At least one required.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {availableTemplates.map((template) => {
            const isSelected = selectedTemplates.includes(template.id)
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => toggleTemplate(template.id)}
                className={cn(
                  "flex flex-col gap-0.5 rounded-lg border p-3 text-left transition-colors",
                  isSelected
                    ? "border-quest-accent bg-quest-accent-soft/40"
                    : "border-border bg-card hover:bg-quest-surface-muted/50",
                )}
              >
                <span
                  className={cn(
                    "text-[13px] font-medium",
                    isSelected ? "text-quest-accent" : "text-quest-ink",
                  )}
                >
                  {template.name}
                </span>
                <span className="text-[11px] text-quest-ink-faint">
                  {template.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
