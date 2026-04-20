'use client'

import { use } from "react"

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ playerId: string }>
}) {
  const { playerId } = use(params)

  return (
    <div className="space-y-6">
      <h1 className="text-[32px] font-medium text-quest-ink">Player #{playerId}</h1>
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-card p-20">
        <p className="text-[14px] text-quest-ink-faint">
          Agent drill-down — coming in Phase 4
        </p>
      </div>
    </div>
  )
}
