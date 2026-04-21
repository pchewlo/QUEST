'use client'

import { useState, useMemo } from "react"
import { getDB } from "@/lib/mock/db"
import { DataTable } from "@/components/DataTable"
import { QuestBadge } from "@/components/QuestBadge"
import { MissionTemplate, PlanObjective } from "@/lib/types"

const ARCHETYPE_LABELS: Record<MissionTemplate["archetype"], { label: string; variant: "info" | "success" | "warning" | "neutral" | "rg_caution" | "rg_hold" }> = {
  streak: { label: "Streak", variant: "info" },
  bonus_bet: { label: "Bonus bet", variant: "success" },
  free_spin: { label: "Free spin", variant: "warning" },
  cashback: { label: "Cashback", variant: "neutral" },
  f2p_engagement: { label: "F2P", variant: "rg_caution" },
  cooldown_nudge: { label: "Cooldown", variant: "rg_hold" },
}

const OBJECTIVE_LABELS: Record<PlanObjective, string> = {
  retain_at_risk: "Retain at risk",
  win_back_lapsed: "Win back",
  new_player_nurture: "Nurture",
  responsible_ltv_growth: "LTV growth",
  reduce_loss_chasing: "Loss chasing",
}

// Deterministic pseudo-random from template ID
function hashId(id: string, seed: number): number {
  let h = seed
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

const ALL_ARCHETYPES: MissionTemplate["archetype"][] = [
  "streak", "bonus_bet", "free_spin", "cashback", "f2p_engagement", "cooldown_nudge",
]

export default function TemplatesPage() {
  const db = getDB()
  const templates = db.templates

  const [archetypeFilters, setArchetypeFilters] = useState<Set<string>>(new Set())
  const [complianceFilter, setComplianceFilter] = useState<string>("all")

  const filteredTemplates = useMemo(() => {
    let result = templates
    if (archetypeFilters.size > 0) {
      result = result.filter((t) => archetypeFilters.has(t.archetype))
    }
    if (complianceFilter === "approved") {
      result = result.filter((t) => t.complianceApprovedAt !== null)
    } else if (complianceFilter === "pending") {
      result = result.filter((t) => t.complianceApprovedAt === null)
    }
    return result
  }, [templates, archetypeFilters, complianceFilter])

  function toggleArchetype(arch: string) {
    setArchetypeFilters((prev) => {
      const next = new Set(prev)
      if (next.has(arch)) next.delete(arch)
      else next.add(arch)
      return next
    })
  }

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      width: "28%",
      render: (row: MissionTemplate) => (
        <span className="font-medium text-quest-ink">{row.name}</span>
      ),
    },
    {
      key: "archetype",
      label: "Archetype",
      sortable: true,
      render: (row: MissionTemplate) => {
        const config = ARCHETYPE_LABELS[row.archetype]
        return <QuestBadge variant={config.variant}>{config.label}</QuestBadge>
      },
    },
    {
      key: "fitsObjectives",
      label: "Objectives",
      width: "25%",
      render: (row: MissionTemplate) => (
        <div className="flex flex-wrap gap-1">
          {row.fitsObjectives.map((obj) => (
            <span
              key={obj}
              className="inline-flex rounded px-1.5 py-0.5 text-[10px] bg-quest-surface-muted text-quest-ink-faint"
            >
              {OBJECTIVE_LABELS[obj]}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "costRange",
      label: "Cost range",
      align: "right" as const,
      render: (row: MissionTemplate) => (
        <span className="tabular-nums text-quest-ink-muted">
          {"\u00A3"}{row.expectedCostRange[0].toFixed(2)} – {"\u00A3"}{row.expectedCostRange[1].toFixed(2)}
        </span>
      ),
    },
    {
      key: "usedToday",
      label: "Used today",
      align: "right" as const,
      render: (row: MissionTemplate) => (
        <span className="tabular-nums text-quest-ink-muted">
          {(hashId(row.id, 42) % 46) + 5}
        </span>
      ),
    },
    {
      key: "engagementRate",
      label: "Engagement rate",
      align: "right" as const,
      render: (row: MissionTemplate) => (
        <span className="tabular-nums text-quest-ink-muted">
          {(hashId(row.id, 97) % 51) + 15}%
        </span>
      ),
    },
    {
      key: "compliance",
      label: "Compliance",
      render: (row: MissionTemplate) => {
        if (row.complianceApprovedAt) {
          return <QuestBadge variant="success">APPROVED</QuestBadge>
        }
        return <QuestBadge variant="warning">PENDING</QuestBadge>
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[32px] font-medium text-quest-ink">Templates</h1>
        <p className="mt-1 text-[14px] text-quest-ink-muted">
          {templates.length} mission templates
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-quest-ink-faint mr-1">Archetype:</span>
        {ALL_ARCHETYPES.map((arch) => {
          const config = ARCHETYPE_LABELS[arch]
          const isActive = archetypeFilters.has(arch)
          return (
            <button
              key={arch}
              onClick={() => toggleArchetype(arch)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                isActive
                  ? "bg-quest-accent-soft text-quest-accent"
                  : "border border-border text-quest-ink-muted hover:bg-quest-surface-muted"
              }`}
            >
              {config.label}
            </button>
          )
        })}

        <span className="ml-3 text-[12px] text-quest-ink-faint mr-1">Compliance:</span>
        {(["all", "approved", "pending"] as const).map((s) => {
          const label = s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)
          const isActive = complianceFilter === s
          return (
            <button
              key={s}
              onClick={() => setComplianceFilter(s)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                isActive
                  ? "bg-quest-accent-soft text-quest-accent"
                  : "border border-border text-quest-ink-muted hover:bg-quest-surface-muted"
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <DataTable
        data={filteredTemplates as unknown as Record<string, unknown>[]}
        columns={columns as Parameters<typeof DataTable>[0]["columns"]}
        rowKey={(row) => (row as unknown as MissionTemplate).id}
        searchable
        searchPlaceholder="Search templates..."
      />
    </div>
  )
}
