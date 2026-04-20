'use client'

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

export default function TemplatesPage() {
  const db = getDB()
  const templates = db.templates

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
      sortable: true,
      render: (row: MissionTemplate) => (
        <span className="tabular-nums text-quest-ink-muted">
          {"\u00A3"}{row.expectedCostRange[0].toFixed(2)} – {"\u00A3"}{row.expectedCostRange[1].toFixed(2)}
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

      <DataTable
        data={templates as unknown as Record<string, unknown>[]}
        columns={columns as Parameters<typeof DataTable>[0]["columns"]}
        rowKey={(row) => (row as unknown as MissionTemplate).id}
        searchable
        searchPlaceholder="Search templates..."
      />
    </div>
  )
}
