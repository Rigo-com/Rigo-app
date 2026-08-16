// =====================================
// RIGO AI
// PLANNER PLAN
// =====================================

import {
  plannerEngineState,
  incrementPlannerDiagnostic
}
from "./planner-state.js";

import {
  PLANNER_ENGINE_CONFIG
}
from "./planner-config.js";

import {
  PLAN_STATES,
  PLAN_STEP_STATES,
  PLAN_EVENTS
}
from "./planner-constants.js";

import {
  clonePlannerObject,
  freezePlannerObject,
  createPlanRuntime,
  isPlannerContextValid,
  normalizePlanId,
  createPlannerId
}
from "./planner-utils.js";

import {
  emitPlannerEvent
}
from "./planner-events.js";

import {
  decomposeGoal
}
from "./planner-decomposition.js";

import {
  selectToolsForGoal
}
from "./planner-selection.js";

import {
  assignAgentToPlan
}
from "./planner-agents.js";

import {
  validatePlanStep
}
from "./planner-validator.js";


// =====================================
// PLAN OBJECT
// =====================================

export function createPlanObject(
  config = {}
){

  const requestedTimeout =
  Number(config.timeout);

  const timeout =
  Number.isFinite(requestedTimeout) &&
  requestedTimeout > 0
  ? Math.min(
      Math.floor(requestedTimeout),
      PLANNER_ENGINE_CONFIG.PLAN_TIMEOUT
    )
  : PLANNER_ENGINE_CONFIG.PLAN_TIMEOUT;

  return {
    id:
    normalizePlanId(
      config.id ||
      createPlannerId()
    ),
    goal:
    String(
      config.goal || ""
    ),
    description:
    String(
      config.description || ""
    ),
    priority:
    Number(
      config.priority
    ) || 1,
    retries:0,
    timeout,
    state:
    PLAN_STATES.CREATED,
    strategy:
    String(
      config.strategy ||
      (
        PLANNER_ENGINE_CONFIG.ENABLE_ADAPTIVE_STRATEGIES
        ? "adaptive"
        : "sequential"
      )
    ),
    assignedAgent:
    config.assignedAgent ||
    null,
    selectedTools:
      Array.isArray(
        config.selectedTools
      )
      ? clonePlannerObject(
          config.selectedTools
        )
      : [],
    steps:[],
    context:
    clonePlannerObject(
      config.context || {}
    ),
    metadata:
    clonePlannerObject(
      config.metadata || {}
    ),
    runtime:
    createPlanRuntime(),
    createdAt:
    Date.now(),
    updatedAt:
    Date.now()
  };

}


async function assignStepExecutor(
  step,
  fallbackAgent
){

  const matchingTools =
  PLANNER_ENGINE_CONFIG.ENABLE_TOOL_SELECTION
  ? await selectToolsForGoal(step.objective)
  : [];

  if(matchingTools.length > 0){
    return {
      ...step,
      assignedTool:
      matchingTools[0],
      assignedAgent:null,
      state:
      PLAN_STEP_STATES.READY
    };
  }

  return {
    ...step,
    assignedTool:null,
    assignedAgent:
    PLANNER_ENGINE_CONFIG.ENABLE_AGENT_ASSIGNMENT
    ? fallbackAgent || null
    : null,
    state:
    PLAN_STEP_STATES.READY
  };

}


// =====================================
// GENERATE PLAN
// =====================================

export async function generateExecutionPlan(
  config = {}
){

  if(
    plannerEngineState
    .shuttingDown
  ){
    return false;
  }

  if(
    plannerEngineState
    .plans
    .size >=
    PLANNER_ENGINE_CONFIG
    .MAX_PLANS
  ){
    incrementPlannerDiagnostic("rejected");
    return false;
  }

  if(
    !isPlannerContextValid(
      config.context || {}
    )
  ){
    incrementPlannerDiagnostic("rejected");
    return false;
  }

  const plan =
  createPlanObject(
    config
  );

  const rawSteps =
  (
    PLANNER_ENGINE_CONFIG.ENABLE_DYNAMIC_PLANNING
    ? decomposeGoal(plan.goal)
    : clonePlannerObject(config.steps || [])
      .slice(0,PLANNER_ENGINE_CONFIG.MAX_PLAN_STEPS)
      .map((step,index) => ({
        ...step,
        id:step.id || createPlannerId(),
        order:Number(step.order) || index + 1,
        objective:String(step.objective || "").trim(),
        state:PLAN_STEP_STATES.PENDING
      }))
  )
  .filter(validatePlanStep);

  const assignedAgent =
  PLANNER_ENGINE_CONFIG.ENABLE_AGENT_ASSIGNMENT
  ? await assignAgentToPlan()
  : null;

  const steps = [];

  for(
    const step
    of rawSteps
  ){
    steps.push(
      await assignStepExecutor(
        step,
        assignedAgent
      )
    );
  }

  plan.steps =
  steps;

  plan.selectedTools =
  Array.from(
    new Set(
      steps
      .map((step) => {
        return step.assignedTool;
      })
      .filter(Boolean)
    )
  );

  plan.assignedAgent =
  assignedAgent;

  plan.state =
  PLAN_STATES.PLANNED;

  plannerEngineState
  .plans
  .set(
    plan.id,
    plan
  );

  incrementPlannerDiagnostic("created");
  incrementPlannerDiagnostic("generated");

  plannerEngineState
  .lastPlanAt =
  Date.now();

  await emitPlannerEvent(
    PLAN_EVENTS
    .GENERATED,
    {
      planId:
      plan.id
    }
  );

  return freezePlannerObject(
    clonePlannerObject(plan)
  );

}
