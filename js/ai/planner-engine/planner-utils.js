// =====================================
// RIGO AI
// PLANNER UTILS
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
// NORMALIZE
// =====================================

export function normalizePlanId(
  planId
){

  return String(
    planId || ""
  )
  .trim()
  .toLowerCase();

}



// =====================================
// FREEZE
// =====================================

export function freezePlannerObject(
  value,
  visited = new WeakSet()
){

  if(
    !value ||
    typeof value !==
    "object"
  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  if(

    value instanceof Map ||

    value instanceof Set ||

    value instanceof WeakMap ||

    value instanceof WeakSet ||

    value instanceof AbortController ||

    value instanceof AbortSignal

  ){

    return value;

  }

  visited.add(value);

  Object.values(value)
  .forEach((nestedValue) => {

    freezePlannerObject(
      nestedValue,
      visited
    );

  });

  return Object.freeze(
    value
  );

}



// =====================================
// CLONE
// =====================================

export function clonePlannerObject(
  value
){

  try{

    if(
      typeof structuredClone ===
      "function"
    ){

      return structuredClone(
        value
      );

    }

  }

  catch(error){}

  try{

    if(
      Array.isArray(value)
    ){

      return [
        ...value
      ];

    }

    if(
      value &&
      typeof value ===
      "object"
    ){

      return {
        ...value
      };

    }

    return value;

  }

  catch(error){

    return {};

  }

}



// =====================================
// DIAGNOSTICS
// =====================================

export function clonePlannerDiagnostics(){

  return freezePlannerObject({

    ...plannerEngineState
    .diagnostics

  });

}



// =====================================
// ID
// =====================================

export function createPlannerId(){

  try{

    if(

      typeof crypto !==
      "undefined"

      &&

      typeof crypto
      .randomUUID ===
      "function"

    ){

      return crypto
      .randomUUID();

    }

  }

  catch(error){}

  return (

    "plan_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



// =====================================
// DELAY
// =====================================

export function delayPlannerExecution(
  duration
){

  return new Promise((resolve) => {

    setTimeout(
      resolve,
      duration
    );

  });

}



// =====================================
// SERIALIZE
// =====================================

export function serializePlannerContext(
  value
){

  try{

    return JSON.stringify(
      value
    );

  }

  catch(error){

    return "";

  }

}



// =====================================
// CONTEXT VALIDATION
// =====================================

export function isPlannerContextValid(
  value
){

  const serialized =
  serializePlannerContext(
    value
  );

  return (

    serialized.length <=

    PLANNER_ENGINE_CONFIG
    .MAX_CONTEXT_SIZE

  );

}



// =====================================
// HISTORY
// =====================================

export function trimPlannerHistory(){

  while(

    plannerEngineState
    .executionHistory
    .length >

    PLANNER_ENGINE_CONFIG
    .MAX_EXECUTION_HISTORY

  ){

    plannerEngineState
    .executionHistory
    .shift();

  }

  return true;

}



// =====================================
// PLAN RUNTIME
// =====================================

export function createPlanRuntime(){

  return {

    running:false,

    startedAt:null,

    completedAt:null,

    controller:

      PLANNER_ENGINE_CONFIG
      .ENABLE_PLAN_ABORT

      ?

      new AbortController()

      :

      null

  };

}
