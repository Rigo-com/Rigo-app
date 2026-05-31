// =====================================
// RIGO AI
// TOOL EXECUTOR
// EXECUTION RUNTIME
// =====================================

import {
  TOOL_EXECUTOR_CONFIG
}
from "./tool-config.js";

import {
  TOOL_EVENTS,
  TOOL_EXECUTION_STATES
}
from "./tool-constants.js";

import {
  toolExecutorState
}
from "./tool-state.js";

import {
  normalizeToolName,
  cloneToolObject,
  freezeToolObject,
  createStructuredError,
  createExecutionId,
  delayExecution,
  trimExecutionHistory
}
from "./tool-utils.js";

import {
  getTool
}
from "./tool-registry.js";

import {
  queueExecution
}
from "./tool-queue.js";

import {
  emitToolEvent
}
from "./tool-events.js";

import {
  isCircuitBlocked,
  registerCircuitFailure,
  resetCircuitBreaker
}
from "./tool-circuit-breaker.js";



// =====================================
// PAYLOAD VALIDATION
// =====================================

export function validatePayload(
  payload
){

  try{

    return (

      JSON.stringify(payload)
      .length <=

      TOOL_EXECUTOR_CONFIG
      .MAX_PAYLOAD_SIZE

    );

  }

  catch(error){

    return false;

  }

}



// =====================================
// EXECUTION TIMEOUT
// =====================================

export async function executeWithTimeout(
  callback,
  timeout,
  controller = null
){

  let timeoutId =
  null;

  try{

    const timeoutPromise =
    new Promise((_,reject) => {

      timeoutId =
      setTimeout(() => {

        controller
        ?.abort();

        reject(
          new Error(
            "TOOL_TIMEOUT"
          )
        );

      },timeout);

    });

    return await Promise.race([

      Promise.resolve()
      .then(callback),

      timeoutPromise

    ]);

  }

  finally{

    if(timeoutId){

      clearTimeout(
        timeoutId
      );

    }

  }

}



// =====================================
// EXECUTE TOOL
// =====================================

export async function executeTool(
  toolId,
  payload = {},
  context = {}
){

  const normalizedId =
  normalizeToolName(
    toolId
  );

  const tool =
  getTool(
    normalizedId
  );

  if(!tool){

    return createStructuredError(
      "TOOL_NOT_FOUND",
      "Tool does not exist"
    );

  }

  if(

    toolExecutorState
    .disabledTools
    .has(normalizedId)

  ){

    return createStructuredError(
      "TOOL_DISABLED",
      "Tool is disabled"
    );

  }

  if(
    isCircuitBlocked(
      normalizedId
    )
  ){

    return createStructuredError(
      "CIRCUIT_BLOCKED",
      "Circuit breaker active"
    );

  }

  if(
    !validatePayload(
      payload
    )
  ){

    toolExecutorState
    .diagnostics
    .rejected++;

    return createStructuredError(
      "INVALID_PAYLOAD",
      "Payload too large"
    );

  }

  if(

    toolExecutorState
    .activeExecutions
    .size >=

    TOOL_EXECUTOR_CONFIG
    .MAX_CONCURRENT_EXECUTIONS

  ){

    return queueExecution(

      normalizedId,
      payload,
      context,
      tool.priority

    );

  }

  const executionId =
  createExecutionId();

  const controller =

    TOOL_EXECUTOR_CONFIG
    .ENABLE_ABORT_CONTROLLERS

    ?

    new AbortController()

    :

    null;

  toolExecutorState
  .activeExecutions
  .set(

    executionId,

    {

      toolId:
      normalizedId,

      startedAt:
      Date.now(),

      controller,

      retries:0,

      state:
      TOOL_EXECUTION_STATES
      .RUNNING

    }

  );

  await emitToolEvent(

    TOOL_EVENTS
    .EXECUTION_STARTED,

    {

      executionId,

      toolId:
      normalizedId

    }

  );

  let attempts = 0;

  try{

    while(
      attempts < tool.retries
    ){

      attempts++;

      try{

        const result =
        await executeWithTimeout(

          () => {

            return tool.execute({

              payload:
              cloneToolObject(
                payload
              ),

              context:
              cloneToolObject(
                context
              ),

              signal:
              controller
              ?.signal || null

            });

          },

          tool.timeout,

          controller

        );

        resetCircuitBreaker(
          normalizedId
        );

        tool.runtime.executions++;

        tool.runtime.updatedAt =
        Date.now();

        tool.runtime.lastExecutedAt =
        Date.now();

        toolExecutorState
        .lastExecutionAt =
        Date.now();

        toolExecutorState
        .executionHistory
        .push({

          executionId,

          toolId:
          normalizedId,

          success:true,

          duration:

            Date.now() -

            toolExecutorState
            .activeExecutions
            .get(executionId)
            .startedAt,

          timestamp:
          Date.now()

        });

        trimExecutionHistory();

        toolExecutorState
        .diagnostics
        .executed++;

        await emitToolEvent(

          TOOL_EVENTS
          .EXECUTION_COMPLETED,

          {

            executionId,

            toolId:
            normalizedId

          }

        );

        return freezeToolObject({

          success:true,

          executionId,

          result:
          cloneToolObject(
            result
          ),

          timestamp:
          Date.now()

        });

      }

      catch(error){

        registerCircuitFailure(
          normalizedId
        );

        tool.runtime.failures++;

        toolExecutorState
        .diagnostics
        .failed++;

        if(
          attempts >= tool.retries
        ){

          const duration =

            Date.now() -

            toolExecutorState
            .activeExecutions
            .get(executionId)
            .startedAt;

          toolExecutorState
          .executionHistory
          .push({

            executionId,

            toolId:
            normalizedId,

            success:false,

            error:
            String(error),

            duration,

            timestamp:
            Date.now()

          });

          trimExecutionHistory();

          await emitToolEvent(

            TOOL_EVENTS
            .EXECUTION_FAILED,

            {

              executionId,

              toolId:
              normalizedId,

              error:
              String(error)

            }

          );

          return createStructuredError(

            "EXECUTION_FAILED",

            String(error),

            {

              executionId,

              duration

            }

          );

        }

        toolExecutorState
        .diagnostics
        .retries++;

        await delayExecution(

          TOOL_EXECUTOR_CONFIG
          .RETRY_DELAY

        );

      }

    }

  }

  finally{

    toolExecutorState
    .activeExecutions
    .delete(
      executionId
    );

  }

}
