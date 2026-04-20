'use client'

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus } from "lucide-react"
import { getDB } from "@/lib/mock/db"
import { DataTable } from "@/components/DataTable"
import { StatusPill } from "@/components/StatusPill"
import type { Plan, PlanObjective } from "@/lib/types"

const objectiveLabels: Record<PlanObjective, string> = {
  retain_at_risk: "Retain at-risk",
  win_back_lapsed: "Win back lapsed",
  new_player_nurture: "New player nurture",
  responsible_ltv_growth: "LTV growth",
  reduce_loss_chasing: "Reduce loss chasing",
}

const statusOrder: Record<Plan['status'], number> = {
  active: 0,
  calibrating: 1,
  paused: 2,
  draft: 3,
  ended: 4,
}

type PlanRow = {
  id: string
  name: string
  objective: PlanObjective
  objectiveLabel: string
  status: Plan['status']
  dailyBudget: number
  spendToday: number
  cpep: number
  retentionLift: number
  safetyFlags: number
  [key: string]: unknown
}

export default function PlansPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [objectiveFilter, setObjectiveFilter] = useState<string>("all")

  const db = getDB()

  const planRows: PlanRow[] = useMemo(() => {
    const plans = db.plans

    return plans
      .map((plan) => {
        const stats = db.getPlanStats(plan.id)
        // Generate realistic spend today (60-85% of budget for active, less for others)
        let spendPct: number
        if (plan.status === 'active') {
          spendPct = 0.60 + (Math.abs(plan.id.charCodeAt(5) % 25) / 100)
        } else if (plan.status === 'calibrating') {
          spendPct = 0.35 + (Math.abs(plan.id.charCodeAt(6) % 20) / 100)
        } else {
          spendPct = 0.02
        }
        const spendToday = Math.round(plan.dailyBudgetTotal * spendPct * 100) / 100

        return {
          id: plan.id,
          name: plan.name,
          objective: plan.objective,
          objectiveLabel: objectiveLabels[plan.objective],
          status: plan.status,
          dailyBudget: plan.dailyBudgetTotal,
          spendToday,
          cpep: stats.cpep,
          retentionLift: stats.retentionLift,
          safetyFlags: stats.totalSafetyEvents,
        }
      })
      .sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
  }, [db])

  const filteredRows = useMemo(() => {
    let rows = planRows

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.objectiveLabel.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== "all") {
      rows = rows.filter((r) => r.status === statusFilter)
    }

    if (objectiveFilter !== "all") {
      rows = rows.filter((r) => r.objective === objectiveFilter)
    }

    return rows
  }, [planRows, searchQuery, statusFilter, objectiveFilter])

  const columns = [
    {
      key: "name",
      label: "Plan",
      render: (row: PlanRow) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium text-quest-ink">{row.name}</span>
          <span className="text-[11px] text-quest-ink-faint">{row.objectiveLabel}</span>
        </div>
      ),
      width: "240px",
    },
    {
      key: "status",
      label: "Status",
      render: (row: PlanRow) => <StatusPill status={row.status} />,
      width: "120px",
    },
    {
      key: "dailyBudget",
      label: "Daily budget",
      align: "right" as const,
      sortable: true,
      render: (row: PlanRow) => (
        <span className="tabular-nums">{"\u00A3"}{row.dailyBudget.toLocaleString()}</span>
      ),
      width: "120px",
    },
    {
      key: "spendToday",
      label: "Spend today",
      align: "right" as const,
      sortable: true,
      render: (row: PlanRow) => (
        <span className="tabular-nums">{"\u00A3"}{row.spendToday.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
      ),
      width: "120px",
    },
    {
      key: "cpep",
      label: "CPEP",
      align: "right" as const,
      sortable: true,
      render: (row: PlanRow) => (
        <span className="tabular-nums">{"\u00A3"}{row.cpep.toFixed(2)}</span>
      ),
      width: "90px",
    },
    {
      key: "retentionLift",
      label: "Retention lift",
      align: "right" as const,
      sortable: true,
      render: (row: PlanRow) => (
        <div className="flex flex-col items-end gap-0.5">
          <span className="tabular-nums text-quest-success font-medium">+{row.retentionLift.toFixed(1)}%</span>
          <span className="text-[10px] text-quest-ink-faint">vs. control</span>
        </div>
      ),
      width: "110px",
    },
    {
      key: "safetyFlags",
      label: "Safety",
      align: "right" as const,
      sortable: true,
      render: (row: PlanRow) => (
        <span className="tabular-nums">{row.safetyFlags}</span>
      ),
      width: "80px",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-medium text-quest-ink">Plans</h1>
        <button
          onClick={() => router.push("/plans/new")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-quest-accent px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-quest-accent/90"
        >
          <Plus size={14} strokeWidth={2} />
          Create plan
        </button>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            strokeWidth={1.5}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-quest-ink-faint"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plans..."
            className="h-8 w-full rounded-md border border-border bg-card pl-8 pr-3 text-[13px] text-quest-ink placeholder:text-quest-ink-faint outline-none focus:ring-1 focus:ring-quest-accent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 rounded-md border border-border bg-card px-2.5 text-[13px] text-quest-ink outline-none focus:ring-1 focus:ring-quest-accent"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="calibrating">Calibrating</option>
          <option value="paused">Paused</option>
          <option value="ended">Ended</option>
          <option value="draft">Draft</option>
        </select>

        <select
          value={objectiveFilter}
          onChange={(e) => setObjectiveFilter(e.target.value)}
          className="h-8 rounded-md border border-border bg-card px-2.5 text-[13px] text-quest-ink outline-none focus:ring-1 focus:ring-quest-accent"
        >
          <option value="all">All objectives</option>
          <option value="retain_at_risk">Retain at-risk</option>
          <option value="win_back_lapsed">Win back lapsed</option>
          <option value="new_player_nurture">New player nurture</option>
          <option value="responsible_ltv_growth">LTV growth</option>
          <option value="reduce_loss_chasing">Reduce loss chasing</option>
        </select>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredRows}
        columns={columns}
        rowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/plans/${row.id}`)}
        emptyMessage="No plans match your filters"
      />
    </div>
  )
}
