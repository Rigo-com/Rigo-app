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

      ?

      clonePlannerObject(
        config.selectedTools
      )

      :

      [],

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

  const steps =
  decomposeGoal(
    plan.goal
  );

  const tools =
  await selectToolsForGoal(
    plan.goal
  );

  const assignedAgent =
  await assignAgentToPlan();

  plan.steps =
  steps

  .filter(validatePlanStep)

  .map((step) => {

    return {

      ...step,

      assignedTool:
      tools[0] || null,

      assignedAgent,

      state:
      PLAN_STEP_STATES.READY

    };

  });

  plan.selectedTools =
  tools;

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
