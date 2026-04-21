'use client'

import { use, useMemo, useState, useEffect, useCallback } from "react"
import { getDB } from "@/lib/mock/db"
import { QuestBadge } from "@/components/QuestBadge"
import { StatusPill } from "@/components/StatusPill"
import { Decision } from "@/lib/types"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Deterministic pseudo-random from a string seed
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

const TEMPLATE_NAMES: Record<string, string> = {
  "tpl-morning-free-spin": "Morning free spin",
  "tpl-streak-3-wins": "3-win streak reward",
  "tpl-scratch-card-morning": "Morning scratch card",
  "tpl-match-deposit-50": "50% deposit match",
  "tpl-cashback-weekend": "Weekend cashback",
  "tpl-f2p-daily-quiz": "Daily quiz (F2P)",
  "tpl-cooldown-gentle": "Gentle cooldown nudge",
  "tpl-high-stake-match": "High-stake match bonus",
  "tpl-loss-recovery-10": "10% loss recovery",
  "tpl-welcome-streak-7day": "7-day welcome streak",
}

// ---------------------------------------------------------------------------
// Decision type chip styling — explicit hex-based colors
// ---------------------------------------------------------------------------

const CHIP_CONFIG: Record<Decision["type"], { label: string; bg: string; text: string }> = {
  mission:           { label: "Mission",           bg: "bg-quest-accent-soft",   text: "text-quest-accent" },
  bonus:             { label: "Bonus",             bg: "bg-quest-success-soft",  text: "text-quest-success" },
  cooldown:          { label: "Cooldown",          bg: "bg-quest-info-soft",     text: "text-quest-info" },
  f2p:               { label: "F2P",               bg: "bg-purple-100",          text: "text-purple-700" },
  cashback_deferred: { label: "Cashback",          bg: "bg-quest-warning-soft",  text: "text-quest-warning" },
  no_action:         { label: "No action",         bg: "bg-quest-surface-muted", text: "text-quest-ink-faint" },
  held_rg:           { label: "RG Hold",           bg: "bg-quest-danger-soft",   text: "text-quest-danger" },
  blocked_rg:        { label: "RG Block",          bg: "bg-quest-danger-soft",   text: "text-quest-danger" },
}

const OUTCOME_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  engaged: { label: "Engaged", bg: "bg-quest-success-soft", text: "text-quest-success" },
  ignored: { label: "Ignored", bg: "bg-quest-surface-muted", text: "text-quest-ink-faint" },
  pending: { label: "Pending", bg: "bg-quest-warning-soft", text: "text-quest-warning" },
  churned: { label: "Churned", bg: "bg-quest-danger-soft", text: "text-quest-danger" },
}

// ---------------------------------------------------------------------------
// Summary generation — makes each decision read like a human audit log
// ---------------------------------------------------------------------------

