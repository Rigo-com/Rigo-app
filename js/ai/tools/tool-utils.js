// =====================================
// RIGO AI
// TOOL EXECUTOR UTILS
// =====================================
 
import {
  TOOL_EXECUTOR_CONFIG
}
from "./tool-config.js";

import {
  toolExecutorState
}
from "./tool-state.js";



// =====================================
// NORMALIZE
// =====================================

export function normalizeToolName(
  value
){

  return String(
    value || ""
  )
  .trim()
  .toLowerCase();

}



// =====================================
// EXECUTION ID
// =====================================

export function createExecutionId(){

  try{

    if(

      typeof crypto !==
      "undefined"

      &&

      typeof crypto
      .randomUUID ===
      "function"

    ){

      return (

        "exec_" +

        crypto.randomUUID()

      );

    }

  }

  catch(error){}

  return (

    "exec_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



// =====================================
// CLONE
// =====================================

export function cloneToolObject(
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

    return null;

  }

}



// =====================================
// FREEZE
// =====================================

export function freezeToolObject(
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

    value instanceof AbortSignal ||

    typeof value ===
    "function"

  ){

    return value;

  }

  visited.add(value);

  Object.values(value)
  .forEach((nested) => {

    if(

      nested &&

      typeof nested ===
      "object"

    ){

      freezeToolObject(
        nested,
        visited
      );

    }

  });

  return Object.freeze(
    value
  );

}



// =====================================
// STRUCTURED ERROR
// =====================================

export function createStructuredError(
  code,
  message,
  metadata = {}
){

  return freezeToolObject({

    success:false,

    error:{

      code,

      message,

      metadata,

      timestamp:
      Date.now()

    }

  });

}



// =====================================
// DELAY
// =====================================

export function delayExecution(
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
// PAYLOAD VALIDATION
// =====================================

export function validatePayload(
  payload
){

  try{

    return (

      JSON.stringify(payload)
      .length <=

      TOOL_EXECUTOR_CONFIG
      .MAX_PAYLOAD_SIZE

    );

  }

  catch(error){

    return false;

  }

}



// =====================================
// HISTORY
// =====================================

export function trimExecutionHistory(){

  while(

    toolExecutorState
    .executionHistory
    .length >

    TOOL_EXECUTOR_CONFIG
    .MAX_HISTORY

  ){

    toolExecutorState
    .executionHistory
    .shift();

  }

}



// =====================================
// PERMISSION CACHE
// =====================================

export function trimPermissionCache(){

  while(

    toolExecutorState
    .permissionCache
    .size >

    TOOL_EXECUTOR_CONFIG
    .MAX_PERMISSION_CACHE

  ){

    const firstKey =

      toolExecutorState
      .permissionCache
      .keys()
      .next()
      .value;

    toolExecutorState
    .permissionCache
    .delete(
      firstKey
    );

  }

}
