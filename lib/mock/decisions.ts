import { Decision } from "../types";
import { subMinutes, format } from "date-fns";
import { PLAN_IDS } from "./plans";

// Seeded pseudo-random for reproducible data
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pickWeighted<T>(items: T[], weights: number[], rand: () => number): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function playerId(rand: () => number): string {
  return `#${String(Math.floor(rand() * 90000 + 10000))}`;
}

const SIGNALS = [
  "post-loss",
  "slot-preference",
  "morning-session",
  "win-streak",
  "churn-score-high",
  "returning-after-gap",
  "vip-tier-upgrade",
  "loss-chasing-detected",
  "weekend-active",
  "low-engagement-3d",
  "deposit-decline",
  "session-duration-long",
  "stake-escalation",
  "multi-game-player",
  "evening-session",
  "first-week-player",
  "high-frequency-bettor",
  "cashout-pattern",
];

const TEMPLATE_IDS = [
  "tpl-morning-free-spin",
  "tpl-streak-3-wins",
  "tpl-scratch-card-morning",
  "tpl-match-deposit-50",
  "tpl-cashback-weekend",
  "tpl-f2p-daily-quiz",
  "tpl-cooldown-gentle",
  "tpl-high-stake-match",
  "tpl-loss-recovery-10",
  "tpl-welcome-streak-7day",
  "tpl-midweek-spin",
  "tpl-sports-acca-boost",
  "tpl-daily-streak-reward",
  "tpl-live-casino-freebet",
  "tpl-weekend-cashback-5",
  "tpl-cooldown-break-suggest",
  "tpl-f2p-prediction-game",
  "tpl-slot-tournament-entry",
  "tpl-vip-reload-bonus",
  "tpl-early-week-spin",
  "tpl-cashback-first-loss",
  "tpl-streak-5-day",
  "tpl-cooldown-session-limit",
  "tpl-f2p-spin-wheel",
  "tpl-sports-free-bet",
];

export function generateDecisions(): Decision[] {
  const rand = seededRandom(7777);
  const now = new Date();
  const decisions: Decision[] = [];

  const planIds = Object.values(PLAN_IDS);
  // Weight distribution: more decisions for active, larger plans
  const planWeights = [30, 20, 22, 12, 10, 6]; // recreational, weekend, new player, vip, loss-chasing, lapsed

  for (let i = 0; i < 200; i++) {
    const planId = pickWeighted(planIds, planWeights, rand);
    const minutesAgo = Math.floor(rand() * 1440); // within 24h
    const timestamp = format(subMinutes(now, minutesAgo), "yyyy-MM-dd'T'HH:mm:ss'Z'");

    // Decision type distribution: 70% mission/bonus, 15% cooldown/no_action, 10% f2p/cashback, 5% held_rg/blocked_rg
    const type = pickWeighted<Decision["type"]>(
      ["mission", "bonus", "cooldown", "no_action", "f2p", "cashback_deferred", "held_rg", "blocked_rg"],
      [40, 30, 8, 7, 5, 5, 3, 2],
      rand
    );

    // Generate 2-4 signals per decision
    const numSignals = Math.floor(rand() * 3) + 2;
    const signals: string[] = [];
    for (let s = 0; s < numSignals; s++) {
      const sig = SIGNALS[Math.floor(rand() * SIGNALS.length)];
      if (!signals.includes(sig)) signals.push(sig);
    }

    // Cost depends on type
    let cost = 0;
    let costState: Decision["costState"] = "none";
    let missionTemplateId: string | undefined;

    if (type === "mission" || type === "bonus") {
      cost = parseFloat((rand() * 4 + 0.3).toFixed(2));
      costState = "spent";
      missionTemplateId = TEMPLATE_IDS[Math.floor(rand() * TEMPLATE_IDS.length)];
    } else if (type === "cashback_deferred") {
      cost = parseFloat((rand() * 2 + 0.2).toFixed(2));
      costState = "deferred";
      missionTemplateId = TEMPLATE_IDS[Math.floor(rand() * TEMPLATE_IDS.length)];
    } else if (type === "f2p") {
      cost = parseFloat((rand() * 0.5 + 0.15).toFixed(2));
      costState = "spent";
      missionTemplateId = TEMPLATE_IDS[Math.floor(rand() * TEMPLATE_IDS.length)];
    }

    // Outcome — recent decisions might still be pending
    const outcome = pickWeighted<Decision["outcome"]>(
      ["engaged", "ignored", "pending", "churned"],
      minutesAgo < 60 ? [30, 10, 55, 5] : [55, 25, 5, 15],
      rand
    );

    const pId = playerId(rand);

    decisions.push({
      id: `dec-${String(i).padStart(4, "0")}`,
      agentId: `agent-${planId.replace("plan-", "")}-${String(Math.floor(rand() * 300)).padStart(4, "0")}`,
      playerId: pId,
      planId,
      timestamp,
      type,
      missionTemplateId,
      cost,
      costState,
      signals,
      outcome,
      outcomeKnownAt: outcome !== "pending" ? format(subMinutes(now, minutesAgo - Math.floor(rand() * 30)), "yyyy-MM-dd'T'HH:mm:ss'Z'") : undefined,
    });
  }

  // Sort by timestamp descending (most recent first)
  decisions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return decisions;
}
