// =====================================
// RIGO AI
// WORKFLOW DIAGNOSTICS
// =====================================

import {
  WORKFLOW_ENGINE_CONFIG
}
from "./workflow-config.js";

import {
  workflowEngineState
}
from "./workflow-state.js";

import {
  freezeWorkflowObject,
  cloneWorkflowDiagnostics
}
from "./workflow-utils.js";



// =====================================
// SNAPSHOT
// =====================================

export function createWorkflowSnapshot(){

  return freezeWorkflowObject({

    initialized:
    workflowEngineState
    .initialized,

    initializing:
    workflowEngineState
    .initializing,

    shuttingDown:
    workflowEngineState
    .shuttingDown,

    workflows:
    workflowEngineState
    .workflows
    .size,

    activeWorkflows:
    workflowEngineState
    .activeWorkflows
    .size,

    executions:
    workflowEngineState
    .executions
    .size,

    completedWorkflows:
    workflowEngineState
    .completedWorkflows
    .size,

    failedWorkflows:
    workflowEngineState
    .failedWorkflows
    .size,

    queue:
    workflowEngineState
    .executionQueue
    .length,

    history:
    workflowEngineState
    .executionHistory
    .length,

    timestamp:
    Date.now()

  });

}



// =====================================
// HEALTH
// =====================================

export function getWorkflowHealthReport(){

  return freezeWorkflowObject({

    initialized:
    workflowEngineState
    .initialized,

    initializing:
    workflowEngineState
    .initializing,

    shuttingDown:
    workflowEngineState
    .shuttingDown,

    healthy:

      workflowEngineState.initialized === true &&
      workflowEngineState.shuttingDown === false &&
      workflowEngineState
      .activeWorkflows
      .size <=

      WORKFLOW_ENGINE_CONFIG
      .MAX_CONCURRENT_WORKFLOWS &&
      workflowEngineState.executionQueue.length <=
      WORKFLOW_ENGINE_CONFIG.MAX_QUEUE_SIZE,

    workflows:
    workflowEngineState
    .workflows
    .size,

    activeWorkflows:
    workflowEngineState
    .activeWorkflows
    .size,

    executions:
    workflowEngineState
    .executions
    .size,

    queue:
    workflowEngineState
    .executionQueue
    .length,

    diagnostics:
    cloneWorkflowDiagnostics(),

    timestamp:
    Date.now()

  });

}



// =====================================
// DIAGNOSTICS
// =====================================

export function getWorkflowDiagnostics(){

  return freezeWorkflowObject({

    initialized:
    workflowEngineState
    .initialized,

    initializing:
    workflowEngineState
    .initializing,

    shuttingDown:
    workflowEngineState
    .shuttingDown,

    workflows:
    workflowEngineState
    .workflows
    .size,

    activeWorkflows:
    workflowEngineState
    .activeWorkflows
    .size,

    executions:
    workflowEngineState
    .executions
    .size,

    completedWorkflows:
    workflowEngineState
    .completedWorkflows
    .size,

    failedWorkflows:
    workflowEngineState
    .failedWorkflows
    .size,

    queue:
    workflowEngineState
    .executionQueue
    .length,

    history:
    workflowEngineState
    .executionHistory
    .length,

    diagnostics:
    cloneWorkflowDiagnostics(),

    lastWorkflowAt:
    workflowEngineState
    .lastWorkflowAt

  });

}
