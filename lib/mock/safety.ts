import { SafetyEvent } from "../types";
import { subDays, subHours, subMinutes, format } from "date-fns";
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

const AUDIT_NOTES: Record<SafetyEvent["type"], string[]> = {
  frequency_cap_hit: [
    "Player exceeded 4 missions/day limit",
    "Mission frequency cap reached — 3 missions in last 2 hours",
    "Daily mission cap of 5 reached for player",
    "Player hit hourly engagement cap — cooldown applied",
    "Maximum daily interactions reached — no further missions",
    "Session frequency cap triggered after rapid mission completion",
  ],
  spend_cap_hit: [
    "Spend cap of £3.00 reached for player",
    "Daily bonus value cap exceeded — £2.50 limit",
    "Per-player spend limit hit — deferring remaining missions",
    "Plan budget cap reached for this player today",
    "Cumulative spend cap of £4.00 triggered",
    "Player at 95% of daily cap — final mission blocked",
  ],
  rg_override: [
    "RG monitoring flag triggered — session duration >4h",
    "Responsible gambling override — deposit velocity spike detected",
    "Player RG tier escalated to 'monitored' — mission intensity reduced",
    "Stake escalation pattern detected — agent placed on hold",
    "Loss-chasing score exceeded threshold — all bonuses paused",
    "RG team flagged player — manual review required before resuming",
    "Affordability check triggered — bonus missions suspended",
    "Automated RG assessment — cooling period enforced",
  ],
  self_exclusion_respected: [
    "Self-exclusion respected — all pending missions cancelled",
    "Player activated self-exclusion — agent immediately suspended",
    "GAMSTOP match detected — agent terminated and missions voided",
    "Temporary self-exclusion (24h) — agent paused",
    "Self-exclusion request processed — 3 pending bonuses cancelled",
    "Player opted into cool-off period — all marketing suppressed",
  ],
  loss_sequence_cooldown: [
    "Loss sequence detected — 5 consecutive losses — cooldown applied",
    "Escalating loss pattern — 45-minute mandatory cooldown",
    "Player on 8-loss streak — redirected to F2P content",
    "Rapid loss accumulation — session break suggested",
    "Net loss threshold exceeded in 1h window — bonus missions paused",
    "Loss velocity spike — gentle cooldown nudge deployed",
    "Consecutive loss count exceeded plan threshold — cooldown enforced",
  ],
};

export function generateSafetyEvents(): SafetyEvent[] {
  const rand = seededRandom(9999);
  const now = new Date();
  const events: SafetyEvent[] = [];

  const planIds = Object.values(PLAN_IDS);
  // More events from active plans
  const planWeights = [30, 18, 20, 15, 12, 5];

  for (let i = 0; i < 500; i++) {
    const planId = pickWeighted(planIds, planWeights, rand);

    // Days ago — more recent days have more events (product growing)
    // Use exponential distribution biased toward recent days
    const daysAgo = Math.floor(Math.pow(rand(), 1.5) * 30);
    const hoursOffset = Math.floor(rand() * 24);
    const minutesOffset = Math.floor(rand() * 60);
    const timestamp = format(
      subMinutes(subHours(subDays(now, daysAgo), hoursOffset), minutesOffset),
      "yyyy-MM-dd'T'HH:mm:ss'Z'"
    );

    // Type distribution
    const type = pickWeighted<SafetyEvent["type"]>(
      ["frequency_cap_hit", "spend_cap_hit", "rg_override", "self_exclusion_respected", "loss_sequence_cooldown"],
      [30, 25, 20, 8, 17],
      rand
    );

    // Action depends on type
    let action: SafetyEvent["action"];
    if (type === "self_exclusion_respected") {
      action = "blocked";
    } else if (type === "rg_override") {
      action = pickWeighted<SafetyEvent["action"]>(["held", "blocked", "redirected"], [50, 30, 20], rand);
    } else if (type === "loss_sequence_cooldown") {
      action = pickWeighted<SafetyEvent["action"]>(["redirected", "held", "logged"], [40, 35, 25], rand);
    } else {
      action = pickWeighted<SafetyEvent["action"]>(["blocked", "logged", "redirected"], [40, 40, 20], rand);
    }

    const notes = AUDIT_NOTES[type];
    const pId = playerId(rand);
    // Personalize some audit notes with the player ID
    let auditNote = notes[Math.floor(rand() * notes.length)];
    if (rand() > 0.5 && !auditNote.includes("#")) {
      auditNote = auditNote.replace("player", `player ${pId}`).replace("Player", `Player ${pId}`);
    }

    events.push({
      id: `safety-${String(i).padStart(4, "0")}`,
      playerId: pId,
      planId,
      type,
      timestamp,
      action,
      auditNote,
    });
  }

  // Sort by timestamp descending
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return events;
}
