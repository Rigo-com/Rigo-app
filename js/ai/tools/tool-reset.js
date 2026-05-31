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

    cancelExecution(
      executionId
    )
    .catch(() => {});

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
  .processing = false;

  return true;

}
