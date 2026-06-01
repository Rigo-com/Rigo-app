// =====================================
// RIGO AI
// PLANNER REGISTRY
// =====================================

import {
  plannerEngineState
}
from "./planner-state.js";

import {
  normalizePlanId,
  clonePlannerObject,
  freezePlannerObject
}
from "./planner-utils.js";



// =====================================
// GET PLAN
// =====================================

export function getPlan(
  planId
){

  const plan =
  plannerEngineState
  .plans
  .get(
    normalizePlanId(
      planId
    )
  );

  if(!plan){

    return null;

  }

  return freezePlannerObject(
    clonePlannerObject(plan)
  );

}



// =====================================
// LIST PLANS
// =====================================

export function listPlans(){

  return freezePlannerObject(

    [

      ...plannerEngineState
      .plans
      .values()

    ]

    .map((plan) => {

      return clonePlannerObject(
        plan
      );

    })

  );

}



// =====================================
// REMOVE PLAN
// =====================================

export async function removePlan(
  planId
){

  const normalizedId =
  normalizePlanId(
    planId
  );

  plannerEngineState
  .queuedPlans
  .delete(
    normalizedId
  );

  plannerEngineState
  .activePlans
  .delete(
    normalizedId
  );

  plannerEngineState
  .executionLocks
  .delete(
    normalizedId
  );

  return plannerEngineState
  .plans
  .delete(
    normalizedId
  );

}
