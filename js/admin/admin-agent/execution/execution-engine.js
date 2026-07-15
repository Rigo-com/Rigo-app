// =====================================
// RIGO AI
// EXECUTION ENGINE
// =====================================

import ExecutionPlan
from "./execution-plan.js";



// =====================================
// INTERNAL STATE
// =====================================

const executionEngineState =
Object.seal({

  initialized:
  false,

  running:
  false,

  activePlan:
  null,

  handlers:
  {},

  diagnostics:{

    executedPlans:
    0,

    executedOperations:
    0,

    failedOperations:
    0

  }

});



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  if(
    executionEngineState
    .initialized
  ){

    return true;

  }

  executionEngineState
  .initialized =
  true;

  return true;

}


// =====================================
// REGISTER HANDLER
// =====================================

function registerHandler(

  operationType,

  handler

){

  if(

    !operationType ||

    typeof handler !== "function"

  ){

    return false;

  }

  executionEngineState
  .handlers[
    operationType
  ] =
  handler;

  return true;

}



// =====================================
// GET HANDLER
// =====================================

function getHandler(

  operationType

){

  return (

    executionEngineState
    .handlers[
      operationType
    ] ||

    null

  );

}


// =====================================
// EXECUTE OPERATION
// =====================================

async function executeOperation(

  operation

){

  const handler =
  getHandler(

    operation.type

  );

  if(

    !handler

  ){

    throw new Error(

      `HANDLER_NOT_FOUND:${operation.type}`

    );

  }

  operation.status =
  ExecutionPlan
  .OperationStatus
  .RUNNING;

  operation.startedAt =
  Date.now();

  const result =
  await handler(
    operation
  );

  operation.status =
  ExecutionPlan
  .OperationStatus
  .COMPLETED;

  operation.completedAt =
  Date.now();

  operation.result =
  result;

  executionEngineState
  .diagnostics
  .executedOperations++;

  return result;

}


// =====================================
// EXECUTE PLAN
// =====================================

async function executePlan(

  plan

){

  initialize();

  if(

    !plan

  ){

    return {

      ok:false,

      error:
      "PLAN_NOT_FOUND"

    };

  }

  if(

    executionEngineState
    .running

  ){

    return {

      ok:false,

      error:
      "ENGINE_BUSY"

    };

  }

  executionEngineState
  .running =
  true;

  executionEngineState
  .activePlan =
  plan;

  plan.status =
  ExecutionPlan
  .Status
  .RUNNING;

  plan.execution.started =
  true;

  plan.execution.startedAt =
  Date.now();

  try{

    const nodes =
    Object.values(

      plan.graph.nodes

    );

    for(

      const operation

      of nodes

    ){

      await executeOperation(

        operation

      );

    }

    plan.status =
    ExecutionPlan
    .Status
    .COMPLETED;

    plan.execution.completed =
    true;

    plan.execution.completedAt =
    Date.now();

    executionEngineState
    .diagnostics
    .executedPlans++;

    return {

      ok:true,

      plan

    };

  }
  catch(error){

    plan.status =
    ExecutionPlan
    .Status
    .FAILED;

    plan.error =
    error?.message ||
    String(error);

    return {

      ok:false,

      error:
      plan.error,

      plan

    };

  }
  finally{

    executionEngineState
    .running =
    false;

    executionEngineState
    .activePlan =
    null;

  }

}


// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    initialized:
    executionEngineState
    .initialized,

    running:
    executionEngineState
    .running,

    activePlan:
    executionEngineState
    .activePlan
    ?.id || null,

    handlers:

    Object.keys(

      executionEngineState
      .handlers

    ),

    diagnostics:{

      ...executionEngineState
      .diagnostics

    }

  };

}


// =====================================
// API
// =====================================

const ExecutionEngine =
Object.freeze({

  initialize,

  registerHandler,

  getHandler,

  executeOperation,

  executePlan,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  registerHandler,

  getHandler,

  executeOperation,

  executePlan,

  snapshot,

  ExecutionEngine

};

export default
ExecutionEngine;
