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

  const executions = [
    ...workflowEngineState.executions.values()
  ];

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

  if(executions.length > 0){
    await Promise.allSettled(executions);
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
  .executions
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

  Object.keys(workflowEngineState.diagnostics)
  .forEach((key) => {
    workflowEngineState.diagnostics[key] = 0;
  });

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

  const startupPromise =
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

    }

  })();

  workflowEngineState.startupPromise = startupPromise;

  try{
    return await startupPromise;
  }
  finally{
    if(workflowEngineState.startupPromise === startupPromise){
      workflowEngineState.startupPromise = null;
    }
  }

}
