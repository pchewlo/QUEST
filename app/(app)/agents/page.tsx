'use client'

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { getDB } from "@/lib/mock/db"
import { DataTable } from "@/components/DataTable"
import { StatusPill } from "@/components/StatusPill"
import { QuestBadge } from "@/components/QuestBadge"
import { Agent } from "@/lib/types"

export default function AgentsPage() {
  const router = useRouter()
  const db = getDB()

  const [searchQuery, setSearchQuery] = useState("")
  const [planFilter, setPlanFilter] = useState<string>("all")
  const [rgFilter, setRgFilter] = useState<string>("all")
  const [stateFilter, setStateFilter] = useState<string>("all")

  const plans = db.plans

  const filteredAgents = useMemo(() => {
    let agents = db.agents

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      agents = agents.filter((a) => a.playerId.toLowerCase().includes(q))
    }

    if (planFilter !== "all") {
      agents = agents.filter((a) => a.planId === planFilter)
    }

    if (rgFilter !== "all") {
      agents = agents.filter((a) => a.rgStatus === rgFilter)
    }

    if (stateFilter !== "all") {
      agents = agents.filter((a) => a.state === stateFilter)
    }

    return agents.slice(0, 50)
  }, [db.agents, searchQuery, planFilter, rgFilter, stateFilter])

  const totalCount = db.agents.length

  const columns = [
    {
      key: "playerId",
      label: "Player ID",
      sortable: true,
      render: (row: Agent) => (
        <span className="font-medium text-quest-ink">{row.playerId}</span>
      ),
    },
    {
      key: "planId",
      label: "Plan",
      render: (row: Agent) => {
        const plan = plans.find((p) => p.id === row.planId)
        return <span className="text-quest-ink-muted">{plan?.name ?? row.planId}</span>
      },
    },
    {
      key: "state",
      label: "State",
      sortable: true,
      render: (row: Agent) => <StatusPill status={row.state} />,
    },
    {
      key: "last24hDecisions",
      label: "Decisions (24h)",
      align: "right" as const,
      render: (row: Agent) => (
        <span className="tabular-nums">{row.last24h.decisions}</span>
      ),
    },
    {
      key: "last24hSpend",
      label: "Spend (24h)",
      align: "right" as const,
      render: (row: Agent) => (
        <span className="tabular-nums">{"\u00A3"}{row.last24h.spend.toFixed(2)}</span>
      ),
    },
    {
      key: "engagedMinutes",
      label: "Engaged mins",
      align: "right" as const,
      render: (row: Agent) => (
        <span className="tabular-nums">{row.last24h.engagedMinutes}</span>
      ),
    },
    {
      key: "rgStatus",
      label: "RG Status",
      render: (row: Agent) => {
        if (row.rgStatus === "none") return null
        if (row.rgStatus === "monitored") {
          return <QuestBadge variant="rg_caution">MONITORED</QuestBadge>
        }
        return <QuestBadge variant="rg_hold">RESTRICTED</QuestBadge>
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[32px] font-medium text-quest-ink">Agents</h1>
        <p className="mt-1 text-[14px] text-quest-ink-muted">
          12,847 active across {plans.filter((p) => p.status === "active").length} plans
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by player ID..."
          className="h-9 w-56 rounded-md border border-border bg-quest-surface-muted px-3 text-[13px] text-quest-ink placeholder:text-quest-ink-faint outline-none focus:ring-1 focus:ring-quest-accent"
        />

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="h-9 rounded-md border border-border bg-quest-surface-muted px-3 text-[13px] text-quest-ink outline-none focus:ring-1 focus:ring-quest-accent"
        >
          <option value="all">All plans</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={rgFilter}
          onChange={(e) => setRgFilter(e.target.value)}
          className="h-9 rounded-md border border-border bg-quest-surface-muted px-3 text-[13px] text-quest-ink outline-none focus:ring-1 focus:ring-quest-accent"
        >
          <option value="all">All RG status</option>
          <option value="none">None</option>
          <option value="monitored">Monitored</option>
          <option value="restricted">Restricted</option>
        </select>

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="h-9 rounded-md border border-border bg-quest-surface-muted px-3 text-[13px] text-quest-ink outline-none focus:ring-1 focus:ring-quest-accent"
        >
          <option value="all">All states</option>
          <option value="active">Active</option>
          <option value="cooldown">Cooldown</option>
          <option value="held">Held</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* Count label */}
      <p className="text-[12px] text-quest-ink-faint">
        Showing {filteredAgents.length} of {totalCount.toLocaleString()}
      </p>

      {/* Table */}
      <DataTable
        data={filteredAgents as unknown as Record<string, unknown>[]}
        columns={columns as Parameters<typeof DataTable>[0]["columns"]}
        rowKey={(row) => (row as unknown as Agent).id}
        onRowClick={(row) => {
          const agent = row as unknown as Agent
          router.push(`/agents/${agent.playerId.replace("#", "")}`)
        }}
      />
    </div>
  )
}
