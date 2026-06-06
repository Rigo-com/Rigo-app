// =====================================
// RIGO AI
// TOOL QUEUE
// EXECUTION QUEUE SYSTEM
// =====================================

import {
  TOOL_EXECUTOR_CONFIG
}
from "./tool-config.js";

import {
  TOOL_EXECUTION_STATES,
  TOOL_EVENTS
}
from "./tool-constants.js";

import {
  toolExecutorState
}
from "./tool-state.js";

import {
  cloneToolObject,
  freezeToolObject,
  createStructuredError,
  createExecutionId,
  delayExecution
}
from "./tool-utils.js";

import {
  emitToolEvent
}
from "./tool-events.js";

import {
  executeTool
}
from "./tool-executor.js";



// =====================================
// CANCEL EXECUTION
// =====================================

export async function cancelExecution(
  executionId
){

  const execution =
  toolExecutorState
  .activeExecutions
  .get(
    executionId
  );

  if(!execution){

    return false;

  }

  execution.controller
  ?.abort();

  execution.state =
  TOOL_EXECUTION_STATES
  .CANCELLED;

  toolExecutorState
  .diagnostics
  .cancelled++;

  toolExecutorState
  .executionQueue =

    toolExecutorState
    .executionQueue
    .filter((queued) => {

      return (
        queued.id !==
        executionId
      );

    });

  await emitToolEvent(

    TOOL_EVENTS
    .EXECUTION_CANCELLED,

    {
      executionId
    }

  );

  return true;

}



// =====================================
// QUEUE EXECUTION
// =====================================

export function queueExecution(
  toolId,
  payload,
  context,
  priority = 1
){

  if(

    toolExecutorState
    .executionQueue
    .length >=

    TOOL_EXECUTOR_CONFIG
    .MAX_QUEUE_SIZE

  ){

    return createStructuredError(

      "QUEUE_FULL",

      "Execution queue full"

    );

  }

  const duplicate =
  toolExecutorState
  .executionQueue
  .find((queued) => {

    return (

      queued.toolId ===
      toolId

      &&

      JSON.stringify(
        queued.payload
      ) ===

      JSON.stringify(
        payload
      )

    );

  });

  if(duplicate){

    return freezeToolObject({

      queued:true,

      queueId:
      duplicate.id,

      duplicate:true

    });

  }

  const queuedExecution = {

    id:
    createExecutionId(),

    toolId,

    payload:
    cloneToolObject(
      payload
    ),

    context:
    cloneToolObject(
      context
    ),

    priority,

    state:
    TOOL_EXECUTION_STATES
    .QUEUED,

    createdAt:
    Date.now()

  };

  toolExecutorState
  .executionQueue
  .push(
    queuedExecution
  );

  toolExecutorState
  .executionQueue
  .sort((a,b) => {

    return (
      b.priority -
      a.priority
    );

  });

  toolExecutorState
  .diagnostics
  .queued++;

  emitToolEvent(

    TOOL_EVENTS
    .EXECUTION_QUEUED,

    {
      queueId:
      queuedExecution.id
    }

  );

  return freezeToolObject({

    queued:true,

    queueId:
    queuedExecution.id,

    position:

      toolExecutorState
      .executionQueue
      .length

  });

}



// =====================================
// PROCESS QUEUE
// =====================================

export async function processExecutionQueue(){

  if(
    toolExecutorState
    .processing
  ){

    return false;

  }

  toolExecutorState
  .processing =
  true;

  try{

    while(

      toolExecutorState
      .initialized

      &&

      !toolExecutorState
      .shuttingDown

    ){

      while(

        toolExecutorState
        .activeExecutions
        .size <

        TOOL_EXECUTOR_CONFIG
        .MAX_CONCURRENT_EXECUTIONS

        &&

        toolExecutorState
        .executionQueue
        .length > 0

      ){

        const queued =

          toolExecutorState
          .executionQueue
          .shift();

        executeTool(
          queued.toolId,
          queued.payload,
          queued.context
        )
        .catch(() => {});

            }

      await delayExecution(

        TOOL_EXECUTOR_CONFIG
        .QUEUE_PROCESSOR_DELAY

      );

    }

    return true;

  }

  finally{

    toolExecutorState
    .processing =
    false;

  }

}