function generateSummary(type: Decision["type"], signals: string[], templateId?: string): string {
  const tplName = templateId ? TEMPLATE_NAMES[templateId] : null

  switch (type) {
    case "mission": {
      if (signals.includes("post-loss") && signals.includes("morning-session"))
        return `Offered morning free spin after post-loss signal`
      if (signals.includes("win-streak"))
        return `Streak mission triggered${tplName ? ` \u00B7 ${tplName}` : ""} \u00B7 riding positive momentum`
      if (signals.includes("returning-after-gap"))
        return `Welcome-back mission \u00B7 player returning after absence`
      if (signals.includes("first-week-player"))
        return `New player nurture mission${tplName ? ` \u00B7 ${tplName}` : ""}`
      if (signals.includes("evening-session"))
        return `Evening engagement mission${tplName ? ` \u00B7 ${tplName}` : ""}`
      if (signals.includes("slot-preference"))
        return `Slot-tailored mission \u00B7 matched to game preference`
      return `Offered mission${tplName ? ` \u00B7 ${tplName}` : ""} \u00B7 standard engagement pattern`
    }
    case "bonus": {
      if (signals.includes("low-engagement-3d"))
        return `Bonus to re-engage \u00B7 3-day low activity detected`
      if (signals.includes("vip-tier-upgrade"))
        return `VIP tier bonus \u00B7 rewarding loyalty progression`
      if (signals.includes("deposit-decline"))
        return `Deposit-match bonus \u00B7 countering deposit decline`
      if (signals.includes("weekend-active"))
        return `Weekend activity bonus${tplName ? ` \u00B7 ${tplName}` : ""}`
      return `Bonus offered${tplName ? ` \u00B7 ${tplName}` : ""} \u00B7 engagement incentive`
    }
    case "cooldown": {
      if (signals.includes("session-duration-long"))
        return `Cooldown period \u00B7 extended session detected, allowing natural break`
      if (signals.includes("high-frequency-bettor"))
        return `Cooldown suggested \u00B7 high bet frequency, pacing intervention`
      return `Cooldown period \u00B7 allowing natural play rhythm`
    }
    case "f2p": {
      if (signals.includes("churn-score-high"))
        return `Free-to-play offer \u00B7 high churn risk, low-cost re-engagement`
      if (signals.includes("first-week-player"))
        return `F2P quiz offered \u00B7 building habit without spend pressure`
      return `Free-to-play engagement \u00B7 no-cost interaction to maintain connection`
    }
    case "cashback_deferred": {
      if (signals.includes("post-loss"))
        return `Deferred cashback queued \u00B7 post-loss cushion, releases tomorrow`
      if (signals.includes("cashout-pattern"))
        return `Cashback deferred \u00B7 aligned with cashout behaviour pattern`
      return `Cashback deferred \u00B7 scheduled for next session return`
    }
    case "no_action": {
      if (signals.includes("win-streak"))
        return `No action taken \u00B7 player in positive streak, no intervention needed`
      if (signals.includes("multi-game-player"))
        return `No action \u00B7 healthy multi-game exploration, monitoring only`
      return `No action \u00B7 player state stable, observation only`
    }
    case "held_rg": {
      const flags = []
      if (signals.includes("loss-chasing-detected")) flags.push("loss chasing detected")
      if (signals.includes("stake-escalation")) flags.push("stake escalation")
      if (signals.includes("session-duration-long")) flags.push("session duration long")
      return `Held action \u2014 ${flags.join(", ") || "RG signals elevated"} \u00B7 pending review`
    }
    case "blocked_rg": {
      const flags = []
      if (signals.includes("loss-chasing-detected")) flags.push("loss chasing detected")
      if (signals.includes("stake-escalation")) flags.push("stake escalation")
      if (signals.includes("session-duration-long")) flags.push("extended session")
      return `Blocked \u2014 ${flags.join(", ") || "RG threshold exceeded"} \u00B7 no action permitted`
    }
    default:
      return "Decision recorded"
  }
}

function generateAuditNote(type: Decision["type"], signals: string[], rand: () => number): string | null {
  if (type !== "held_rg" && type !== "blocked_rg") return null

  const notes = [
    "Automatic hold applied by RG guardrail. Player exceeded loss-chasing threshold (3 consecutive losses with increasing stakes). Manual review required before any further engagement.",
    "Agent action blocked by responsible gambling policy. Session duration exceeds safe-play limit (180 min) combined with loss-chasing pattern. All promotional actions suspended for this evaluation cycle.",
    "RG override triggered. Stake escalation detected (2.4x baseline) during extended session. Action held pending compliance review. Player cooling-off period recommended.",
    "Blocked by safety layer. Multiple risk signals concurrent: loss chasing, high-frequency betting, and deposit decline. No engagement actions permitted until risk score normalises.",
  ]
  return notes[Math.floor(rand() * notes.length)]
}

// ---------------------------------------------------------------------------
// Data generators
// ---------------------------------------------------------------------------

