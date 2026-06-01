// =====================================
// RIGO AI
// PLANNER QUEUE
// =====================================

import {
  PLANNER_ENGINE_CONFIG
}
from "./planner-config.js";

import {
  plannerEngineState
}
from "./planner-state.js";



// =====================================
// DRAIN QUEUE
// =====================================

export async function drainPlannerQueue(
  executor
){

  if(
    !PLANNER_ENGINE_CONFIG
    .ENABLE_AUTO_QUEUE_DRAIN
  ){

    return false;

  }

  if(

    plannerEngineState
    .executionQueue
    .length <= 0

  ){

    return false;

  }

  if(

    plannerEngineState
    .activePlans
    .size >=

    PLANNER_ENGINE_CONFIG
    .MAX_PARALLEL_PLANS

  ){

    return false;

  }

  const queuedPlan =
  plannerEngineState
  .executionQueue
  .shift();

  plannerEngineState
  .queuedPlans
  .delete(
    queuedPlan
  );

  executor(
    queuedPlan
  )
  .catch(() => {});

  return true;

}
