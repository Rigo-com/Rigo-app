// =====================================
// RIGO AI
// TOOL CIRCUIT BREAKER
// =====================================
 
import {
  toolExecutorState
}
from "./tool-state.js";

import {
  TOOL_EXECUTOR_CONFIG
}
from "./tool-config.js";



// =====================================
// GET BREAKER
// =====================================

export function getCircuitBreaker(
  toolId
){

  if(

    !toolExecutorState
    .circuitBreakers
    .has(toolId)

  ){

    toolExecutorState
    .circuitBreakers
    .set(toolId,{

      failures:0,

      blockedUntil:0

    });

  }

  return toolExecutorState
  .circuitBreakers
  .get(toolId);

}



// =====================================
// IS BLOCKED
// =====================================

export function isCircuitBlocked(
  toolId
){

  const breaker =
  getCircuitBreaker(
    toolId
  );

  if(

    breaker.blockedUntil <=
    Date.now()

  ){

    breaker.failures = 0;

    breaker.blockedUntil = 0;

    return false;

  }

  return true;

}



// =====================================
// REGISTER FAILURE
// =====================================

export function registerCircuitFailure(
  toolId
){

  const breaker =
  getCircuitBreaker(
    toolId
  );

  breaker.failures++;

  if(

    breaker.failures >=

    TOOL_EXECUTOR_CONFIG
    .CIRCUIT_BREAKER_THRESHOLD

  ){

    breaker.blockedUntil =

      Date.now() +

      TOOL_EXECUTOR_CONFIG
      .CIRCUIT_BREAKER_RESET;

  }

  return true;

}



// =====================================
// RESET BREAKER
// =====================================

export function resetCircuitBreaker(
  toolId
){

  const breaker =
  getCircuitBreaker(
    toolId
  );

  breaker.failures = 0;

  breaker.blockedUntil = 0;

  return true;

}
