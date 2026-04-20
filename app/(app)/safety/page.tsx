'use client'

import { useMemo } from "react"
import { getDB } from "@/lib/mock/db"
import { KPICard } from "@/components/KPICard"
import { DataTable } from "@/components/DataTable"
import { QuestBadge } from "@/components/QuestBadge"
import { AreaChartComponent } from "@/components/charts/AreaChart"
import { SafetyEvent } from "@/lib/types"
import { Download } from "lucide-react"

const EVENT_TYPE_LABELS: Record<SafetyEvent["type"], string> = {
  frequency_cap_hit: "Frequency cap",
  spend_cap_hit: "Spend cap",
  rg_override: "RG override",
  self_exclusion_respected: "Self-exclusion",
  loss_sequence_cooldown: "Loss cooldown",
}

const ACTION_BADGE_VARIANT: Record<SafetyEvent["action"], "rg_hold" | "rg_caution" | "info" | "neutral"> = {
  blocked: "rg_hold",
  held: "rg_caution",
  redirected: "info",
  logged: "neutral",
}

export default function SafetyPage() {
  const db = getDB()
  const safetyEvents = db.safetyEvents
  const plans = db.plans

  // KPI calculations
  const today = new Date().toISOString().split("T")[0]
  const todayEvents = safetyEvents.filter((e) => e.timestamp.startsWith(today))
  const interventionsToday = todayEvents.length || 23
  const rgOverrides = todayEvents.filter((e) => e.type === "rg_override").length || 8
  const cooldownsTriggered = todayEvents.filter(
    (e) => e.type === "loss_sequence_cooldown" || e.type === "frequency_cap_hit"
  ).length || 31
  const spendBlocked = todayEvents
    .filter((e) => e.type === "spend_cap_hit")
    .length * 120 || 2847

  // Chart data: RG intervention types over last 7 days
  const chartData = useMemo(() => {
    const days: string[] = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      days.push(d.toISOString().split("T")[0])
    }

    return days.map((day) => {
      const dayEvents = safetyEvents.filter((e) => e.timestamp.startsWith(day))
      const dayLabel = new Date(day).toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })

      return {
        date: dayLabel,
        frequency_cap: dayEvents.filter((e) => e.type === "frequency_cap_hit").length,
        spend_cap: dayEvents.filter((e) => e.type === "spend_cap_hit").length,
        rg_override: dayEvents.filter((e) => e.type === "rg_override").length,
        self_exclusion: dayEvents.filter((e) => e.type === "self_exclusion_respected").length,
        loss_cooldown: dayEvents.filter((e) => e.type === "loss_sequence_cooldown").length,
      }
    })
  }, [safetyEvents])

  // Table data: last 100
  const tableData = safetyEvents.slice(0, 100)

  const columns = [
    {
      key: "timestamp",
      label: "Timestamp",
      sortable: true,
      render: (row: SafetyEvent) => {
        const d = new Date(row.timestamp)
        return (
          <span className="text-[12px] tabular-nums text-quest-ink-muted">
            {d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}{" "}
            {d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )
      },
    },
    {
      key: "playerId",
      label: "Player ID",
      sortable: true,
      render: (row: SafetyEvent) => (
        <span className="font-medium text-quest-ink">{row.playerId}</span>
      ),
    },
    {
      key: "planId",
      label: "Plan",
      render: (row: SafetyEvent) => {
        const plan = plans.find((p) => p.id === row.planId)
        return <span className="text-quest-ink-muted">{plan?.name ?? row.planId}</span>
      },
    },
    {
      key: "type",
      label: "Event type",
      sortable: true,
      render: (row: SafetyEvent) => (
        <span className="text-[13px] text-quest-ink">{EVENT_TYPE_LABELS[row.type]}</span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (row: SafetyEvent) => (
        <QuestBadge variant={ACTION_BADGE_VARIANT[row.action]}>
          {row.action.toUpperCase()}
        </QuestBadge>
      ),
    },
    {
      key: "auditNote",
      label: "Audit note",
      width: "30%",
      render: (row: SafetyEvent) => (
        <span className="text-[12px] text-quest-ink-muted line-clamp-2">{row.auditNote}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header with export */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-medium text-quest-ink">Safety</h1>
          <p className="mt-1 text-[14px] text-quest-ink-muted">
            Compliance audit centre
          </p>
        </div>
        <button
          onClick={() => alert("Export audit report — this would generate a CSV/PDF in production.")}
          className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-[13px] font-medium text-quest-ink-muted hover:bg-quest-surface-muted transition-colors"
        >
          <Download size={14} />
          Export audit report
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <KPICard
          label="Interventions today"
          value={interventionsToday}
          delta="safety events"
          deltaType="neutral"
        />
        <KPICard
          label="Self-exclusion respect"
          value="100%"
          delta="always"
          deltaType="positive"
        />
        <KPICard
          label="RG overrides"
          value={rgOverrides}
          delta="today"
          deltaType="neutral"
        />
        <KPICard
          label="Cooldowns triggered"
          value={cooldownsTriggered}
          delta="today"
          deltaType="neutral"
        />
        <KPICard
          label="Spend blocked"
          value={`\u00A3${spendBlocked.toLocaleString()}`}
          delta="today"
          deltaType="neutral"
        />
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-[14px] font-medium text-quest-ink">
          RG intervention types — last 7 days
        </h2>
        <AreaChartComponent
          data={chartData}
          xKey="date"
          height={260}
          series={[
            { key: "frequency_cap", label: "Frequency cap", color: "#6366f1" },
            { key: "spend_cap", label: "Spend cap", color: "#f59e0b" },
            { key: "rg_override", label: "RG override", color: "#ef4444" },
            { key: "self_exclusion", label: "Self-exclusion", color: "#8b5cf6" },
            { key: "loss_cooldown", label: "Loss cooldown", color: "#06b6d4" },
          ]}
        />
      </div>

      {/* Safety event log */}
      <div>
        <h2 className="mb-3 text-[14px] font-medium text-quest-ink">
          Safety event log
          <span className="ml-2 text-[12px] font-normal text-quest-ink-faint">
            Last 100 events
          </span>
        </h2>
        <DataTable
          data={tableData as unknown as Record<string, unknown>[]}
          columns={columns as Parameters<typeof DataTable>[0]["columns"]}
          rowKey={(row) => (row as unknown as SafetyEvent).id}
          searchable
          searchPlaceholder="Search events..."
        />
      </div>
    </div>
  )
}
