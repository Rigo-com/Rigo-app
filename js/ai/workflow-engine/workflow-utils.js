// =====================================
// RIGO AI
// WORKFLOW UTILS
// =====================================

import {
  WORKFLOW_ENGINE_CONFIG
}
from "./workflow-config.js";

import {
  WORKFLOW_STATES
}
from "./workflow-constants.js";

import {
  workflowEngineState
}
from "./workflow-state.js";



// =====================================
// NORMALIZE
// =====================================

export function normalizeWorkflowId(
  workflowId
){

  return String(
    workflowId || ""
  )
  .trim()
  .toLowerCase();

}



// =====================================
// FREEZE
// =====================================

export function freezeWorkflowObject(
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

    if(
      nestedValue &&
      typeof nestedValue ===
      "object"
    ){

      freezeWorkflowObject(
        nestedValue,
        visited
      );

    }

  });

  return Object.freeze(
    value
  );

}



// =====================================
// CLONE
// =====================================

export function cloneWorkflowObject(
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

export function cloneWorkflowDiagnostics(){

  return freezeWorkflowObject({

    ...workflowEngineState
    .diagnostics

  });

}



// =====================================
// ID
// =====================================

export function createWorkflowId(){

  try{

    if(
      typeof crypto !==
      "undefined"

      &&

      typeof crypto.randomUUID ===
      "function"
    ){

      return crypto
      .randomUUID();

    }

  }

  catch(error){}

  return (

    "workflow_" +

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

export function delayWorkflowExecution(
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

export function serializeWorkflowContext(
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

export function isWorkflowContextValid(
  value
){

  const serialized =
  serializeWorkflowContext(
    value
  );

  return (

    serialized.length <=

    WORKFLOW_ENGINE_CONFIG
    .MAX_CONTEXT_SIZE

  );

}



// =====================================
// HISTORY
// =====================================

export function trimWorkflowHistory(){

  while(

    workflowEngineState
    .executionHistory
    .length >

    WORKFLOW_ENGINE_CONFIG
    .MAX_EXECUTION_HISTORY

  ){

    workflowEngineState
    .executionHistory
    .shift();

  }

  return true;

}



// =====================================
// TIMESTAMP
// =====================================

export function updateWorkflowTimestamp(
  workflow
){

  workflow.updatedAt =
  Date.now();

  return true;

}



// =====================================
// EXECUTABLE
// =====================================

export function isWorkflowExecutable(
  workflow
){

  return (

    workflow.state !==
    WORKFLOW_STATES
    .TERMINATED

    &&

    workflow.state !==
    WORKFLOW_STATES
    .COMPLETED

    &&

    workflow.runtime
    ?.running !==
    true

  );

}



// =====================================
// CLEANUP
// =====================================

export function cleanupWorkflowRuntime(
  workflow
){

  if(!workflow){

    return false;

  }

  workflow.runtime.running =
  false;

  workflow.runtime.completedAt =
  Date.now();

  workflow.runtime.controller =
  null;

  updateWorkflowTimestamp(
    workflow
  );

  return true;

}



// =====================================
// TIMEOUT EXECUTION
// =====================================

export async function executeWithWorkflowTimeout(
  callback,
  timeout,
  controller = null
){

  let timeoutId =
  null;

  try{

    const timeoutPromise =
    new Promise((_,reject) => {

      timeoutId =
      setTimeout(() => {

        controller
        ?.abort();

        reject(

          new Error(
            "WORKFLOW STEP TIMEOUT"
          )

        );

      },

      timeout);

    });

    return await Promise.race([

      Promise.resolve()
      .then(callback),

      timeoutPromise

    ]);

  }

  finally{

    if(timeoutId){

      clearTimeout(
        timeoutId
      );

    }

  }

}



// =====================================
// SAFE STEP EXECUTION
// =====================================

export async function safelyExecuteStep(
  workflow,
  step,
  payload
){

  if(
    typeof step.execute !==
    "function"
  ){

    return true;

  }

  if(

    workflow.runtime
    .controller
    ?.signal
    ?.aborted

  ){

    throw new Error(
      "WORKFLOW TERMINATED"
    );

  }

  return executeWithWorkflowTimeout(

    () => {

      return step.execute(
        payload
      );

    },

    WORKFLOW_ENGINE_CONFIG
    .WORKFLOW_TIMEOUT,

    workflow.runtime
    .controller

  );

}
