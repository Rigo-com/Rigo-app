// =====================================
// RIGO AI
// WORKFLOW QUEUE
// =====================================

import {
  WORKFLOW_ENGINE_CONFIG
}
from "./workflow-config.js";

import {
  workflowEngineState
}
from "./workflow-state.js";



// =====================================
// DRAIN QUEUE
// =====================================

export function drainWorkflowQueue(
  executor
){

  if(

    workflowEngineState
    .executionQueue
    .length <= 0

  ){

    return false;

  }

  if(

    workflowEngineState
    .activeWorkflows
    .size >=

    WORKFLOW_ENGINE_CONFIG
    .MAX_CONCURRENT_WORKFLOWS

  ){

    return false;

  }

  const queuedWorkflow =
  workflowEngineState
  .executionQueue
  .shift();

  if(!queuedWorkflow){

    return false;

  }

  workflowEngineState
  .queuedWorkflowIds
  .delete(
    queuedWorkflow.workflowId
  );

  executor(

    queuedWorkflow.workflowId,

    queuedWorkflow.context

  )
  .catch(() => {});

  return true;

}
