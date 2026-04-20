'use client'

import { use, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Copy, Pencil } from "lucide-react"
import { getDB } from "@/lib/mock/db"
import { KPICard } from "@/components/KPICard"
import { StatusPill } from "@/components/StatusPill"
import { QuestBadge } from "@/components/QuestBadge"
import { DataTable } from "@/components/DataTable"
import { AreaChartComponent } from "@/components/charts/AreaChart"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { Plan, PlanObjective, Agent, Decision, SafetyEvent } from "@/lib/types"

const objectiveLabels: Record<PlanObjective, string> = {
  retain_at_risk: "Retain at-risk",
  win_back_lapsed: "Win back lapsed",
  new_player_nurture: "New player nurture",
  responsible_ltv_growth: "LTV growth",
  reduce_loss_chasing: "Reduce loss chasing",
}

function getDaysAgo(dateStr: string): number {
  const created = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
}

function getControlComparison(plan: Plan) {
  // Realistic control comparison data
  if (plan.status === 'calibrating') {
    return { control: 3.2, quest: 8.1, lift: 4.9 }
  }
  // Vary by plan to make it feel real
  const seed = plan.id.charCodeAt(5) + plan.id.charCodeAt(10)
  const controlBase = 4 + (seed % 3)
  const questBase = 18 + (seed % 8)
  return {
    control: controlBase + (seed % 10) / 10,
    quest: questBase + (seed % 10) / 10,
    lift: questBase - controlBase + (seed % 10) / 10,
  }
}

