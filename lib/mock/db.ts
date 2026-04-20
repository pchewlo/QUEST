import { Operator, Plan, Agent, Decision, MissionTemplate, SafetyEvent, DailyMetrics } from "../types";
import { generateOperators } from "./operators";
import { generatePlans } from "./plans";
import { generateAgents } from "./agents";
import { generateDecisions } from "./decisions";
import { generateTemplates } from "./templates";
import { generateSafetyEvents } from "./safety";

class MockDB {
  operators: Operator[];
  plans: Plan[];
  agents: Agent[];
  decisions: Decision[];
  templates: MissionTemplate[];
  safetyEvents: SafetyEvent[];
  dailyMetrics: DailyMetrics[];

  constructor() {
    this.operators = generateOperators();
    this.plans = generatePlans();
    this.agents = generateAgents();
    this.decisions = generateDecisions();
    this.templates = generateTemplates();
    this.safetyEvents = generateSafetyEvents();
    this.dailyMetrics = [];
  }

  getOperator(id: string) {
    return this.operators.find((o) => o.id === id);
  }

  getPlan(id: string) {
    return this.plans.find((p) => p.id === id);
  }

  getPlansForOperator(operatorId: string) {
    return this.plans.filter((p) => p.operatorId === operatorId);
  }

  getAgentsForPlan(planId: string) {
    return this.agents.filter((a) => a.planId === planId);
  }

  getDecisionsForPlan(planId: string) {
    return this.decisions.filter((d) => d.planId === planId);
  }

  getSafetyEventsForPlan(planId: string) {
    return this.safetyEvents.filter((e) => e.planId === planId);
  }

  addPlan(plan: Plan) {
    this.plans.push(plan);
  }

  addDecision(decision: Decision) {
    this.decisions.push(decision);
  }
}

// Singleton
let instance: MockDB | null = null;

export function getDB(): MockDB {
  if (!instance) {
    instance = new MockDB();
  }
  return instance;
}
