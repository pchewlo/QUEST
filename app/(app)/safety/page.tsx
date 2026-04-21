'use client'

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const db = getDB()
  const safetyEvents = db.safetyEvents
  const plans = db.plans
  const [actionFilter, setActionFilter] = useState<string>("all")

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

  // Table data: last 100, with action filter
  const tableData = useMemo(() => {
    let data = safetyEvents.slice(0, 100)
    if (actionFilter !== "all") {
      data = data.filter((e) => e.action === actionFilter)
    }
    return data
  }, [safetyEvents, actionFilter])

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
        <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-0.5 ring-1 ring-green-200 dark:ring-green-800">
          <KPICard
            label="Self-exclusion respect"
            value="100%"
            delta="always"
            deltaType="positive"
          />
        </div>
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

        {/* Action filter buttons */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {(["all", "blocked", "held", "redirected"] as const).map((a) => {
            const label = a === "all" ? "All" : `${a.charAt(0).toUpperCase() + a.slice(1)} only`
            const isActive = actionFilter === a
            return (
              <button
                key={a}
                onClick={() => setActionFilter(a)}
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
          data={tableData as unknown as Record<string, unknown>[]}
          columns={columns as Parameters<typeof DataTable>[0]["columns"]}
          rowKey={(row) => (row as unknown as SafetyEvent).id}
          searchable
          searchPlaceholder="Search events..."
          onRowClick={(row) => {
            const event = row as unknown as SafetyEvent
            router.push(`/agents/${event.playerId.replace("#", "")}`)
          }}
        />
      </div>
    </div>
  )
}