function generatePlayerDecisions(playerId: string): (Decision & { summary: string; auditNote: string | null })[] {
  const seed = hashSeed(playerId)
  const rand = seededRandom(seed)
  const decisions: (Decision & { summary: string; auditNote: string | null })[] = []
  const db = getDB()
  const planIds = db.plans.map((p) => p.id)

  const now = new Date()

  // Generate 28 decisions spread over 48h
  for (let i = 0; i < 28; i++) {
    const minutesAgo = Math.floor(rand() * 2880) // up to 48h ago
    const ts = new Date(now.getTime() - minutesAgo * 60000)

    const planId = planIds[Math.floor(rand() * planIds.length)]

    // Weight distribution: ensure some held_rg/blocked_rg for safety story
    const type = pickWeighted<Decision["type"]>(
      ["mission", "bonus", "cooldown", "no_action", "f2p", "cashback_deferred", "held_rg", "blocked_rg"],
      [30, 22, 10, 8, 6, 6, 10, 8],
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
      if (rand() > 0.4) signals.push("stake-escalation")
      if (rand() > 0.4) signals.push("session-duration-long")
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

    const summary = generateSummary(type, signals, missionTemplateId)
    const auditNote = generateAuditNote(type, signals, rand)

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
      summary,
      auditNote,
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

  // Compute current streak label (e.g. "W3" or "L2")
  let streakLabel = streak[0] + "1"
  let count = 1
  for (let i = 1; i < streak.length; i++) {
    if (streak[i] === streak[i - 1]) {
      count++
    } else {
      break
    }
  }
  streakLabel = `${streak[0]}${count}`

  const churnScore = Math.floor(rand() * 100)

  const rgFlags = rand() > 0.75
    ? (rand() > 0.5 ? ["stake-escalation"] : ["session-duration-long"])
    : []

  const depositDays = Math.floor(rand() * 14) + 1
  const depositAmount = Math.floor(rand() * 100) + 10

  const stakeBands = ["Low", "Medium", "High", "VIP"] as const
  const stakeBand = pickWeighted([...stakeBands], [30, 40, 20, 10], rand)

  const lifecycles = ["New", "Active", "At risk", "Lapsed", "Returning"] as const
  const lifecycle = pickWeighted([...lifecycles], [15, 40, 25, 10, 10], rand)

  const rgTiers = ["None", "Monitored", "Restricted"] as const
  const rgTier = pickWeighted([...rgTiers], [70, 20, 10], rand)

  const daysSinceSignup = Math.floor(rand() * 365) + 7

  const planNames = ["Recreational retention", "Weekend win-back", "New player nurture", "VIP growth programme"]
  const planColors = ["bg-quest-accent", "bg-quest-info", "bg-quest-success", "bg-quest-warning"]
  const assignedPlans = planNames
    .map((name, idx) => ({ name, color: planColors[idx] }))
    .filter(() => rand() > 0.45)
  if (assignedPlans.length === 0) assignedPlans.push({ name: planNames[0], color: planColors[0] })

  const nextEvalMins = Math.floor(rand() * 8) + 2

  const ltvMonthly = parseFloat((rand() * 120 + 15).toFixed(2))

  const states = ["active", "cooldown", "held"] as const
  const playerState = pickWeighted([...states], [70, 20, 10], rand)

  const safetyCount = Math.floor(rand() * 8)

  // Session state seed — will be overridden by ticker
  const sessionStates = ["in_session", "away", "idle"] as const
  const initialSession = pickWeighted([...sessionStates], [50, 30, 20], rand)

  // Next eval conditions
  const conditions = [
    "churn score exceeds 75",
    "session ends without engagement",
    "stake escalation detected",
    "30-min inactivity window",
    "deposit-to-loss ratio exceeds 2:1",
  ]
  const nextConditions = conditions.filter(() => rand() > 0.55)
  if (nextConditions.length === 0) nextConditions.push(conditions[0])

  return {
    streak,
    streakLabel,
    churnScore,
    rgFlags,
    lastDeposit: { amount: depositAmount, daysAgo: depositDays },
    stakeBand,
    lifecycle,
    rgTier,
    daysSinceSignup,
    assignedPlans,
    nextEvalMins,
    ltvMonthly,
    playerState,
    safetyCount,
    initialSession,
    nextConditions,
  }
}

// ---------------------------------------------------------------------------
// Date/time helpers
// ---------------------------------------------------------------------------

function formatTime(isoString: string) {
  const d = new Date(isoString)
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

function getDateGroup(isoString: string): string {
  const d = new Date(isoString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const entryDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())

  if (entryDay.getTime() === today.getTime()) return "Today"
  if (entryDay.getTime() === yesterday.getTime()) return "Yesterday"
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })
}

// ---------------------------------------------------------------------------
// Component: Timeline Entry
// ---------------------------------------------------------------------------

type DecisionEntry = Decision & { summary: string; auditNote: string | null }

function TimelineEntry({ decision }: { decision: DecisionEntry }) {
  const [expanded, setExpanded] = useState(false)
  const chip = CHIP_CONFIG[decision.type]
  const isRg = decision.type === "held_rg" || decision.type === "blocked_rg"
  const outcomeConf = decision.outcome ? OUTCOME_CONFIG[decision.outcome] : null
  const isNoAction = decision.type === "no_action"

  return (
    <div
      className={`group relative flex items-start gap-3 py-3 cursor-pointer transition-colors hover:bg-quest-surface-muted/40 -mx-4 px-4 rounded ${
        isRg ? "border-l-4 border-l-quest-danger bg-quest-danger-soft/30" : ""
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Timestamp */}
      <div className="w-11 shrink-0 pt-0.5 text-right">
        <span className={`text-[12px] tabular-nums ${isNoAction ? "text-quest-ink-faint/60" : "text-quest-ink-faint"}`}>
          {formatTime(decision.timestamp)}
        </span>
      </div>

      {/* Archetype chip */}
      <div className="shrink-0 pt-px">
        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${chip.bg} ${chip.text}`}>
          {chip.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[13px] leading-snug ${isNoAction ? "text-quest-ink-muted" : "text-quest-ink"} ${isRg ? "font-medium" : ""}`}>
            {decision.summary}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            {/* Cost */}
            {decision.cost > 0 ? (
              <span className={`text-[12px] tabular-nums font-medium ${isNoAction ? "text-quest-ink-faint" : "text-quest-ink-muted"}`}>
                {"\u00A3"}{decision.cost.toFixed(2)}
                {decision.costState === "deferred" && (
                  <span className="ml-0.5 text-[10px] text-quest-warning">(def)</span>
                )}
              </span>
            ) : (
              <span className="text-[12px] text-quest-ink-faint">{"\u2014"}</span>
            )}

            {/* Outcome badge */}
            {outcomeConf && (
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${outcomeConf.bg} ${outcomeConf.text}`}>
                {outcomeConf.label}
              </span>
            )}

            {/* Expand indicator */}
            <span className="text-quest-ink-faint opacity-0 group-hover:opacity-100 transition-opacity">
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </span>
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="mt-3 space-y-2.5 border-t border-border/50 pt-3">
            {/* Signals */}
            <div>
              <span className="text-[10px] uppercase tracking-wide text-quest-ink-faint">Triggering signals</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {decision.signals.map((sig) => (
                  <span
                    key={sig}
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      sig === "loss-chasing-detected" || sig === "stake-escalation"
                        ? "bg-quest-danger-soft text-quest-danger"
                        : sig === "session-duration-long"
                        ? "bg-quest-warning-soft text-quest-warning"
                        : "bg-quest-surface-muted text-quest-ink-muted"
                    }`}
                  >
                    {sig}
                  </span>
                ))}
              </div>
            </div>

            {/* Template */}
            {decision.missionTemplateId && (
              <div>
                <span className="text-[10px] uppercase tracking-wide text-quest-ink-faint">Template</span>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="text-[12px] text-quest-ink-muted">
                    {TEMPLATE_NAMES[decision.missionTemplateId] || decision.missionTemplateId}
                  </span>
                  <span className="text-[10px] text-quest-ink-faint font-mono">{decision.missionTemplateId}</span>
                  <ExternalLink size={10} className="text-quest-ink-faint" />
                </div>
              </div>
            )}

            {/* Audit note for safety events */}
            {decision.auditNote && (
              <div className="rounded border border-quest-danger/20 bg-quest-danger-soft/40 p-2.5">
                <div className="flex items-start gap-2">
                  <ShieldAlert size={13} className="text-quest-danger mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wide font-medium text-quest-danger">Safety audit note</span>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-quest-ink-muted">
                      {decision.auditNote}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component: Session State Indicator (live-updating)
// ---------------------------------------------------------------------------

function SessionIndicator({ initial }: { initial: "in_session" | "away" | "idle" }) {
  const [state, setState] = useState(initial)

  useEffect(() => {
    const interval = setInterval(() => {
      const states: ("in_session" | "away" | "idle")[] = ["in_session", "away", "idle"]
      const weights = state === "in_session" ? [60, 30, 10] : state === "away" ? [35, 40, 25] : [25, 30, 45]
      const total = weights.reduce((a, b) => a + b, 0)
      let r = Math.random() * total
      for (let i = 0; i < states.length; i++) {
        r -= weights[i]
        if (r <= 0) { setState(states[i]); break }
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [state])

  const config = {
    in_session: { label: "In session", dotClass: "bg-quest-success", ringClass: "ring-quest-success/30" },
    away:       { label: "Away",       dotClass: "bg-quest-warning", ringClass: "ring-quest-warning/30" },
    idle:       { label: "Idle",       dotClass: "bg-quest-ink-faint", ringClass: "ring-quest-ink-faint/20" },
  }
  const c = config[state]

  return (
    <div className="flex items-center gap-2">
      <span className={`relative flex h-2.5 w-2.5`}>
        {state === "in_session" && (
          <span className={`absolute inset-0 animate-ping rounded-full ${c.dotClass} opacity-40`} />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${c.dotClass} ring-2 ${c.ringClass}`} />
      </span>
      <span className="text-[13px] font-medium text-quest-ink">{c.label}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component: Churn Score (live-drifting)
// ---------------------------------------------------------------------------

function ChurnScore({ initial }: { initial: number }) {
  const [score, setScore] = useState(initial)

  useEffect(() => {
    const interval = setInterval(() => {
      setScore((prev) => {
        const drift = Math.floor((Math.random() - 0.45) * 6)
        return Math.max(0, Math.min(100, prev + drift))
      })
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const barColor = score < 40 ? "bg-quest-success" : score < 70 ? "bg-quest-warning" : "bg-quest-danger"
  const textColor = score < 40 ? "text-quest-success" : score < 70 ? "text-quest-warning" : "text-quest-danger"

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className={`text-[20px] font-semibold tabular-nums ${textColor}`}>{score}</span>
        <span className="text-[11px] text-quest-ink-faint">/ 100</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full rounded-full bg-quest-surface-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ playerId: string }>
}) {
  const { playerId } = use(params)
  const router = useRouter()

  const decisions = useMemo(() => generatePlayerDecisions(playerId), [playerId])
  const signals = useMemo(() => generateSignalState(playerId), [playerId])

  // Group decisions by date
  const groupedDecisions = useMemo(() => {
    const groups: { label: string; entries: DecisionEntry[] }[] = []
    let currentLabel = ""
    for (const d of decisions) {
      const label = getDateGroup(d.timestamp)
      if (label !== currentLabel) {
        groups.push({ label, entries: [] })
        currentLabel = label
      }
      groups[groups.length - 1].entries.push(d)
    }
    return groups
  }, [decisions])

  // Summary counts
  const safetyDecisions = decisions.filter((d) => d.type === "held_rg" || d.type === "blocked_rg").length
  const totalSpend = decisions.reduce((sum, d) => sum + d.cost, 0)

  return (
    <div className="space-y-4">
      {/* Back link */}
      <button
        onClick={() => router.push("/agents")}
        className="inline-flex items-center gap-1.5 text-[13px] text-quest-ink-muted hover:text-quest-ink transition-colors"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Agents
      </button>

      {/* Three-column layout */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[260px_1fr_280px]">

        {/* ============================================================= */}
        {/* LEFT COLUMN — Player context (sticky)                         */}
        {/* ============================================================= */}
        <div className="xl:sticky xl:top-4 xl:self-start space-y-4">

          {/* Player ID + status */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] font-semibold text-quest-ink tracking-tight">#{playerId}</h1>
              <StatusPill status={signals.playerState} />
            </div>
          </div>

          {/* Meta grid */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-[11px] uppercase tracking-wide text-quest-ink-faint mb-3">Player profile</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <span className="text-[10px] uppercase tracking-wide text-quest-ink-faint">Stake band</span>
                <p className="text-[13px] font-medium text-quest-ink mt-0.5">{signals.stakeBand}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wide text-quest-ink-faint">Lifecycle</span>
                <p className="text-[13px] font-medium text-quest-ink mt-0.5">{signals.lifecycle}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wide text-quest-ink-faint">RG tier</span>
                <div className="mt-0.5">
                  {signals.rgTier === "Monitored" ? (
                    <QuestBadge variant="rg_caution">Monitored</QuestBadge>
                  ) : signals.rgTier === "Restricted" ? (
                    <QuestBadge variant="rg_hold">Restricted</QuestBadge>
                  ) : (
                    <span className="text-[13px] text-quest-ink-muted">None</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wide text-quest-ink-faint">Since signup</span>
                <p className="text-[13px] font-medium text-quest-ink mt-0.5">{signals.daysSinceSignup}d</p>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] uppercase tracking-wide text-quest-ink-faint">Plans</span>
                <p className="text-[13px] font-medium text-quest-ink mt-0.5">{signals.assignedPlans.length}</p>
              </div>
            </div>
          </div>

          {/* Safety card */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] uppercase tracking-wide text-quest-ink-faint">Safety interventions</h3>
              <span className="text-[10px] text-quest-ink-faint">last 30 days</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-[24px] font-semibold tabular-nums ${
                signals.safetyCount > 0 ? "text-quest-danger" : "text-quest-success"
              }`}>
                {signals.safetyCount}
              </span>
              {safetyDecisions > 0 && (
                <span className="text-[11px] text-quest-ink-faint">
                  ({safetyDecisions} in last 48h)
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-quest-ink-faint leading-relaxed">
              Includes holds, blocks, and cooldowns triggered by responsible gambling guardrails.
            </p>
          </div>

          {/* Plans this player is in */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-[11px] uppercase tracking-wide text-quest-ink-faint mb-3">Active plans</h3>
            <div className="space-y-2">
              {signals.assignedPlans.map((plan) => (
                <div key={plan.name} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${plan.color} shrink-0`} />
                  <span className="text-[12px] text-quest-ink">{plan.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* MIDDLE COLUMN — Timeline                                      */}
        {/* ============================================================= */}
        <div className="min-w-0">
          <div className="rounded-lg border border-border bg-card p-5">
            {/* Timeline header */}
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[15px] font-medium text-quest-ink">Decision timeline</h2>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-quest-ink-faint tabular-nums">
                  {decisions.length} decisions
                </span>
                <span className="text-[11px] text-quest-ink-faint tabular-nums">
                  {"\u00A3"}{totalSpend.toFixed(2)} total cost
                </span>
              </div>
            </div>
            <p className="text-[12px] text-quest-ink-faint mb-4">
              Last 48 hours of agent decisions for this player. Click any row to expand.
            </p>

            {/* Timeline body */}
            <div className="space-y-0">
              {groupedDecisions.map((group) => (
                <div key={group.label}>
                  {/* Sticky date header */}
                  <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm -mx-5 px-5 py-2 border-b border-border/50">
                    <span className="text-[11px] uppercase tracking-widest font-semibold text-quest-ink-faint">
                      {group.label}
                    </span>
                  </div>

                  {/* Entries */}
                  <div className="divide-y divide-border/30">
                    {group.entries.map((d) => (
                      <TimelineEntry key={d.id} decision={d} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* RIGHT COLUMN — Live signal state (sticky)                     */}
        {/* ============================================================= */}
        <div className="xl:sticky xl:top-4 xl:self-start space-y-4">

          {/* What the agent is reading right now */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-[11px] uppercase tracking-wide text-quest-ink-faint mb-4">
              What the agent reads now
            </h3>

            <div className="space-y-4">
              {/* Session state */}
              <div>
                <span className="text-[10px] uppercase tracking-wide text-quest-ink-faint">Session</span>
                <div className="mt-1">
                  <SessionIndicator initial={signals.initialSession} />
                </div>
              </div>

              {/* Win/loss streak */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wide text-quest-ink-faint">Win/loss streak</span>
                  <span className={`text-[11px] font-bold tabular-nums ${
                    signals.streakLabel.startsWith("W") ? "text-quest-success" : "text-quest-danger"
                  }`}>
                    {signals.streakLabel}
                  </span>
                </div>
                <div className="mt-1.5 flex gap-1">
                  {signals.streak.map((letter, i) => (
                    <span
                      key={i}
                      className={`inline-flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold ${
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

              {/* Churn score */}
              <div>
                <span className="text-[10px] uppercase tracking-wide text-quest-ink-faint">Churn score</span>
                <div className="mt-1">
                  <ChurnScore initial={signals.churnScore} />
                </div>
              </div>

              {/* LTV prediction */}
              <div>
                <span className="text-[10px] uppercase tracking-wide text-quest-ink-faint">LTV prediction</span>
                <p className="text-[16px] font-semibold tabular-nums text-quest-ink mt-0.5">
                  {"\u00A3"}{signals.ltvMonthly.toFixed(2)}
                  <span className="text-[11px] font-normal text-quest-ink-faint ml-1">/ month</span>
                </p>
              </div>

              {/* Last deposit */}
              <div>
                <span className="text-[10px] uppercase tracking-wide text-quest-ink-faint">Last deposit</span>
                <p className="text-[13px] font-medium text-quest-ink mt-0.5">
                  {signals.lastDeposit.daysAgo} days ago{" "}
                  <span className="text-quest-ink-muted">{"\u00B7"}</span>{" "}
                  <span className="tabular-nums">{"\u00A3"}{signals.lastDeposit.amount}</span>
                </p>
              </div>

              {/* RG flags */}
              <div>
                <span className="text-[10px] uppercase tracking-wide text-quest-ink-faint">RG flags</span>
                <div className="mt-1">
                  {signals.rgFlags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {signals.rgFlags.map((f) => (
                        <QuestBadge key={f} variant="rg_caution">{f}</QuestBadge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[13px] text-quest-ink-muted">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="rounded-lg border border-border border-l-4 border-l-quest-accent bg-card p-4">
            <h3 className="text-[11px] uppercase tracking-wide text-quest-accent font-semibold mb-3">
              What happens next
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase tracking-wide text-quest-ink-faint">Next evaluation</span>
                <p className="text-[15px] font-semibold text-quest-ink mt-0.5 tabular-nums">
                  ~{signals.nextEvalMins} minutes
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wide text-quest-ink-faint">Will trigger if</span>
                <ul className="mt-1 space-y-1.5">
                  {signals.nextConditions.map((cond) => (
                    <li key={cond} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-quest-accent" />
                      <span className="text-[12px] leading-snug text-quest-ink-muted">{cond}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
