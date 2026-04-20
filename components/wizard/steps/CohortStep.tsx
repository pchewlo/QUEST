'use client'

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import type { CohortFilter } from "@/lib/types"

type CohortStepProps = {
  filter: CohortFilter
  onChange: (filter: CohortFilter) => void
}

type PresetConfig = {
  id: string
  label: string
  filter: Partial<CohortFilter>
}

const presets: PresetConfig[] = [
  { id: "recreational", label: "Recreational", filter: { stakeBand: ["low", "medium"], lifecycle: ["active"] } },
  { id: "new_players", label: "New players", filter: { lifecycle: ["new"] } },
  { id: "lapsed_7", label: "Lapsed 7+", filter: { lifecycle: ["lapsed"] } },
  { id: "vips", label: "VIPs", filter: { stakeBand: ["vip"] } },
]

type StakeBand = NonNullable<CohortFilter['stakeBand']>[number]
type Lifecycle = NonNullable<CohortFilter['lifecycle']>[number]
type GamesPlayed = NonNullable<CohortFilter['gamesPlayed']>[number]

const stakeBandOptions: { value: StakeBand; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "vip", label: "VIP" },
]

const lifecycleOptions: { value: Lifecycle; label: string }[] = [
  { value: "new", label: "New" },
  { value: "active", label: "Active" },
  { value: "at_risk", label: "At risk" },
  { value: "lapsed", label: "Lapsed" },
  { value: "returning", label: "Returning" },
]

const gamesOptions: { value: GamesPlayed; label: string }[] = [
  { value: "slots", label: "Slots" },
  { value: "sports", label: "Sports" },
  { value: "live_casino", label: "Live casino" },
  { value: "poker", label: "Poker" },
]

function MultiSelect<V extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: { value: V; label: string }[]
  selected: V[]
  onToggle: (value: V) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium uppercase tracking-wide text-quest-ink-faint">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isActive = selected.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-[12px] transition-colors",
                isActive
                  ? "border-quest-accent bg-quest-accent-soft text-quest-accent font-medium"
                  : "border-border bg-card text-quest-ink-muted hover:bg-quest-surface-muted",
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function estimateCohortSize(filter: CohortFilter): number {
  // Simulated cohort size based on filter selections
  let base = 12400
  if (filter.stakeBand?.length) base = Math.floor(base * (filter.stakeBand.length / 4))
  if (filter.lifecycle?.length) base = Math.floor(base * (filter.lifecycle.length / 5))
  if (filter.gamesPlayed?.length) base = Math.floor(base * (filter.gamesPlayed.length / 4))
  if (filter.stakeBand?.includes("vip")) base = Math.min(base, 340)
  if (filter.lifecycle?.includes("lapsed")) base = Math.min(base, 2100)
  if (filter.lifecycle?.includes("new")) base = Math.min(base, 1800)
  return base
}

export function CohortStep({ filter, onChange }: CohortStepProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const cohortSize = useMemo(() => estimateCohortSize(filter), [filter])

  function applyPreset(preset: PresetConfig) {
    setActivePreset(preset.id)
    onChange({ ...filter, ...preset.filter })
  }

  function toggleValue<K extends keyof CohortFilter>(
    key: K,
    value: CohortFilter[K] extends (infer U)[] | undefined ? U : never,
  ) {
    setActivePreset(null)
    const current = (filter[key] as string[] | undefined) ?? []
    const next = current.includes(value as string)
      ? current.filter((v) => v !== value)
      : [...current, value]
    onChange({ ...filter, [key]: next.length > 0 ? next : undefined })
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-quest-ink-muted">
        Define which players this plan targets. Start with a preset or build custom rules.
      </p>

      {/* Presets */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-medium uppercase tracking-wide text-quest-ink-faint">
          Presets
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-[12px] transition-colors",
                activePreset === preset.id
                  ? "border-quest-accent bg-quest-accent-soft text-quest-accent font-medium"
                  : "border-border bg-card text-quest-ink-muted hover:bg-quest-surface-muted",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3.5">
        <MultiSelect
          label="Stake band"
          options={stakeBandOptions}
          selected={filter.stakeBand ?? []}
          onToggle={(v) => toggleValue("stakeBand", v)}
        />
        <MultiSelect
          label="Lifecycle"
          options={lifecycleOptions}
          selected={filter.lifecycle ?? []}
          onToggle={(v) => toggleValue("lifecycle", v)}
        />
        <MultiSelect
          label="Games played"
          options={gamesOptions}
          selected={filter.gamesPlayed ?? []}
          onToggle={(v) => toggleValue("gamesPlayed", v)}
        />
      </div>

      {/* Live cohort counter */}
      <div className="flex items-center gap-2 rounded-md border border-border bg-quest-surface-muted/50 px-3 py-2.5">
        <span className="text-[12px] text-quest-ink-faint">Estimated cohort size:</span>
        <span className="text-[14px] font-medium tabular-nums text-quest-ink">
          {cohortSize.toLocaleString()} players
        </span>
      </div>
    </div>
  )
}
