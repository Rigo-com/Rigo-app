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
  .diagnostics = {

    created:0,

    started:0,

    completed:0,

    failed:0,

    terminated:0,

    executedSteps:0,

    retries:0,

    queued:0,

    rejected:0

  };

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

export async function initializeWorkflowEngine(
  WorkflowEngine
){

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

      if(
        typeof registerModule ===
        "function"
      ){

        await registerModule(

          "workflow-engine",

          async () => WorkflowEngine

        );

      }

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
