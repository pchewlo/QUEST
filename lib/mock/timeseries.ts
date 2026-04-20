import { subDays, format } from "date-fns";
import { PLAN_IDS } from "./plans";

export type TimeSeriesPoint = {
  date: string; // "2026-04-10"
  spend: number;
  activeAgents: number;
  decisions: number;
  retentionLift: number; // percentage, e.g. 22.1
  controlRetention: number; // the baseline
  cpep: number;
  safetyInterventions: number;
};

// Seeded pseudo-random for reproducible data
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// Plan-specific parameters for generating realistic data
const PLAN_PROFILES: Record<string, {
  maxDays: number;
  baseSpend: number;
  spendGrowth: number;
  baseAgents: number;
  agentGrowth: number;
  baseDecisions: number;
  peakRetentionLift: number;
  baseCpep: number;
  cpepFloor: number;
  baseSafety: number;
  controlRetention: number;
  pausedAtDay?: number;
}> = {
  [PLAN_IDS.recreationalRetention]: {
    maxDays: 28,
    baseSpend: 1800,
    spendGrowth: 80,
    baseAgents: 180,
    agentGrowth: 5,
    baseDecisions: 420,
    peakRetentionLift: 22.4,
    baseCpep: 0.78,
    cpepFloor: 0.48,
    baseSafety: 4,
    controlRetention: 61.2,
  },
  [PLAN_IDS.weekendWinBack]: {
    maxDays: 21,
    baseSpend: 1200,
    spendGrowth: 60,
    baseAgents: 120,
    agentGrowth: 4,
    baseDecisions: 280,
    peakRetentionLift: 16.8,
    baseCpep: 0.85,
    cpepFloor: 0.55,
    baseSafety: 3,
    controlRetention: 34.5,
  },
  [PLAN_IDS.newPlayerNurture]: {
    maxDays: 35,
    baseSpend: 1400,
    spendGrowth: 45,
    baseAgents: 140,
    agentGrowth: 3,
    baseDecisions: 350,
    peakRetentionLift: 28.6,
    baseCpep: 0.62,
    cpepFloor: 0.38,
    baseSafety: 2,
    controlRetention: 42.8,
  },
  [PLAN_IDS.vipGrowth]: {
    maxDays: 45,
    baseSpend: 3500,
    spendGrowth: 100,
    baseAgents: 65,
    agentGrowth: 1,
    baseDecisions: 180,
    peakRetentionLift: 12.3,
    baseCpep: 1.20,
    cpepFloor: 0.72,
    baseSafety: 5,
    controlRetention: 78.4,
  },
  [PLAN_IDS.lossChasingIntervention]: {
    maxDays: 3,
    baseSpend: 600,
    spendGrowth: 150,
    baseAgents: 80,
    agentGrowth: 15,
    baseDecisions: 160,
    peakRetentionLift: 8.2,
    baseCpep: 0.92,
    cpepFloor: 0.65,
    baseSafety: 8,
    controlRetention: 55.0,
  },
  [PLAN_IDS.lapsedSportsBettors]: {
    maxDays: 14,
    baseSpend: 900,
    spendGrowth: 50,
    baseAgents: 55,
    agentGrowth: 3,
    baseDecisions: 140,
    peakRetentionLift: 14.5,
    baseCpep: 0.90,
    cpepFloor: 0.58,
    baseSafety: 2,
    controlRetention: 22.1,
    pausedAtDay: 7, // paused after 7 days
  },
};

