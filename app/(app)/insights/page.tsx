'use client'

import { InsightCard } from "@/components/insight/InsightCard"
import {
  Lightbulb,
  TrendingUp,
  Clock,
  Users,
  Calendar,
  Shield,
  BarChart3,
  Moon,
} from "lucide-react"

// Sorted: urgent first, opportunities middle, safety impact last
const NEEDS_ATTENTION = [
  {
    headline: "VIP CPEP rising this week",
    explanation:
      "CPEP in your VIP cohort has risen 18% this week. Cost per engaged player is trending above target, likely driven by high-stake match templates.",
    metric: { label: "VIP CPEP", value: "\u00A31.84", delta: "+18%", deltaType: "negative" as const },
    actionLabel: "Review template mix",
    icon: <TrendingUp size={16} />,
  },
  {
    headline: "Morning sessions underperforming control",
    explanation:
      "Control group outperforming QUEST in 09:00\u201311:00 for Recreational retention. Agents may be over-spending in morning daypart where natural engagement is already high.",
    metric: { label: "Morning CPEP", value: "\u00A30.94", delta: "+42% vs afternoon", deltaType: "negative" as const },
    actionLabel: "Investigate daypart",
    icon: <Clock size={16} />,
  },
  {
    headline: "Weekend win-back showing diminishing returns",
    explanation:
      "Weekend win-back showing diminishing returns after day 14. Players who haven\u2019t re-engaged by day 14 are unlikely to respond to further bonus-based outreach.",
    metric: { label: "Day 14+ CPEP", value: "\u00A31.12", delta: "+87% vs week 1", deltaType: "negative" as const },
    actionLabel: "Review plan duration",
    icon: <Calendar size={16} />,
  },
]

const OPPORTUNITIES = [
  {
    headline: "Streak missions outperform free bets for returning players",
    explanation:
      "Players returning after a 2-day gap respond 3x better to streak missions than to free bets. This pattern is consistent across recreational and medium-stake cohorts.",
    metric: { label: "Streak vs Free bet engagement", value: "3.2\u00D7", delta: "+220%", deltaType: "positive" as const },
    actionLabel: "Apply to Win-back plan",
    icon: <Lightbulb size={16} />,
  },
  {
    headline: "First-week mission completion predicts retention",
    explanation:
      "New players who complete 3 missions in their first week retain at 2.4\u00D7 the base rate. Consider increasing nurture frequency for this critical window.",
    metric: { label: "3-mission retention", value: "78%", delta: "+140%", deltaType: "positive" as const },
    actionLabel: "Increase nurture frequency",
    icon: <Users size={16} />,
  },
  {
    headline: "Cashback outperforms free spins for lapsed bettors",
    explanation:
      "Cashback missions outperform free spins by 34% for lapsed sports bettors. The perceived value and lower wagering requirements drive higher re-engagement.",
    metric: { label: "Cashback engagement", value: "41%", delta: "+34% vs free spins", deltaType: "positive" as const },
    actionLabel: "Update template pool",
    icon: <BarChart3 size={16} />,
  },
  {
    headline: "Evening sessions are more cost-efficient",
    explanation:
      "Agents are spending 23% less per engaged player in evening sessions vs. morning. Players are more receptive to missions during evening leisure time.",
    metric: { label: "Evening CPEP", value: "\u00A30.38", delta: "-23% vs morning", deltaType: "positive" as const },
    actionLabel: "Adjust daypart weights",
    icon: <Moon size={16} />,
  },
]

const SAFETY_IMPACT = [
  {
    headline: "Loss chasing intervention saving \u00A312.4k/week",
    explanation:
      "Loss chasing intervention preventing an estimated \u00A312,400/week in player losses. The cooldown nudges and F2P redirects are effectively interrupting harmful patterns.",
    metric: { label: "Prevented losses", value: "\u00A312.4k", delta: "per week", deltaType: "positive" as const },
    actionLabel: "View safety report",
    icon: <Shield size={16} />,
  },
]

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[32px] font-medium text-quest-ink">Insights</h1>
        <p className="mt-1 text-[14px] text-quest-ink-muted">
          AI-surfaced observations across your plans
        </p>
      </div>

      {/* Needs attention */}
      <div>
        <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-quest-danger">
          Needs attention
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {NEEDS_ATTENTION.map((insight, i) => (
            <InsightCard
              key={`attn-${i}`}
              headline={insight.headline}
              explanation={insight.explanation}
              metric={insight.metric}
              actionLabel={insight.actionLabel}
              onAction={() => alert(`Action: ${insight.actionLabel}`)}
              icon={insight.icon}
              accent
            />
          ))}
        </div>
      </div>

      {/* Opportunities */}
      <div>
        <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-quest-accent">
          Opportunities
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {OPPORTUNITIES.map((insight, i) => (
            <InsightCard
              key={`opp-${i}`}
              headline={insight.headline}
              explanation={insight.explanation}
              metric={insight.metric}
              actionLabel={insight.actionLabel}
              onAction={() => alert(`Action: ${insight.actionLabel}`)}
              icon={insight.icon}
            />
          ))}
        </div>
      </div>

      {/* Safety impact */}
      <div>
        <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-quest-ink-faint">
          Safety impact
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SAFETY_IMPACT.map((insight, i) => (
            <InsightCard
              key={`safety-${i}`}
              headline={insight.headline}
              explanation={insight.explanation}
              metric={insight.metric}
              actionLabel={insight.actionLabel}
              onAction={() => alert(`Action: ${insight.actionLabel}`)}
              icon={insight.icon}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
