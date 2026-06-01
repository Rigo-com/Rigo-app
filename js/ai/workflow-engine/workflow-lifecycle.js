// =====================================
// RIGO AI
// WORKFLOW LIFECYCLE
// =====================================

import {
  workflowEngineState
}
from "./workflow-state.js";

import {
  terminateWorkflow
}
from "./workflow-executor.js";



// =====================================
// RESET
// =====================================

export async function resetWorkflowEngine(){

  for(
    const workflowId
    of
    workflowEngineState
    .activeWorkflows
  ){

    await terminateWorkflow(
      workflowId
    );

  }

  workflowEngineState
  .workflows
  .clear();

  workflowEngineState
  .activeWorkflows
  .clear();

  workflowEngineState
  .executionLocks
  .clear();

  workflowEngineState
  .executionQueue =
  [];

  workflowEngineState
  .queuedWorkflowIds
  .clear();

  workflowEngineState
  .executionHistory =
  [];

  workflowEngineState
  .completedWorkflows
  .clear();

  workflowEngineState
  .failedWorkflows
  .clear();

  workflowEngineState
.diagnostics
.created = 0;

workflowEngineState
.diagnostics
.started = 0;

workflowEngineState
.diagnostics
.completed = 0;

workflowEngineState
.diagnostics
.failed = 0;

workflowEngineState
.diagnostics
.terminated = 0;

workflowEngineState
.diagnostics
.executedSteps = 0;

workflowEngineState
.diagnostics
.retries = 0;

workflowEngineState
.diagnostics
.queued = 0;

workflowEngineState
.diagnostics
.rejected = 0;

  workflowEngineState
  .lastWorkflowAt =
  null;

  return true;

}



// =====================================
// SHUTDOWN
// =====================================

export async function shutdownWorkflowEngine(){

  workflowEngineState
  .shuttingDown =
  true;

  await resetWorkflowEngine();

  workflowEngineState
  .initialized =
  false;

  return true;

}



// =====================================
// INITIALIZE
// =====================================

export async function initializeWorkflowEngine(){

  if(
    workflowEngineState
    .initialized
  ){

    return true;

  }

  if(
    workflowEngineState
    .startupPromise
  ){

    return workflowEngineState
    .startupPromise;

  }

  workflowEngineState
  .startupPromise =

  (async () => {

    if(
      workflowEngineState
      .initializing
    ){

      return false;

    }

    workflowEngineState
    .initializing =
    true;

    try{

      workflowEngineState
      .initialized =
      true;

      workflowEngineState
      .shuttingDown =
      false;


      return true;

    }

    catch(error){

      workflowEngineState
      .initialized =
      false;

      return false;

    }

    finally{

      workflowEngineState
      .initializing =
      false;

      workflowEngineState
      .startupPromise =
      null;

    }

  })();

  return workflowEngineState
  .startupPromise;

}
