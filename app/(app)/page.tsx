'use client'

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { KPICard } from "@/components/KPICard"
import { LiveFeed } from "@/components/LiveFeed"
import { StatusPill } from "@/components/StatusPill"
import { DataTable } from "@/components/DataTable"
import { AreaChartComponent } from "@/components/charts/AreaChart"
import { useSimulator } from "@/lib/mock/simulator"
import { getDB } from "@/lib/mock/db"
import type { Plan, PlanObjective } from "@/lib/types"

// ---- Helpers ----

function formatNumber(n: number): string {
  return n.toLocaleString("en-GB")
}

function formatCurrency(n: number): string {
  return n.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const objectiveLabels: Record<PlanObjective, string> = {
  retain_at_risk: "Retain at-risk players",
  win_back_lapsed: "Win back lapsed players",
  new_player_nurture: "New player nurture",
  responsible_ltv_growth: "Responsible LTV growth",
  reduce_loss_chasing: "Reduce loss chasing",
}

// ---- Page ----

export default function OverviewPage() {
  const router = useRouter()
  const { kpis, liveFeed } = useSimulator()
  const db = getDB()

  const plans = db.plans
  const timeSeries = db.getAggregateTimeSeries()

  // Chart toggle state
  const [chartToggles, setChartToggles] = useState<Record<string, boolean>>({
    spend: true,
    retentionLift: true,
    activeAgents: false,
    safetyInterventions: false,
  })

  function toggleSeries(key: string) {
    setChartToggles((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Last 7 days for the chart
  const chartData = useMemo(() => {
    const last7 = timeSeries.slice(-7)
    return last7.map((point) => ({
      date: point.date.slice(5), // "04-14" format
      spend: Math.round(point.spend),
      retentionLift: point.retentionLift,
      activeAgents: Math.round(point.activeAgents / 1000 * 10) / 10,
      safetyInterventions: point.safetyInterventions,
    }))
  }, [timeSeries])

  // Build visible series list from toggle state
  const allSeriesDefs = [
    { key: "spend", label: "Spend (\u00A3)", color: "#1A2332", type: "area" as const },
    { key: "retentionLift", label: "Retention lift (%)", color: "#3B6D2E", type: "line" as const },
    { key: "activeAgents", label: "Active agents (k)", color: "#185FA5", type: "line" as const },
    { key: "safetyInterventions", label: "Safety interventions", color: "#854F0B", type: "line" as const },
  ]

  const visibleSeries = allSeriesDefs.filter((s) => chartToggles[s.key])

  // Plan table data — enrich with computed stats
  const planTableData = useMemo(() => {
    return plans.map((plan) => {
      const stats = db.getPlanStats(plan.id)
      return {
        ...plan,
        cpep: stats.cpep,
        retentionLift: stats.retentionLift,
      }
    })
  }, [plans, db])

  // Table columns
  const columns = useMemo(() => [
    {
      key: "name",
      label: "Plan",
      render: (row: Plan & { cpep: number; retentionLift: number }) => (
        <div className="flex flex-col">
          <span className="font-medium text-quest-ink">{row.name}</span>
          <span className="text-[11px] text-quest-ink-faint">{objectiveLabels[row.objective]}</span>
        </div>
      ),
    },
    {
      key: "dailyBudgetTotal",
      label: "Daily budget",
      align: "right" as const,
      sortable: true,
      render: (row: Plan & { cpep: number; retentionLift: number }) => (
        <span className="tabular-nums">{"\u00A3"}{formatCurrency(row.dailyBudgetTotal)}</span>
      ),
    },
    {
      key: "cpep",
      label: "CPEP",
      align: "right" as const,
      sortable: true,
      render: (row: Plan & { cpep: number; retentionLift: number }) => (
        <span className="tabular-nums">{"\u00A3"}{row.cpep.toFixed(2)}</span>
      ),
    },
    {
      key: "retentionLift",
      label: "Retention lift",
      align: "right" as const,
      sortable: true,
      render: (row: Plan & { cpep: number; retentionLift: number }) => (
        <div className="flex flex-col items-end">
          <span className="tabular-nums">{row.retentionLift.toFixed(1)}%</span>
          <span className="text-[11px] text-quest-ink-faint">vs. control</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: Plan & { cpep: number; retentionLift: number }) => {
        let supplementary: string | undefined
        if (row.status === "calibrating") {
          const daysSinceCreated = Math.max(1, Math.ceil(
            (Date.now() - new Date(row.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          ))
          supplementary = `Day ${Math.min(daysSinceCreated, 3)} of 3`
        }
        return <StatusPill status={row.status} supplementary={supplementary} />
      },
    },
  ], [])

  const spendProgress = (kpis.todaySpend / kpis.todayBudget) * 100

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-6 gap-4">
        <KPICard
          label="Active agents"
          value={formatNumber(kpis.activeAgents)}
        />
        <KPICard
          label="Today's spend"
          prefix={"\u00A3"}
          value={formatCurrency(kpis.todaySpend)}
          subtitle={`of \u00A3${formatCurrency(kpis.todayBudget)} budget`}
          progress={spendProgress}
        />
        <KPICard
          label="CPEP"
          prefix={"\u00A3"}
          value={kpis.cpep.toFixed(2)}
          delta="-8.2% vs. last week"
          deltaType="positive"
        />

        {/* Double-width retention comparison card */}
        <div className="col-span-2 rounded-lg border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-2">
            {/* QUEST side */}
            <div className="border-r border-border p-4">
              <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "#1A2332" }}>QUEST</span>
              <div className="mt-1">
                <span className="text-[28px] font-medium tabular-nums" style={{ color: "#1A2332" }}>+{kpis.retentionLift.toFixed(1)}%</span>
              </div>
              <span className="text-[11px] text-quest-ink-faint">7-day retention</span>
            </div>
            {/* Control side */}
            <div className="p-4 bg-quest-surface-muted/40">
              <span className="text-[11px] font-medium uppercase tracking-wide text-quest-ink-faint">Rules-based control</span>
              <div className="mt-1">
                <span className="text-[28px] font-medium tabular-nums text-quest-ink-faint">+4.2%</span>
              </div>
              <span className="text-[11px] text-quest-ink-faint">same cohort, held out</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <span className="text-[12px] font-medium tabular-nums text-quest-success">Lift: +{(kpis.retentionLift - 4.2).toFixed(1)}pp</span>
            <span className="text-[11px] text-quest-ink-faint">10% holdout · rules-based baseline</span>
          </div>
        </div>

        <KPICard
          label="Safety interventions"
          value={kpis.safetyToday}
          delta="0.18 per 1k decisions"
          deltaType="neutral"
          subtitle={`${kpis.safetyToday} today`}
        />
      </div>

      {/* Main content: Chart + Live Feed */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left: Performance chart */}
        <div className="col-span-2 rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-medium text-quest-ink">
              Performance &middot; last 7 days
            </h2>
            <div className="flex items-center gap-1.5">
              {allSeriesDefs.map((s) => (
                <button
                  key={s.key}
                  onClick={() => toggleSeries(s.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    chartToggles[s.key]
                      ? "text-white"
                      : "border border-border bg-card text-quest-ink-muted hover:bg-quest-surface-muted"
                  }`}
                  style={chartToggles[s.key] ? { backgroundColor: s.color } : undefined}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: chartToggles[s.key] ? "#fff" : s.color }}
                  />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <AreaChartComponent
            data={chartData}
            xKey="date"
            series={visibleSeries}
            height={360}
            yAxisLeft="Spend (\u00A3)"
            yAxisRight="Retention lift (%)"
            referenceLine={{
              value: 4.2,
              label: "Control baseline",
              color: "#9CA3AF",
              yAxisId: "right",
            }}
          />
        </div>

        {/* Right: Live feed */}
        <div className="col-span-1 flex flex-col [&>div]:flex-1 [&>div]:max-h-[440px]">
          <LiveFeed decisions={liveFeed} maxItems={20} />
        </div>
      </div>

      {/* Active plans table */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-medium text-quest-ink">Plans</h2>
          <Link
            href="/plans"
            className="text-[13px] font-medium text-quest-accent hover:text-quest-accent/80 transition-colors"
          >
            View all &rarr;
          </Link>
        </div>
        <DataTable
          data={planTableData as unknown as Record<string, unknown>[]}
          columns={columns as unknown as { key: string; label: string; render?: (row: Record<string, unknown>) => React.ReactNode; sortable?: boolean; width?: string; align?: "left" | "right" }[]}
          rowKey={(row) => (row as unknown as Plan).id}
          onRowClick={(row) => router.push(`/plans/${(row as unknown as Plan).id}`)}
          searchable
          searchPlaceholder="Search plans..."
        />
      </div>
    </div>
  )
}
