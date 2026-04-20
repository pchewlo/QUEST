import { Operator, Plan, Agent, Decision, MissionTemplate, SafetyEvent } from "../types";
import { generateOperators } from "./operators";
import { generatePlans, PLAN_IDS } from "./plans";
import { generateAgents } from "./agents";
import { generateDecisions } from "./decisions";
import { generateTemplates } from "./templates";
import { generateSafetyEvents } from "./safety";
import { generateTimeSeries, generateAggregateTimeSeries, TimeSeriesPoint } from "./timeseries";

class MockDB {
  operators: Operator[];
  plans: Plan[];
  agents: Agent[];
  decisions: Decision[];
  templates: MissionTemplate[];
  safetyEvents: SafetyEvent[];

  // Cached timeseries
  private _timeSeriesCache: Map<string, TimeSeriesPoint[]> = new Map();
  private _aggregateTimeSeries: TimeSeriesPoint[] | null = null;

  constructor() {
    this.operators = generateOperators();
    this.plans = generatePlans();
    this.agents = generateAgents();
    this.decisions = generateDecisions();
    this.templates = generateTemplates();
    this.safetyEvents = generateSafetyEvents();
  }

  // ---- Operators ----
  getOperator(id: string) {
    return this.operators.find((o) => o.id === id);
  }

  // ---- Plans ----
  getPlan(id: string) {
    return this.plans.find((p) => p.id === id);
  }

  getPlansForOperator(operatorId: string) {
    return this.plans.filter((p) => p.operatorId === operatorId);
  }

  addPlan(plan: Plan) {
    this.plans.push(plan);
  }

  updatePlanStatus(planId: string, status: Plan["status"]) {
    const plan = this.plans.find((p) => p.id === planId);
    if (plan) plan.status = status;
  }

  // ---- Agents ----
  getAgentsForPlan(planId: string) {
    return this.agents.filter((a) => a.planId === planId);
  }

  getAgent(id: string) {
    return this.agents.find((a) => a.id === id);
  }

  getAgentsByState(planId: string, state: Agent["state"]) {
    return this.agents.filter((a) => a.planId === planId && a.state === state);
  }

  getAgentsByRgStatus(planId: string, rgStatus: Agent["rgStatus"]) {
    return this.agents.filter((a) => a.planId === planId && a.rgStatus === rgStatus);
  }

  getAgentCount(planId: string) {
    return this.agents.filter((a) => a.planId === planId).length;
  }

  // ---- Decisions ----
  getDecisionsForPlan(planId: string) {
    return this.decisions.filter((d) => d.planId === planId);
  }

  getDecisionsForAgent(agentId: string) {
    return this.decisions.filter((d) => d.agentId === agentId);
  }

  getRecentDecisions(limit = 50) {
    return this.decisions.slice(0, limit);
  }

  addDecision(decision: Decision) {
    this.decisions.unshift(decision);
    // Keep the list bounded
    if (this.decisions.length > 500) {
      this.decisions = this.decisions.slice(0, 500);
    }
  }

  // ---- Templates ----
  getTemplate(id: string) {
    return this.templates.find((t) => t.id === id);
  }

  getTemplatesForPlan(planId: string) {
    const plan = this.getPlan(planId);
    if (!plan) return [];
    return this.templates.filter((t) => plan.templatePoolIds.includes(t.id));
  }

  // ---- Safety ----
  getSafetyEventsForPlan(planId: string) {
    return this.safetyEvents.filter((e) => e.planId === planId);
  }

  getRecentSafetyEvents(limit = 50) {
    return this.safetyEvents.slice(0, limit);
  }

  getSafetyEventsToday() {
    const today = new Date().toISOString().split("T")[0];
    return this.safetyEvents.filter((e) => e.timestamp.startsWith(today));
  }

  // ---- Time Series ----
  getTimeSeries(planId: string): TimeSeriesPoint[] {
    if (!this._timeSeriesCache.has(planId)) {
      this._timeSeriesCache.set(planId, generateTimeSeries(planId));
    }
    return this._timeSeriesCache.get(planId)!;
  }

  getAggregateTimeSeries(): TimeSeriesPoint[] {
    if (!this._aggregateTimeSeries) {
      this._aggregateTimeSeries = generateAggregateTimeSeries();
    }
    return this._aggregateTimeSeries;
  }

  // ---- Aggregate Stats ----
  getPlanStats(planId: string) {
    const agents = this.getAgentsForPlan(planId);
    const decisions = this.getDecisionsForPlan(planId);
    const safety = this.getSafetyEventsForPlan(planId);
    const timeSeries = this.getTimeSeries(planId);
    const latest = timeSeries[timeSeries.length - 1];

    return {
      totalAgents: agents.length,
      activeAgents: agents.filter((a) => a.state === "active").length,
      cooldownAgents: agents.filter((a) => a.state === "cooldown").length,
      heldAgents: agents.filter((a) => a.state === "held").length,
      totalDecisions: decisions.length,
      totalSafetyEvents: safety.length,
      retentionLift: latest?.retentionLift ?? 0,
      cpep: latest?.cpep ?? 0,
      todaySpend: latest?.spend ?? 0,
      monitoredPlayers: agents.filter((a) => a.rgStatus === "monitored").length,
      restrictedPlayers: agents.filter((a) => a.rgStatus === "restricted").length,
    };
  }

  getOverallStats() {
    const timeSeries = this.getAggregateTimeSeries();
    const latest = timeSeries[timeSeries.length - 1];
    const activePlans = this.plans.filter((p) => p.status === "active");

    return {
      totalPlans: this.plans.length,
      activePlans: activePlans.length,
      totalAgents: this.agents.length,
      activeAgents: this.agents.filter((a) => a.state === "active").length,
      totalBudget: activePlans.reduce((sum, p) => sum + p.dailyBudgetTotal, 0),
      todaySpend: latest?.spend ?? 0,
      retentionLift: latest?.retentionLift ?? 0,
      cpep: latest?.cpep ?? 0,
      safetyToday: latest?.safetyInterventions ?? 0,
    };
  }
}

// ---- Singleton ----
let instance: MockDB | null = null;

export function getDB(): MockDB {
  if (!instance) {
    instance = new MockDB();
  }
  return instance;
}

// Re-export for convenience
export { PLAN_IDS };
export type { TimeSeriesPoint };