export function generateTimeSeries(planId: string): TimeSeriesPoint[] {
  const profile = PLAN_PROFILES[planId];
  if (!profile) return [];

  const rand = seededRandom(planId.length * 1000 + 31415);
  const now = new Date();
  const points: TimeSeriesPoint[] = [];
  const days = Math.min(profile.maxDays, 30);

  for (let d = days - 1; d >= 0; d--) {
    const dayIndex = days - 1 - d; // 0 = first day, days-1 = today
    const date = format(subDays(now, d), "yyyy-MM-dd");
    const progress = dayIndex / Math.max(days - 1, 1); // 0 to 1

    // Check if plan is paused
    const isPaused = profile.pausedAtDay !== undefined && dayIndex >= profile.pausedAtDay;

    // Spend grows over time, flattens if paused
    let spend: number;
    if (isPaused) {
      spend = profile.baseSpend + profile.spendGrowth * profile.pausedAtDay! * 0.1;
      spend *= 0.1 + rand() * 0.1; // minimal residual spend when paused
    } else {
      spend = profile.baseSpend + profile.spendGrowth * dayIndex;
      spend *= 0.85 + rand() * 0.3; // Add noise ±15%
    }

    // Active agents grow and then stabilize
    let activeAgents: number;
    if (isPaused) {
      activeAgents = Math.floor(profile.baseAgents * 0.05); // almost none when paused
    } else {
      activeAgents = Math.floor(profile.baseAgents + profile.agentGrowth * dayIndex);
      activeAgents += Math.floor((rand() - 0.5) * profile.baseAgents * 0.1);
    }

    // Decisions correlate with agents
    let decisions: number;
    if (isPaused) {
      decisions = Math.floor(activeAgents * 0.5);
    } else {
      decisions = Math.floor(profile.baseDecisions * (0.6 + progress * 0.6));
      decisions += Math.floor((rand() - 0.5) * 40);
    }

    // Retention lift: climbs during calibration (first 10 days), then stabilizes with noise
    let retentionLift: number;
    if (isPaused) {
      // Decays slightly when paused
      const daysSincePause = dayIndex - (profile.pausedAtDay || 0);
      retentionLift = profile.peakRetentionLift * 0.7 * Math.max(0.3, 1 - daysSincePause * 0.08);
      retentionLift += (rand() - 0.5) * 1.5;
    } else if (dayIndex < 10) {
      // Calibration phase: climbing
      const calibrationProgress = dayIndex / 10;
      retentionLift = profile.peakRetentionLift * calibrationProgress * (0.5 + calibrationProgress * 0.5);
      retentionLift += (rand() - 0.5) * 2;
      retentionLift = Math.max(0, retentionLift);
    } else {
      // Stabilized with noise
      retentionLift = profile.peakRetentionLift + (rand() - 0.5) * 3;
    }

    // Control retention baseline — relatively stable
    const controlRetention = profile.controlRetention + (rand() - 0.5) * 2;

    // CPEP decreases over time (agents get more efficient)
    let cpep: number;
    if (isPaused) {
      cpep = profile.baseCpep; // Frozen
    } else {
      const cpepRange = profile.baseCpep - profile.cpepFloor;
      cpep = profile.baseCpep - cpepRange * progress * 0.8;
      cpep += (rand() - 0.5) * 0.08;
      cpep = Math.max(profile.cpepFloor, cpep);
    }

    // Safety interventions grow slightly as more agents activate
    let safetyInterventions: number;
    if (isPaused) {
      safetyInterventions = Math.floor(rand() * 0.5);
    } else {
      safetyInterventions = Math.floor(profile.baseSafety * (0.5 + progress * 0.8));
      safetyInterventions += Math.floor(rand() * 3);
    }

    points.push({
      date,
      spend: Math.round(spend * 100) / 100,
      activeAgents: Math.max(0, activeAgents),
      decisions: Math.max(0, decisions),
      retentionLift: Math.round(retentionLift * 10) / 10,
      controlRetention: Math.round(controlRetention * 10) / 10,
      cpep: Math.round(cpep * 100) / 100,
      safetyInterventions: Math.max(0, safetyInterventions),
    });
  }

  return points;
}

export function generateAggregateTimeSeries(): TimeSeriesPoint[] {
  const rand = seededRandom(271828);
  const now = new Date();
  const points: TimeSeriesPoint[] = [];

  // Aggregate across all plans — 30 days
  for (let d = 29; d >= 0; d--) {
    const dayIndex = 29 - d;
    const date = format(subDays(now, d), "yyyy-MM-dd");
    const progress = dayIndex / 29;

    // Overall platform growth story
    const spend = 6500 + dayIndex * 250 + (rand() - 0.5) * 800;
    const activeAgents = Math.floor(8000 + dayIndex * 165 + (rand() - 0.5) * 400);
    const decisions = Math.floor(1800 + dayIndex * 80 + (rand() - 0.5) * 200);

    // Aggregate retention lift
    let retentionLift: number;
    if (dayIndex < 10) {
      retentionLift = 4 + dayIndex * 1.6 + (rand() - 0.5) * 2;
    } else {
      retentionLift = 18.4 + (rand() - 0.5) * 2.5;
    }

    const controlRetention = 48.5 + (rand() - 0.5) * 1.5;

    // CPEP improving over time
    const cpep = 0.82 - progress * 0.3 + (rand() - 0.5) * 0.05;

    // Safety interventions grow with scale
    const safetyInterventions = Math.floor(12 + dayIndex * 0.5 + rand() * 5);

    points.push({
      date,
      spend: Math.round(spend * 100) / 100,
      activeAgents: Math.max(0, activeAgents),
      decisions: Math.max(0, decisions),
      retentionLift: Math.round(retentionLift * 10) / 10,
      controlRetention: Math.round(controlRetention * 10) / 10,
      cpep: Math.round(cpep * 100) / 100,
      safetyInterventions: Math.max(0, safetyInterventions),
    });
  }

  return points;
}
