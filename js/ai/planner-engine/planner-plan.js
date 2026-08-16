// =====================================
// RIGO AI
// PLANNER PLAN
// =====================================

import {
  plannerEngineState
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
      "adaptive"
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
  await selectToolsForGoal(
    step.objective
  );

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
    fallbackAgent || null,
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
    plannerEngineState
    .diagnostics
    .rejected++;
    return false;
  }

  if(
    !isPlannerContextValid(
      config.context || {}
    )
  ){
    plannerEngineState
    .diagnostics
    .rejected++;
    return false;
  }

  const plan =
  createPlanObject(
    config
  );

  const rawSteps =
  decomposeGoal(
    plan.goal
  )
  .filter(validatePlanStep);

  const assignedAgent =
  await assignAgentToPlan();

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

  plannerEngineState
  .diagnostics
  .created++;

  plannerEngineState
  .diagnostics
  .generated++;

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
