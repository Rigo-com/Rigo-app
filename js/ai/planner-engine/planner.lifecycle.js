// =====================================
// RIGO AI
// PLANNER LIFECYCLE
// =====================================

import {
  plannerEngineState
}
from "./planner-state.js";

import {
  terminatePlan
}
from "./planner-executor.js";



// =====================================
// RESET
// =====================================

export async function resetPlannerEngine(){

  for(
    const planId
    of
    plannerEngineState
    .activePlans
  ){

    await terminatePlan(
      planId
    );

  }

  plannerEngineState
  .plans
  .clear();

  plannerEngineState
  .activePlans
  .clear();

  plannerEngineState
  .queuedPlans
  .clear();

  plannerEngineState
  .executionLocks
  .clear();

  plannerEngineState
  .executionQueue =
  [];

  plannerEngineState
  .executionHistory =
  [];

  plannerEngineState
  .completedPlans
  .clear();

  plannerEngineState
  .failedPlans
  .clear();

  return true;

}



// =====================================
// SHUTDOWN
// =====================================

export async function shutdownPlannerEngine(){

  plannerEngineState
  .shuttingDown =
  true;

  await resetPlannerEngine();

  plannerEngineState
  .initialized =
  false;

  return true;

}



// =====================================
// INITIALIZE
// =====================================

export async function initializePlannerEngine(){

  if(
    plannerEngineState
    .initialized
  ){

    return true;

  }

  plannerEngineState
  .initialized =
  true;

  plannerEngineState
  .shuttingDown =
  false;

  return true;

}
