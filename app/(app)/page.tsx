'use client'

import { useMemo } from "react"
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

  // Last 7 days for the chart
  const chartData = useMemo(() => {
    const last7 = timeSeries.slice(-7)
    return last7.map((point) => ({
      date: point.date.slice(5), // "04-14" format
      spend: Math.round(point.spend),
      retentionLift: point.retentionLift,
    }))
  }, [timeSeries])

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
      render: (row: Plan & { cpep: number; retentionLift: number }) => (
        <StatusPill status={row.status} />
      ),
    },
  ], [])

  const spendProgress = (kpis.todaySpend / kpis.todayBudget) * 100

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-4">
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
        <KPICard
          label="Retention lift"
          value={kpis.retentionLift.toFixed(1)}
          suffix="%"
          delta="vs. control"
          deltaType="positive"
          subtitle="+18.4pp above baseline"
        />
        <KPICard
          label="Safety interventions"
          value={kpis.safetyToday}
          delta="today"
          deltaType="neutral"
        />
      </div>

      {/* Main content: Chart + Live Feed */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left: Performance chart */}
        <div className="col-span-2 rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-[15px] font-medium text-quest-ink">
            Performance &middot; last 7 days
          </h2>
          <AreaChartComponent
            data={chartData}
            xKey="date"
            series={[
              { key: "spend", label: "Spend (\u00A3)", color: "#7A3029", type: "area" },
              { key: "retentionLift", label: "Retention lift (%)", color: "#3B6D2E", type: "line" },
            ]}
            height={300}
            yAxisLeft="Spend (\u00A3)"
            yAxisRight="Retention (%)"
          />
        </div>

        {/* Right: Live feed */}
        <div className="col-span-1 flex flex-col [&>div]:flex-1 [&>div]:max-h-[380px]">
          <LiveFeed decisions={liveFeed} maxItems={20} />
        </div>
      </div>

      {/* Active plans table */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-medium text-quest-ink">Active plans</h2>
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
