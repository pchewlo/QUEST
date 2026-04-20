'use client'

import { use, useMemo } from "react"
import { getDB } from "@/lib/mock/db"
import { QuestBadge } from "@/components/QuestBadge"
import { StatusPill } from "@/components/StatusPill"
import { Decision } from "@/lib/types"
import {
  Zap,
  Gift,
  Pause,
  MinusCircle,
  Gamepad2,
  ArrowDownCircle,
  ShieldAlert,
  ShieldOff,
  Clock,
  Activity,
  Sun,
  TrendingDown,
  Flag,
  Banknote,
  Heart,
  Brain,
} from "lucide-react"

// Deterministic pseudo-random from a string seed
function hashSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function pickWeighted<T>(items: T[], weights: number[], rand: () => number): T {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rand() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

const DECISION_CONFIG: Record<Decision["type"], { label: string; colorClass: string; icon: React.ReactNode }> = {
  mission: { label: "Mission", colorClass: "bg-quest-accent", icon: <Zap size={14} /> },
  bonus: { label: "Bonus", colorClass: "bg-quest-success", icon: <Gift size={14} /> },
  cooldown: { label: "Cooldown", colorClass: "bg-quest-info", icon: <Pause size={14} /> },
  no_action: { label: "No action", colorClass: "bg-quest-surface-muted", icon: <MinusCircle size={14} /> },
  f2p: { label: "F2P", colorClass: "bg-purple-500", icon: <Gamepad2 size={14} /> },
  cashback_deferred: { label: "Cashback (deferred)", colorClass: "bg-amber-500", icon: <ArrowDownCircle size={14} /> },
  held_rg: { label: "RG Hold", colorClass: "bg-quest-danger", icon: <ShieldAlert size={14} /> },
  blocked_rg: { label: "RG Block", colorClass: "bg-quest-danger", icon: <ShieldOff size={14} /> },
}

const OUTCOME_CONFIG: Record<string, { label: string; colorClass: string }> = {
  engaged: { label: "Engaged", colorClass: "text-quest-success" },
  ignored: { label: "Ignored", colorClass: "text-quest-ink-faint" },
  pending: { label: "Pending", colorClass: "text-quest-warning" },
  churned: { label: "Churned", colorClass: "text-quest-danger" },
}

const SIGNALS = [
  "post-loss", "slot-preference", "morning-session", "win-streak",
  "churn-score-high", "returning-after-gap", "vip-tier-upgrade",
  "loss-chasing-detected", "weekend-active", "low-engagement-3d",
  "deposit-decline", "session-duration-long", "stake-escalation",
  "multi-game-player", "evening-session", "first-week-player",
  "high-frequency-bettor", "cashout-pattern",
]

const TEMPLATE_IDS = [
  "tpl-morning-free-spin", "tpl-streak-3-wins", "tpl-scratch-card-morning",
  "tpl-match-deposit-50", "tpl-cashback-weekend", "tpl-f2p-daily-quiz",
  "tpl-cooldown-gentle", "tpl-high-stake-match", "tpl-loss-recovery-10",
  "tpl-welcome-streak-7day",
]

function generatePlayerDecisions(playerId: string): Decision[] {
  const seed = hashSeed(playerId)
  const rand = seededRandom(seed)
  const decisions: Decision[] = []
  const db = getDB()
  const planIds = db.plans.map((p) => p.id)

  const now = new Date()

  for (let i = 0; i < 24; i++) {
    const minutesAgo = Math.floor(rand() * 2880) // up to 48h ago
    const ts = new Date(now.getTime() - minutesAgo * 60000)

    const planId = planIds[Math.floor(rand() * planIds.length)]

    const type = pickWeighted<Decision["type"]>(
      ["mission", "bonus", "cooldown", "no_action", "f2p", "cashback_deferred", "held_rg", "blocked_rg"],
      [38, 28, 8, 7, 6, 5, 5, 3],
      rand,
    )

    const numSignals = Math.floor(rand() * 3) + 2
    const signals: string[] = []
    for (let s = 0; s < numSignals; s++) {
      const sig = SIGNALS[Math.floor(rand() * SIGNALS.length)]
      if (!signals.includes(sig)) signals.push(sig)
    }

    if (type === "held_rg" || type === "blocked_rg") {
      signals.length = 0
      signals.push("loss-chasing-detected")
      if (rand() > 0.5) signals.push("stake-escalation")
      if (rand() > 0.5) signals.push("session-duration-long")
    }

    let cost = 0
    let costState: Decision["costState"] = "none"
    let missionTemplateId: string | undefined

    if (type === "mission" || type === "bonus") {
      cost = parseFloat((rand() * 4 + 0.3).toFixed(2))
      costState = "spent"
      missionTemplateId = TEMPLATE_IDS[Math.floor(rand() * TEMPLATE_IDS.length)]
    } else if (type === "cashback_deferred") {
      cost = parseFloat((rand() * 2 + 0.2).toFixed(2))
      costState = "deferred"
    } else if (type === "f2p") {
      cost = parseFloat((rand() * 0.5 + 0.15).toFixed(2))
      costState = "spent"
    }

    const outcome = pickWeighted<Decision["outcome"]>(
      ["engaged", "ignored", "pending", "churned"],
      minutesAgo < 60 ? [30, 10, 55, 5] : [55, 25, 5, 15],
      rand,
    )

    decisions.push({
      id: `player-dec-${i}`,
      agentId: `agent-${planId.replace("plan-", "")}-${String(Math.floor(rand() * 300)).padStart(4, "0")}`,
      playerId: `#${playerId}`,
      planId,
      timestamp: ts.toISOString(),
      type,
      missionTemplateId,
      cost,
      costState,
      signals,
      outcome,
      outcomeKnownAt: outcome !== "pending" ? new Date(ts.getTime() + rand() * 1800000).toISOString() : undefined,
    })
  }

  decisions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return decisions
}

function generateSignalState(playerId: string) {
  const seed = hashSeed(playerId + "-signals")
  const rand = seededRandom(seed)

  const streakLetters = ["W", "L"]
  const streak = Array.from({ length: 5 }, () => streakLetters[rand() > 0.45 ? 0 : 1])

  const sessionHours = Math.floor(rand() * 4)
  const sessionMins = Math.floor(rand() * 60)

  const dayparts = ["Morning session", "Afternoon session", "Evening session", "Late night session"]
  const daypart = dayparts[Math.floor(rand() * dayparts.length)]

  const churnScore = Math.floor(rand() * 100)

  const rgFlags = rand() > 0.75
    ? (rand() > 0.5 ? ["stake-escalation"] : ["session-duration-long"])
    : []

  const depositDays = Math.floor(rand() * 14) + 1
  const depositAmount = Math.floor(rand() * 100) + 10

  const gameTypes = ["Slots", "Sports", "Live casino", "Poker"]
  const gameWeights = [45, 25, 20, 10]
  const favGame = pickWeighted(gameTypes, gameWeights, rand)
  const favPct = Math.floor(rand() * 40 + 55)

  const stakeBands = ["Low", "Medium", "High", "VIP"] as const
  const stakeBand = pickWeighted([...stakeBands], [30, 40, 20, 10], rand)

  const lifecycles = ["New", "Active", "At risk", "Lapsed", "Returning"] as const
  const lifecycle = pickWeighted([...lifecycles], [15, 40, 25, 10, 10], rand)

  const rgTiers = ["None", "Monitored", "Restricted"] as const
  const rgTier = pickWeighted([...rgTiers], [80, 15, 5], rand)

  const daysSinceSignup = Math.floor(rand() * 365) + 7

  const planNames = ["Recreational retention", "Weekend win-back", "New player nurture", "VIP growth programme"]
  const assignedPlans = planNames.filter(() => rand() > 0.5)
  if (assignedPlans.length === 0) assignedPlans.push(planNames[0])

  const nextEvalMins = Math.floor(rand() * 8) + 2

  return {
    streak,
    sessionLength: `${sessionHours}h ${String(sessionMins).padStart(2, "0")}m`,
    daypart,
    churnScore,
    rgFlags,
    lastDeposit: { amount: depositAmount, daysAgo: depositDays },
    favGame,
    favPct,
    stakeBand,
    lifecycle,
    rgTier,
    daysSinceSignup,
    assignedPlans,
    nextEvalMins,
  }
}

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ playerId: string }>
}) {
  const { playerId } = use(params)

  const decisions = useMemo(() => generatePlayerDecisions(playerId), [playerId])
  const signals = useMemo(() => generateSignalState(playerId), [playerId])

  function formatTime(isoString: string) {
    const d = new Date(isoString)
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  }

  function formatDate(isoString: string) {
    const d = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  }

  const isRgType = (type: Decision["type"]) => type === "held_rg" || type === "blocked_rg"

  return (
    <div className="space-y-6">
      {/* Player card */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
          <div>
            <h1 className="text-[32px] font-medium text-quest-ink">#{playerId}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wide text-quest-ink-faint">Stake band</span>
              <span className="text-[14px] font-medium text-quest-ink">{signals.stakeBand}</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wide text-quest-ink-faint">Lifecycle</span>
              <span className="text-[14px] font-medium text-quest-ink">{signals.lifecycle}</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wide text-quest-ink-faint">RG tier</span>
              <span className="text-[14px] font-medium text-quest-ink">
                {signals.rgTier === "Monitored" ? (
                  <QuestBadge variant="rg_caution">MONITORED</QuestBadge>
                ) : signals.rgTier === "Restricted" ? (
                  <QuestBadge variant="rg_hold">RESTRICTED</QuestBadge>
                ) : (
                  "None"
                )}
              </span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wide text-quest-ink-faint">Days since signup</span>
              <span className="text-[14px] font-medium text-quest-ink">{signals.daysSinceSignup}</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wide text-quest-ink-faint">Plans</span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {signals.assignedPlans.map((p) => (
                  <QuestBadge key={p} variant="info">{p}</QuestBadge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[65%_35%]">
        {/* Left: Decision timeline */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-[16px] font-medium text-quest-ink">Decision timeline</h2>

          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-[83px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-0">
              {decisions.map((d, idx) => {
                const config = DECISION_CONFIG[d.type]
                const outcomeConf = d.outcome ? OUTCOME_CONFIG[d.outcome] : null
                const isRg = isRgType(d.type)

                return (
                  <div
                    key={d.id}
                    className={`relative flex gap-4 py-3 ${idx < decisions.length - 1 ? "border-b border-border/50" : ""} ${isRg ? "bg-red-50/50 dark:bg-red-950/10 -mx-5 px-5 rounded" : ""}`}
                  >
                    {/* Timestamp */}
                    <div className="w-16 shrink-0 pt-0.5 text-right">
                      <span className="text-[12px] text-quest-ink-faint">{formatDate(d.timestamp)}</span>
                      <br />
                      <span className="text-[11px] text-quest-ink-faint">{formatTime(d.timestamp)}</span>
                    </div>

                    {/* Dot */}
                    <div className="relative z-10 flex shrink-0 items-start pt-1">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full ${config.colorClass} text-white`}>
                        {config.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[13px] font-medium ${isRg ? "text-quest-danger" : "text-quest-ink"}`}>
                          {config.label}
                        </span>
                        {d.cost > 0 && (
                          <span className="text-[12px] tabular-nums text-quest-ink-muted">
                            {"\u00A3"}{d.cost.toFixed(2)}
                            {d.costState === "deferred" && (
                              <span className="ml-1 text-quest-warning">(deferred)</span>
                            )}
                          </span>
                        )}
                        {outcomeConf && (
                          <span className={`text-[12px] font-medium ${outcomeConf.colorClass}`}>
                            {outcomeConf.label}
                          </span>
                        )}
                      </div>

                      {/* Signals */}
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {d.signals.map((sig) => (
                          <span
                            key={sig}
                            className="inline-flex rounded px-1.5 py-0.5 text-[10px] bg-quest-surface-muted text-quest-ink-faint"
                          >
                            {sig}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Signal state panel */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 text-[14px] font-medium uppercase tracking-wide text-quest-ink-faint">
              Live signal state
            </h3>

            <div className="space-y-4">
              {/* Win/loss streak */}
              <div className="flex items-center gap-3">
                <Activity size={16} className="shrink-0 text-quest-ink-faint" />
                <div className="flex-1">
                  <span className="text-[12px] text-quest-ink-faint">Win/loss streak</span>
                  <div className="mt-0.5 flex gap-1">
                    {signals.streak.map((letter, i) => (
                      <span
                        key={i}
                        className={`inline-flex h-6 w-6 items-center justify-center rounded text-[12px] font-bold ${
                          letter === "W"
                            ? "bg-quest-success-soft text-quest-success"
                            : "bg-quest-danger-soft text-quest-danger"
                        }`}
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Session length */}
              <div className="flex items-center gap-3">
                <Clock size={16} className="shrink-0 text-quest-ink-faint" />
                <div className="flex-1">
                  <span className="text-[12px] text-quest-ink-faint">Session length</span>
                  <p className="text-[14px] font-medium text-quest-ink">{signals.sessionLength}</p>
                </div>
              </div>

              {/* Time of day */}
              <div className="flex items-center gap-3">
                <Sun size={16} className="shrink-0 text-quest-ink-faint" />
                <div className="flex-1">
                  <span className="text-[12px] text-quest-ink-faint">Time of day</span>
                  <p className="text-[14px] font-medium text-quest-ink">{signals.daypart}</p>
                </div>
              </div>

              {/* Churn score */}
              <div className="flex items-center gap-3">
                <TrendingDown size={16} className="shrink-0 text-quest-ink-faint" />
                <div className="flex-1">
                  <span className="text-[12px] text-quest-ink-faint">Churn score</span>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-[14px] font-medium tabular-nums text-quest-ink">
                      {signals.churnScore}/100
                    </span>
                    <div className="h-1.5 flex-1 rounded-full bg-quest-surface-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          signals.churnScore > 75
                            ? "bg-quest-danger"
                            : signals.churnScore > 50
                            ? "bg-quest-warning"
                            : "bg-quest-success"
                        }`}
                        style={{ width: `${signals.churnScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RG flags */}
              <div className="flex items-center gap-3">
                <Flag size={16} className="shrink-0 text-quest-ink-faint" />
                <div className="flex-1">
                  <span className="text-[12px] text-quest-ink-faint">RG flags</span>
                  <p className="text-[14px] font-medium text-quest-ink">
                    {signals.rgFlags.length > 0 ? (
                      <span className="flex gap-1.5">
                        {signals.rgFlags.map((f) => (
                          <QuestBadge key={f} variant="rg_caution">{f}</QuestBadge>
                        ))}
                      </span>
                    ) : (
                      "None"
                    )}
                  </p>
                </div>
              </div>

              {/* Last deposit */}
              <div className="flex items-center gap-3">
                <Banknote size={16} className="shrink-0 text-quest-ink-faint" />
                <div className="flex-1">
                  <span className="text-[12px] text-quest-ink-faint">Last deposit</span>
                  <p className="text-[14px] font-medium text-quest-ink">
                    {"\u00A3"}{signals.lastDeposit.amount} &middot; {signals.lastDeposit.daysAgo} days ago
                  </p>
                </div>
              </div>

              {/* Favourite game */}
              <div className="flex items-center gap-3">
                <Heart size={16} className="shrink-0 text-quest-ink-faint" />
                <div className="flex-1">
                  <span className="text-[12px] text-quest-ink-faint">Favourite game type</span>
                  <p className="text-[14px] font-medium text-quest-ink">
                    {signals.favGame} ({signals.favPct}%)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="rounded-lg border border-border border-l-4 border-l-quest-accent bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-quest-accent" />
              <h3 className="text-[14px] font-medium text-quest-ink">What happens next</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-quest-accent" />
                <p className="text-[13px] text-quest-ink-muted">
                  Next evaluation: ~{signals.nextEvalMins} minutes
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-quest-accent" />
                <p className="text-[13px] text-quest-ink-muted">
                  Will trigger if: churn score exceeds 75 or session ends without engagement
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
