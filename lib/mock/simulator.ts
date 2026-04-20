import { create } from "zustand";
import { Decision } from "../types";
import { PLAN_IDS } from "./plans";
import { format } from "date-fns";

// ---- Helpers ----

function pickWeighted<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function playerId(): string {
  return `#${String(Math.floor(Math.random() * 90000 + 10000))}`;
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
];

function generateLiveDecision(): Decision {
  const now = new Date();
  const planIds = [
    PLAN_IDS.recreationalRetention,
    PLAN_IDS.weekendWinBack,
    PLAN_IDS.newPlayerNurture,
    PLAN_IDS.vipGrowth,
    PLAN_IDS.lossChasingIntervention,
  ];
  const planWeights = [35, 22, 22, 12, 9];
  const planId = pickWeighted(planIds, planWeights);

  // ~5% RG holds/blocks — important for safety story
  const type = pickWeighted<Decision["type"]>(
    ["mission", "bonus", "cooldown", "no_action", "f2p", "cashback_deferred", "held_rg", "blocked_rg"],
    [38, 28, 8, 8, 6, 7, 3, 2],
    );

  // Generate 2-4 signals
  const numSignals = Math.floor(Math.random() * 3) + 2;
  const signals: string[] = [];
  const shuffled = [...SIGNALS].sort(() => Math.random() - 0.5);
  for (let s = 0; s < numSignals && s < shuffled.length; s++) {
    signals.push(shuffled[s]);
  }

  // RG decisions get specific signals
  if (type === "held_rg" || type === "blocked_rg") {
    signals.length = 0;
    signals.push("loss-chasing-detected");
    if (Math.random() > 0.5) signals.push("stake-escalation");
    if (Math.random() > 0.5) signals.push("session-duration-long");
    signals.push(Math.random() > 0.5 ? "deposit-decline" : "high-frequency-bettor");
  }

  let cost = 0;
  let costState: Decision["costState"] = "none";
  let missionTemplateId: string | undefined;

  if (type === "mission" || type === "bonus") {
    cost = parseFloat((Math.random() * 4 + 0.3).toFixed(2));
    costState = "spent";
    missionTemplateId = TEMPLATE_IDS[Math.floor(Math.random() * TEMPLATE_IDS.length)];
  } else if (type === "cashback_deferred") {
    cost = parseFloat((Math.random() * 2 + 0.2).toFixed(2));
    costState = "deferred";
    missionTemplateId = TEMPLATE_IDS[Math.floor(Math.random() * TEMPLATE_IDS.length)];
  } else if (type === "f2p") {
    cost = parseFloat((Math.random() * 0.5 + 0.15).toFixed(2));
    costState = "spent";
    missionTemplateId = TEMPLATE_IDS[Math.floor(Math.random() * TEMPLATE_IDS.length)];
  }

  const outcome = pickWeighted<Decision["outcome"]>(
    ["engaged", "ignored", "pending", "churned"],
    [35, 15, 45, 5],
  );

  const pId = playerId();

  return {
    id: `live-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    agentId: `agent-${planId.replace("plan-", "")}-${String(Math.floor(Math.random() * 300)).padStart(4, "0")}`,
    playerId: pId,
    planId,
    timestamp: format(now, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    type,
    missionTemplateId,
    cost,
    costState,
    signals,
    outcome,
    outcomeKnownAt: outcome !== "pending" ? format(now, "yyyy-MM-dd'T'HH:mm:ss'Z'") : undefined,
  };
}

// ---- Store ----

type SimulatorState = {
  liveFeed: Decision[];
  kpis: {
    activeAgents: number;
    todaySpend: number;
    todayBudget: number;
    cpep: number;
    retentionLift: number;
    safetyToday: number;
  };
  isRunning: boolean;
  start: () => void;
  stop: () => void;
};

export const useSimulator = create<SimulatorState>((set, get) => {
  let decisionInterval: ReturnType<typeof setInterval> | null = null;
  let kpiInterval: ReturnType<typeof setInterval> | null = null;

  function startIntervals() {
    if (decisionInterval) return; // Already running

    // Generate new decision every 2-3 seconds
    decisionInterval = setInterval(() => {
      const decision = generateLiveDecision();
      set((state) => ({
        liveFeed: [decision, ...state.liveFeed].slice(0, 50),
      }));
    }, 2000 + Math.random() * 1000);

    // Tick KPIs every 10 seconds
    kpiInterval = setInterval(() => {
      set((state) => {
        const kpis = { ...state.kpis };

        // Active agents drift ±1-3
        kpis.activeAgents += Math.floor((Math.random() - 0.4) * 4);
        kpis.activeAgents = Math.max(12800, Math.min(12900, kpis.activeAgents));

        // Spend creeps up by £5-15
        kpis.todaySpend += Math.floor(Math.random() * 11 + 5);
        // Cap at budget
        kpis.todaySpend = Math.min(kpis.todaySpend, kpis.todayBudget);

        // CPEP drifts ±0.01
        kpis.cpep += (Math.random() - 0.5) * 0.02;
        kpis.cpep = Math.round(Math.max(0.45, Math.min(0.60, kpis.cpep)) * 100) / 100;

        // Retention lift drifts ±0.1
        kpis.retentionLift += (Math.random() - 0.5) * 0.2;
        kpis.retentionLift = Math.round(Math.max(17, Math.min(20, kpis.retentionLift)) * 10) / 10;

        // Safety count occasionally +1
        if (Math.random() > 0.7) {
          kpis.safetyToday += 1;
        }

        return { kpis };
      });
    }, 10000);
  }

  // Auto-start when store is first accessed
  if (typeof window !== "undefined") {
    setTimeout(startIntervals, 100);
  }

  return {
    liveFeed: [],
    kpis: {
      activeAgents: 12847,
      todaySpend: 8420,
      todayBudget: 20800,
      cpep: 0.52,
      retentionLift: 18.4,
      safetyToday: 23,
    },
    isRunning: true,
    start: () => {
      startIntervals();
      set({ isRunning: true });
    },
    stop: () => {
      if (decisionInterval) {
        clearInterval(decisionInterval);
        decisionInterval = null;
      }
      if (kpiInterval) {
        clearInterval(kpiInterval);
        kpiInterval = null;
      }
      set({ isRunning: false });
    },
  };
});
