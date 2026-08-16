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
// ENQUEUE PLAN
// =====================================

export function enqueuePlan(
  planId
){

  if(!PLANNER_ENGINE_CONFIG.ENABLE_PLAN_QUEUE){
    return {
      queued:false,
      error:"PLAN_QUEUE_DISABLED"
    };
  }

  if(plannerEngineState.queuedPlans.has(planId)){
    return {
      queued:true,
      duplicate:true
    };
  }

  if(
    plannerEngineState.executionQueue.length >=
    PLANNER_ENGINE_CONFIG.MAX_QUEUE_SIZE
  ){
    return {
      queued:false,
      error:"PLAN_QUEUE_FULL"
    };
  }

  plannerEngineState.queuedPlans.add(planId);
  plannerEngineState.executionQueue.push(planId);
  plannerEngineState.diagnostics.queued++;

  return {
    queued:true,
    position:plannerEngineState.executionQueue.length
  };

}


export function removeQueuedPlan(
  planId
){

  const wasQueued =
  plannerEngineState.queuedPlans.delete(planId);

  plannerEngineState.executionQueue =
  plannerEngineState.executionQueue
  .filter((queuedPlanId) => {
    return queuedPlanId !== planId;
  });

  return wasQueued;

}


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

  let queuedPlan = null;

  while(
    plannerEngineState.executionQueue.length > 0 &&
    !queuedPlan
  ){

    const candidate =
    plannerEngineState.executionQueue.shift();

    if(
      plannerEngineState.queuedPlans.has(candidate) &&
      plannerEngineState.plans.has(candidate)
    ){
      queuedPlan = candidate;
    }

  }

  if(!queuedPlan){
    return false;
  }

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
