// =====================================
// RIGO AI
// WORKFLOW REGISTRY
// =====================================

import {
  workflowEngineState,
  incrementWorkflowDiagnostic
}
from "./workflow-state.js";

import {
  WORKFLOW_ENGINE_CONFIG
}
from "./workflow-config.js";

import {
  WORKFLOW_STATES,
  WORKFLOW_EVENTS
}
from "./workflow-constants.js";

import {
  normalizeWorkflowId,
  cloneWorkflowObject,
  freezeWorkflowObject
}
from "./workflow-utils.js";

import {
  createWorkflowObject
}
from "./workflow-workflow.js";

import {
  emitWorkflowEvent
}
from "./workflow-events.js";

import {
  terminateWorkflow
}
from "./workflow-executor.js";



// =====================================
// REGISTER
// =====================================

export async function registerWorkflow(
  config = {}
){

  if(
    workflowEngineState
    .shuttingDown
  ){

    return false;

  }

  if(

    workflowEngineState
    .workflows
    .size >=

    WORKFLOW_ENGINE_CONFIG
    .MAX_WORKFLOWS

  ){

    return false;

  }

  const workflow =
  createWorkflowObject(
    config
  );

  if(
    !workflow.id
  ){

    return false;

  }

  if(

    workflowEngineState
    .workflows
    .has(workflow.id)

  ){

    return false;

  }

  workflow.state =
  WORKFLOW_STATES
  .READY;

  workflowEngineState
  .workflows
  .set(
    workflow.id,
    workflow
  );

  incrementWorkflowDiagnostic("created");

  workflowEngineState
  .lastWorkflowAt =
  Date.now();

  await emitWorkflowEvent(

    WORKFLOW_EVENTS.CREATED,

    {
      workflowId:
      workflow.id
    }

  );

  return freezeWorkflowObject(
    cloneWorkflowObject(
      workflow
    )
  );

}



// =====================================
// GET
// =====================================

export function getWorkflow(
  workflowId
){

  const workflow =
  workflowEngineState
  .workflows
  .get(
    normalizeWorkflowId(
      workflowId
    )
  );

  if(!workflow){

    return null;

  }

  return freezeWorkflowObject(
    cloneWorkflowObject(
      workflow
    )
  );

}



// =====================================
// LIST
// =====================================

export function listWorkflows(){

  return freezeWorkflowObject(

    [

      ...workflowEngineState
      .workflows
      .values()

    ]
    .map((workflow) => {

      return cloneWorkflowObject(
        workflow
      );

    })

  );

}



// =====================================
// REMOVE
// =====================================

export async function removeWorkflow(
  workflowId
){

  const normalizedId =
  normalizeWorkflowId(
    workflowId
  );

  const workflow =
  workflowEngineState
  .workflows
  .get(
    normalizedId
  );

  if(!workflow){

    return false;

  }

  await terminateWorkflow(
    normalizedId
  );

  workflowEngineState
  .workflows
  .delete(
    normalizedId
  );

  workflowEngineState
  .completedWorkflows
  .delete(
    normalizedId
  );

  workflowEngineState
  .failedWorkflows
  .delete(
    normalizedId
  );

  workflowEngineState
  .queuedWorkflowIds
  .delete(
    normalizedId
  );

  return true;

}
