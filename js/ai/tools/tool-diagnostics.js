// =====================================
// RIGO AI
// TOOL DIAGNOSTICS
// ENTERPRISE TOOL MONITORING
// =====================================

import {
  toolExecutorState
}
from "./tool-state.js";

import {
  cloneToolObject,
  freezeToolObject
}
from "./tool-utils.js";

import {
  TOOL_EXECUTOR_CONFIG
}
from "./tool-config.js";



// =====================================
// DIAGNOSTICS
// =====================================

export function getToolDiagnostics(){

  return freezeToolObject({

    initialized:
    toolExecutorState
    .initialized,

    tools:

      toolExecutorState
      .tools
      .size,

    queue:

      toolExecutorState
      .executionQueue
      .length,

    active:

      toolExecutorState
      .activeExecutions
      .size,

    history:

      toolExecutorState
      .executionHistory
      .length,

    diagnostics:
    cloneToolObject(

      toolExecutorState
      .diagnostics

    ),

    lastExecutionAt:
    toolExecutorState
    .lastExecutionAt

  });

}



// =====================================
// SNAPSHOT
// =====================================

export function createToolExecutorSnapshot(){

  return freezeToolObject({

    initialized:
    toolExecutorState
    .initialized,

    tools:

      toolExecutorState
      .tools
      .size,

    queue:

      toolExecutorState
      .executionQueue
      .length,

    active:

      toolExecutorState
      .activeExecutions
      .size,

    timestamp:
    Date.now()

  });

}



// =====================================
// HEALTH
// =====================================

export function getToolExecutorHealth(){

  return freezeToolObject({

    initialized:
    toolExecutorState
    .initialized,

    healthy:

      toolExecutorState
      .activeExecutions
      .size <=

      TOOL_EXECUTOR_CONFIG
      .MAX_CONCURRENT_EXECUTIONS,

    diagnostics:
    getToolDiagnostics(),

    timestamp:
    Date.now()

  });

}