export default function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const db = getDB()
  const plan = db.getPlan(id)

  if (!plan) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/plans")}
          className="inline-flex items-center gap-1.5 text-[13px] text-quest-ink-muted hover:text-quest-ink transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Plans
        </button>
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-card p-20">
          <p className="text-[14px] text-quest-ink-faint">
            Plan not found
          </p>
        </div>
      </div>
    )
  }

  const stats = db.getPlanStats(plan.id)
  const timeSeries = db.getTimeSeries(plan.id)
  const agents = db.getAgentsForPlan(plan.id)
  const decisions = db.getDecisionsForPlan(plan.id)
  const safetyEvents = db.getSafetyEventsForPlan(plan.id)
  const templates = db.getTemplatesForPlan(plan.id)
  const daysAgo = getDaysAgo(plan.createdAt)
  const comparison = getControlComparison(plan)

  // Spend today as a percentage of budget
  const spendPct = (plan.status === 'active' || plan.status === 'calibrating') && plan.dailyBudgetTotal > 0
    ? Math.min(100, Math.round((stats.todaySpend / plan.dailyBudgetTotal) * 100))
    : 0

  // Chart data
  const chartData = timeSeries.map((point) => ({
    date: point.date.slice(5), // "04-10" format
    spend: point.spend,
    retentionLift: point.retentionLift,
  }))

  // Agent table columns
  const agentColumns = [
    {
      key: "playerId",
      label: "Player",
      render: (row: Agent & Record<string, unknown>) => (
        <span className="font-mono text-[12px]">{row.playerId}</span>
      ),
      width: "160px",
    },
    {
      key: "state",
      label: "State",
      render: (row: Agent & Record<string, unknown>) => <StatusPill status={row.state} />,
      width: "100px",
    },
    {
      key: "decisions24h",
      label: "Decisions 24h",
      align: "right" as const,
      render: (row: Agent & Record<string, unknown>) => (
        <span className="tabular-nums">{row.last24h.decisions}</span>
      ),
      width: "110px",
    },
    {
      key: "spend24h",
      label: "Spend 24h",
      align: "right" as const,
      render: (row: Agent & Record<string, unknown>) => (
        <span className="tabular-nums">{"\u00A3"}{row.last24h.spend.toFixed(2)}</span>
      ),
      width: "100px",
    },
    {
      key: "rgStatus",
      label: "RG status",
      render: (row: Agent & Record<string, unknown>) => {
        if (row.rgStatus === "restricted") return <QuestBadge variant="rg_hold">Restricted</QuestBadge>
        if (row.rgStatus === "monitored") return <QuestBadge variant="rg_caution">Monitored</QuestBadge>
        return <span className="text-[12px] text-quest-ink-faint">None</span>
      },
      width: "110px",
    },
  ]

  // Decision table columns
  const decisionColumns = [
    {
      key: "timestamp",
      label: "Time",
      render: (row: Decision & Record<string, unknown>) => (
        <span className="text-[12px] text-quest-ink-muted">
          {new Date(row.timestamp).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
      width: "140px",
    },
    {
      key: "playerId",
      label: "Player",
      render: (row: Decision & Record<string, unknown>) => (
        <span className="font-mono text-[12px]">{row.playerId}</span>
      ),
      width: "140px",
    },
    {
      key: "type",
      label: "Type",
      render: (row: Decision & Record<string, unknown>) => (
        <QuestBadge variant={row.type === "held_rg" || row.type === "blocked_rg" ? "rg_hold" : row.type === "cooldown" ? "info" : "neutral"}>
          {(row.type as string).replace(/_/g, " ")}
        </QuestBadge>
      ),
      width: "130px",
    },
    {
      key: "signals",
      label: "Signals",
      render: (row: Decision & Record<string, unknown>) => (
        <span className="text-[12px] text-quest-ink-muted truncate max-w-[200px] block">
          {(row.signals as string[]).slice(0, 2).join(", ")}
        </span>
      ),
      width: "200px",
    },
    {
      key: "cost",
      label: "Cost",
      align: "right" as const,
      sortable: true,
      render: (row: Decision & Record<string, unknown>) => (
        <span className="tabular-nums">{row.cost > 0 ? `\u00A3${(row.cost as number).toFixed(2)}` : "\u2014"}</span>
      ),
      width: "80px",
    },
    {
      key: "outcome",
      label: "Outcome",
      render: (row: Decision & Record<string, unknown>) => {
        const outcome = row.outcome as string | undefined
        if (!outcome || outcome === "pending") return <span className="text-[12px] text-quest-ink-faint">Pending</span>
        if (outcome === "engaged") return <QuestBadge variant="success">Engaged</QuestBadge>
        if (outcome === "churned") return <QuestBadge variant="rg_hold">Churned</QuestBadge>
        return <QuestBadge variant="warning">Ignored</QuestBadge>
      },
      width: "90px",
    },
  ]

  // Safety table columns
  const safetyColumns = [
    {
      key: "timestamp",
      label: "Time",
      render: (row: SafetyEvent & Record<string, unknown>) => (
        <span className="text-[12px] text-quest-ink-muted">
          {new Date(row.timestamp).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
      width: "140px",
    },
    {
      key: "playerId",
      label: "Player",
      render: (row: SafetyEvent & Record<string, unknown>) => (
        <span className="font-mono text-[12px]">{row.playerId}</span>
      ),
      width: "140px",
    },
    {
      key: "type",
      label: "Type",
      render: (row: SafetyEvent & Record<string, unknown>) => (
        <QuestBadge variant="rg_caution">
          {(row.type as string).replace(/_/g, " ")}
        </QuestBadge>
      ),
      width: "180px",
    },
    {
      key: "action",
      label: "Action",
      render: (row: SafetyEvent & Record<string, unknown>) => (
        <QuestBadge variant={row.action === "blocked" ? "rg_hold" : row.action === "held" ? "warning" : "info"}>
          {row.action as string}
        </QuestBadge>
      ),
      width: "100px",
    },
    {
      key: "auditNote",
      label: "Audit note",
      render: (row: SafetyEvent & Record<string, unknown>) => (
        <span className="text-[12px] text-quest-ink-muted">{row.auditNote as string}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => router.push("/plans")}
        className="inline-flex items-center gap-1.5 text-[13px] text-quest-ink-muted hover:text-quest-ink transition-colors"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Plans
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-[32px] font-medium text-quest-ink">{plan.name}</h1>
            <StatusPill status={plan.status} />
          </div>
          <div className="flex items-center gap-3">
            <QuestBadge variant="neutral">{objectiveLabels[plan.objective]}</QuestBadge>
            <span className="text-[12px] text-quest-ink-faint">Created {daysAgo} days ago</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-medium text-quest-ink transition-colors hover:bg-quest-surface-muted">
            <Pencil size={13} strokeWidth={1.5} />
            Edit
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-medium text-quest-ink transition-colors hover:bg-quest-surface-muted">
            <Copy size={13} strokeWidth={1.5} />
            Duplicate
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-5 gap-4">
        <KPICard
          label="Active agents"
          value={stats.activeAgents}
          subtitle={`${stats.totalAgents} total`}
        />
        <KPICard
          label="Spend today"
          prefix={"\u00A3"}
          value={stats.todaySpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          subtitle={`of \u00A3${plan.dailyBudgetTotal.toLocaleString()} budget`}
          progress={spendPct}
        />
        <KPICard
          label="CPEP"
          prefix={"\u00A3"}
          value={stats.cpep.toFixed(2)}
          delta={plan.status === 'active' ? "-12% vs week 1" : undefined}
          deltaType="positive"
        />
        <KPICard
          label="Retention lift"
          value={`+${stats.retentionLift.toFixed(1)}`}
          suffix="%"
          subtitle="vs. control group"
          delta={plan.status === 'active' ? "Significant" : "Calibrating"}
          deltaType={plan.status === 'active' ? "positive" : "neutral"}
        />
        <KPICard
          label="Safety interventions"
          value={stats.totalSafetyEvents}
          subtitle={`${stats.monitoredPlayers} monitored, ${stats.restrictedPlayers} restricted`}
        />
      </div>

      {/* Control comparison callout */}
      <div className="rounded-lg border border-quest-accent/20 bg-quest-accent-soft/20 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-quest-ink-faint">Rules-based control</span>
              <span className="text-[20px] font-medium tabular-nums text-quest-ink-muted">+{comparison.control.toFixed(1)}%</span>
              <span className="text-[11px] text-quest-ink-faint">retention</span>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-quest-accent">QUEST AI</span>
              <span className="text-[20px] font-medium tabular-nums text-quest-accent">+{comparison.quest.toFixed(1)}%</span>
              <span className="text-[11px] text-quest-ink-faint">retention</span>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-quest-success">Incremental lift</span>
              <span className="text-[20px] font-medium tabular-nums text-quest-success">+{comparison.lift.toFixed(1)}pp</span>
              <span className="text-[11px] text-quest-ink-faint">above control</span>
            </div>
          </div>
          <div className="text-[12px] text-quest-ink-faint max-w-[180px] text-right">
            {plan.controlGroupPct}% holdout group &middot; {plan.status === 'calibrating' ? 'Gathering signal' : 'Statistically significant'}
          </div>
        </div>
      </div>

      {/* Performance chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-[14px] font-medium text-quest-ink">Performance over time</h3>
        <AreaChartComponent
          data={chartData}
          xKey="date"
          series={[
            { key: "spend", label: "Daily spend (\u00A3)", color: "#7A3029" },
            { key: "retentionLift", label: "Retention lift (%)", color: "#3B6D2E", type: "line" },
          ]}
          height={260}
          yAxisLeft="Spend (\u00A3)"
          yAxisRight="Lift (%)"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="agents">
        <TabsList variant="line">
          <TabsTrigger value="agents">Agents ({agents.length})</TabsTrigger>
          <TabsTrigger value="decisions">Decisions ({decisions.length})</TabsTrigger>
          <TabsTrigger value="safety">Safety ({safetyEvents.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="pt-4">
          <DataTable
            data={agents as unknown as (Agent & Record<string, unknown>)[]}
            columns={agentColumns}
            rowKey={(row) => row.id as string}
            searchable
            searchPlaceholder="Search players..."
            emptyMessage="No agents in this plan"
          />
        </TabsContent>

        <TabsContent value="decisions" className="pt-4">
          <DataTable
            data={decisions.slice(0, 50) as unknown as (Decision & Record<string, unknown>)[]}
            columns={decisionColumns}
            rowKey={(row) => row.id as string}
            searchable
            searchPlaceholder="Search decisions..."
            emptyMessage="No decisions recorded"
          />
        </TabsContent>

        <TabsContent value="safety" className="pt-4">
          <DataTable
            data={safetyEvents as unknown as (SafetyEvent & Record<string, unknown>)[]}
            columns={safetyColumns}
            rowKey={(row) => row.id as string}
            searchable
            searchPlaceholder="Search safety events..."
            emptyMessage="No safety events"
          />
        </TabsContent>

        <TabsContent value="settings" className="pt-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Objective & Budget */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="mb-3 text-[12px] font-medium uppercase tracking-wide text-quest-ink-faint">Objective & Budget</h4>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-[13px] text-quest-ink-muted">Objective</span>
                  <span className="text-[13px] font-medium text-quest-ink">{objectiveLabels[plan.objective]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-quest-ink-muted">Daily budget</span>
                  <span className="text-[13px] font-medium tabular-nums text-quest-ink">{"\u00A3"}{plan.dailyBudgetTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-quest-ink-muted">Per-player cap</span>
                  <span className="text-[13px] font-medium tabular-nums text-quest-ink">{"\u00A3"}{plan.perPlayerDailyCap.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-quest-ink-muted">Control group</span>
                  <span className="text-[13px] font-medium tabular-nums text-quest-ink">{plan.controlGroupPct}%</span>
                </div>
              </div>
            </div>

            {/* Guardrails */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="mb-3 text-[12px] font-medium uppercase tracking-wide text-quest-ink-faint">Guardrails</h4>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-[13px] text-quest-ink-muted">Max missions/player/day</span>
                  <span className="text-[13px] font-medium tabular-nums text-quest-ink">{plan.guardrails.maxMissionsPerPlayerPerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-quest-ink-muted">Max bonus value/day</span>
                  <span className="text-[13px] font-medium tabular-nums text-quest-ink">{"\u00A3"}{plan.guardrails.maxBonusValuePerPlayerPerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-quest-ink-muted">Cool-off after loss</span>
                  <span className="text-[13px] font-medium text-quest-ink">{plan.guardrails.coolOffAfterLoss ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-quest-ink-muted">Compliance review</span>
                  <span className="text-[13px] font-medium text-quest-ink">{plan.guardrails.complianceReviewRequired ? "Required" : "Not required"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-quest-ink-muted">Self-exclusion</span>
                  <span className="text-[13px] font-medium text-quest-success">Always respected</span>
                </div>
              </div>
            </div>

            {/* Cohort */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="mb-3 text-[12px] font-medium uppercase tracking-wide text-quest-ink-faint">Cohort filters</h4>
              <div className="flex flex-col gap-3">
                {plan.cohortFilter.stakeBand && (
                  <div className="flex justify-between">
                    <span className="text-[13px] text-quest-ink-muted">Stake band</span>
                    <span className="text-[13px] font-medium text-quest-ink">{plan.cohortFilter.stakeBand.join(", ")}</span>
                  </div>
                )}
                {plan.cohortFilter.lifecycle && (
                  <div className="flex justify-between">
                    <span className="text-[13px] text-quest-ink-muted">Lifecycle</span>
                    <span className="text-[13px] font-medium text-quest-ink">{plan.cohortFilter.lifecycle.join(", ")}</span>
                  </div>
                )}
                {plan.cohortFilter.gamesPlayed && (
                  <div className="flex justify-between">
                    <span className="text-[13px] text-quest-ink-muted">Games</span>
                    <span className="text-[13px] font-medium text-quest-ink">{plan.cohortFilter.gamesPlayed.join(", ")}</span>
                  </div>
                )}
                {plan.cohortFilter.rgRiskTier && (
                  <div className="flex justify-between">
                    <span className="text-[13px] text-quest-ink-muted">RG tier</span>
                    <span className="text-[13px] font-medium text-quest-ink">{plan.cohortFilter.rgRiskTier.join(", ")}</span>
                  </div>
                )}
                {plan.cohortFilter.custom && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] text-quest-ink-muted">Custom rule</span>
                    <code className="rounded bg-quest-surface-muted px-2 py-1 text-[11px] text-quest-ink-muted font-mono">{plan.cohortFilter.custom}</code>
                  </div>
                )}
              </div>
            </div>

            {/* Templates */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="mb-3 text-[12px] font-medium uppercase tracking-wide text-quest-ink-faint">Template pool ({templates.length})</h4>
              <div className="flex flex-col gap-2">
                {templates.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-md border border-border bg-quest-surface-muted/30 px-3 py-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-medium text-quest-ink">{t.name}</span>
                      <span className="text-[11px] text-quest-ink-faint">{t.archetype.replace(/_/g, " ")}</span>
                    </div>
                    <span className="text-[11px] tabular-nums text-quest-ink-faint">
                      {"\u00A3"}{t.expectedCostRange[0].toFixed(2)}&ndash;{"\u00A3"}{t.expectedCostRange[1].toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
