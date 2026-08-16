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

  rollbackHandlers:
  {},

  diagnostics:{

    executedPlans:
    0,

    executedOperations:
    0,

    failedOperations:
    0,

    rollbacks:
    0,

    rollbackFailures:
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
// ROLLBACK HANDLERS
// =====================================

function registerRollbackHandler(operationType,handler){
  if(!operationType || typeof handler !== "function")return false;
  executionEngineState.rollbackHandlers[operationType]=handler;
  return true;
}

function getRollbackHandler(operationType){
  return executionEngineState.rollbackHandlers[operationType] || null;
}

async function rollbackOperations(plan){
  const completed=Object.values(plan.graph.nodes)
  .filter(operation=>operation.status===ExecutionPlan.OperationStatus.COMPLETED)
  .reverse();

  const results=[];
  for(const operation of completed){
    const handler=getRollbackHandler(operation.type);
    if(!handler){
      results.push({ok:false,operationId:operation.id,error:`ROLLBACK_HANDLER_NOT_FOUND:${operation.type}`});
      continue;
    }
    try{
      const result=await handler(operation);
      if(result?.ok===false)throw new Error(result.error||"ROLLBACK_FAILED");
      operation.status=ExecutionPlan.OperationStatus.CANCELLED;
      results.push({ok:true,operationId:operation.id,result});
      executionEngineState.diagnostics.rollbacks++;
    }catch(error){
      results.push({ok:false,operationId:operation.id,error:error?.message||String(error)});
      executionEngineState.diagnostics.rollbackFailures++;
    }
  }
  const completedRollback=results.length>0 && results.every(item=>item.ok);
  plan.rollback.completed=completedRollback;
  plan.rollback.completedAt=Date.now();
  plan.rollback.results=results;
  if(completedRollback)plan.status=ExecutionPlan.Status.ROLLED_BACK;
  return {ok:completedRollback,results};
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

  if(
    result?.ok === false
  ){
    const error = new Error(
      result.error || "OPERATION_FAILED"
    );
    error.details = result;
    throw error;
  }

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

    const activeOperation =
    Object.values(plan.graph.nodes)
    .find(operation => operation.status === ExecutionPlan.OperationStatus.RUNNING);

    if(activeOperation){
      activeOperation.status = ExecutionPlan.OperationStatus.FAILED;
      activeOperation.error = error?.message || String(error);
      activeOperation.completedAt = Date.now();
    }

    executionEngineState.diagnostics.failedOperations++;

    plan.status =
    ExecutionPlan
    .Status
    .FAILED;

    plan.error =
    error?.message ||
    String(error);

    let rollback={ok:false,results:[]};
    if(plan.rollback?.enabled){
      rollback=await rollbackOperations(plan);
    }

    return {

      ok:false,

      error:
      plan.error,

      rolledBack:
      rollback.ok,

      rollback,

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

    rollbackHandlers:
    Object.keys(
      executionEngineState.rollbackHandlers
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

  registerRollbackHandler,

  getHandler,

  getRollbackHandler,

  rollbackOperations,

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

  registerRollbackHandler,

  getHandler,

  getRollbackHandler,

  rollbackOperations,

  executeOperation,

  executePlan,

  snapshot,

  ExecutionEngine

};

export default
ExecutionEngine;
