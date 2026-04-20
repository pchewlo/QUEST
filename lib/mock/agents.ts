import { Agent } from "../types";
import { subDays, subHours, format } from "date-fns";
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

export function generateAgents(): Agent[] {
  const rand = seededRandom(42);
  const now = new Date();
  const agents: Agent[] = [];

  // Distribution across plans: ~300, ~200, ~200, ~100, ~120, ~80 = 1000
  const planDistribution: { planId: string; count: number; maxAge: number }[] = [
    { planId: PLAN_IDS.recreationalRetention, count: 300, maxAge: 28 },
    { planId: PLAN_IDS.weekendWinBack, count: 200, maxAge: 21 },
    { planId: PLAN_IDS.newPlayerNurture, count: 200, maxAge: 35 },
    { planId: PLAN_IDS.vipGrowth, count: 100, maxAge: 45 },
    { planId: PLAN_IDS.lossChasingIntervention, count: 120, maxAge: 3 },
    { planId: PLAN_IDS.lapsedSportsBettors, count: 80, maxAge: 14 },
  ];

  for (const { planId, count, maxAge } of planDistribution) {
    for (let i = 0; i < count; i++) {
      const r = rand();
      // State distribution: 80% active, 10% cooldown, 7% held, 3% paused
      const state = pickWeighted<Agent["state"]>(
        ["active", "cooldown", "held", "paused"],
        [80, 10, 7, 3],
        rand
      );

      // RG status: 88% none, 10% monitored, 2% restricted
      const rgStatus = pickWeighted<Agent["rgStatus"]>(
        ["none", "monitored", "restricted"],
        [88, 10, 2],
        rand
      );

      const daysActive = Math.floor(rand() * maxAge) + 1;
      const lifetimeDecisions = Math.floor(rand() * daysActive * 8) + daysActive;
      const lifetimeSpend = parseFloat((rand() * daysActive * 2.5 + 0.5).toFixed(2));
      const missionsCompleted = Math.floor(lifetimeDecisions * (0.4 + rand() * 0.4));

      const last24hDecisions = Math.floor(rand() * 6);
      const last24hSpend = parseFloat((rand() * 3).toFixed(2));
      const engagedMinutes = Math.floor(rand() * 45 + (last24hDecisions > 0 ? 5 : 0));

      agents.push({
        id: `agent-${planId.replace("plan-", "")}-${String(i).padStart(4, "0")}`,
        playerId: playerId(rand),
        planId,
        state,
        lifetime: {
          decisions: lifetimeDecisions,
          spend: lifetimeSpend,
          missionsCompleted,
        },
        last24h: {
          decisions: last24hDecisions,
          spend: last24hSpend,
          engagedMinutes,
        },
        rgStatus,
        createdAt: format(
          subHours(subDays(now, daysActive), Math.floor(rand() * 20)),
          "yyyy-MM-dd'T'HH:mm:ss'Z'"
        ),
      });
    }
  }

  return agents;
}
