// =====================================
// RIGO AI
// PLANNER DIAGNOSTICS
// =====================================

import {
  plannerEngineState
}
from "./planner-state.js";

import {
  freezePlannerObject,
  clonePlannerDiagnostics
}
from "./planner-utils.js";



// =====================================
// SNAPSHOT
// =====================================

export function createPlannerSnapshot(){

  return freezePlannerObject({

    initialized:
    plannerEngineState
    .initialized,

    plans:
    plannerEngineState
    .plans
    .size,

    activePlans:
    plannerEngineState
    .activePlans
    .size,

    completedPlans:
    plannerEngineState
    .completedPlans
    .size,

    failedPlans:
    plannerEngineState
    .failedPlans
    .size,

    queue:
    plannerEngineState
    .executionQueue
    .length,

    timestamp:
    Date.now()

  });

}



// =====================================
// DIAGNOSTICS
// =====================================

export function getPlannerDiagnostics(){

  return freezePlannerObject({

    initialized:
    plannerEngineState
    .initialized,

    plans:
    plannerEngineState
    .plans
    .size,

    activePlans:
    plannerEngineState
    .activePlans
    .size,

    queue:
    plannerEngineState
    .executionQueue
    .length,

    diagnostics:
    clonePlannerDiagnostics(),

    timestamp:
    Date.now()

  });

}
