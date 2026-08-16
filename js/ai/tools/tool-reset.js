// =====================================
// RIGO AI
// TOOL RESET
// =====================================

import {
  toolExecutorState
}
from "./tool-state.js";

import {
  cancelExecution
}
from "./tool-queue.js";



export async function
resetToolExecutor(){

  for(
    const executionId
    of
    toolExecutorState
    .activeExecutions
    .keys()
  ){

    try{

      await cancelExecution(
        executionId
      );

     }

     catch(error){}

  } 

  toolExecutorState
  .tools
  .clear();

  toolExecutorState
  .toolIndex
  .clear();

  toolExecutorState
  .executionQueue = [];

  toolExecutorState
  .activeExecutions
  .clear();

  toolExecutorState
  .executionHistory = [];

  toolExecutorState
  .permissionCache
  .clear();

  toolExecutorState
  .disabledTools
  .clear();

  toolExecutorState
  .circuitBreakers
  .clear();

  toolExecutorState
  .lastExecutionAt = null;

  Object.keys(
    toolExecutorState.diagnostics
  )
  .forEach((key) => {
    toolExecutorState.diagnostics[key] = 0;
  });

  return true;

}
