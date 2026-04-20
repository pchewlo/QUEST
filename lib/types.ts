export type Operator = {
  id: string;
  name: string;
  properties: string[];
  currency: "GBP" | "EUR" | "USD";
};

export type PlanObjective =
  | "retain_at_risk"
  | "win_back_lapsed"
  | "new_player_nurture"
  | "responsible_ltv_growth"
  | "reduce_loss_chasing";

export type CohortFilter = {
  stakeBand?: ("low" | "medium" | "high" | "vip")[];
  lifecycle?: ("new" | "active" | "at_risk" | "lapsed" | "returning")[];
  gamesPlayed?: ("slots" | "sports" | "live_casino" | "poker")[];
  rgRiskTier?: ("none" | "monitored" | "restricted")[];
  region?: string[];
  custom?: string;
};

export type Guardrails = {
  maxMissionsPerPlayerPerDay: number;
  maxBonusValuePerPlayerPerDay: number;
  coolOffAfterLoss: boolean;
  respectSelfExclusion: true;
  complianceReviewRequired: boolean;
};

export type Plan = {
  id: string;
  operatorId: string;
  name: string;
  objective: PlanObjective;
  status: "draft" | "calibrating" | "active" | "paused" | "ended";
  createdAt: string;
  dailyBudgetTotal: number;
  perPlayerDailyCap: number;
  cohortFilter: CohortFilter;
  guardrails: Guardrails;
  templatePoolIds: string[];
  controlGroupPct: number;
};

export type Agent = {
  id: string;
  playerId: string;
  planId: string;
  agentGroupId?: string;
  state: "active" | "cooldown" | "held" | "paused";
  lifetime: { decisions: number; spend: number; missionsCompleted: number };
  last24h: { decisions: number; spend: number; engagedMinutes: number };
  rgStatus: "none" | "monitored" | "restricted";
  createdAt: string;
};

export type Decision = {
  id: string;
  agentId: string;
  playerId: string;
  planId: string;
  timestamp: string;
  type: "mission" | "bonus" | "cooldown" | "cashback_deferred" | "f2p" | "no_action" | "held_rg" | "blocked_rg";
  missionTemplateId?: string;
  cost: number;
  costState: "spent" | "committed" | "deferred" | "none";
  signals: string[];
  outcomeKnownAt?: string;
  outcome?: "engaged" | "ignored" | "churned" | "pending";
};

export type MissionTemplate = {
  id: string;
  name: string;
  archetype: "streak" | "bonus_bet" | "free_spin" | "cashback" | "f2p_engagement" | "cooldown_nudge";
  complianceApprovedAt: string | null;
  minStake: number;
  maxStake: number;
  expectedCostRange: [number, number];
  fitsObjectives: PlanObjective[];
};

export type SafetyEvent = {
  id: string;
  playerId: string;
  planId: string;
  type: "frequency_cap_hit" | "spend_cap_hit" | "rg_override" | "self_exclusion_respected" | "loss_sequence_cooldown";
  timestamp: string;
  action: "blocked" | "held" | "redirected" | "logged";
  auditNote: string;
};

// Utility types for time-series data
export type DailyMetrics = {
  date: string;
  spend: number;
  activeAgents: number;
  decisions: number;
  retentionLift: number;
  cpep: number;
  safetyInterventions: number;
};

export type PlanDailyMetrics = DailyMetrics & {
  planId: string;
};
