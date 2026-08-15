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
  getRegisteredTool
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
  getRegisteredTool(
    normalizedId
  );

  if(!tool){

    return createStructuredError(
      "TOOL_NOT_FOUND",
      "Tool does not exist"
    );

  }

  if(
    TOOL_EXECUTOR_CONFIG.ENABLE_TOOL_DISABLE
    &&
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

  let controller =

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

  const maximumAttempts =
  TOOL_EXECUTOR_CONFIG.ENABLE_TOOL_RETRIES
  ? tool.retries
  : 1;

  try{

    while(
      attempts < maximumAttempts
    ){

      attempts++;

      if(
        attempts > 1 &&
        TOOL_EXECUTOR_CONFIG.ENABLE_ABORT_CONTROLLERS
      ){

        controller =
        new AbortController();

        const activeExecution =
        toolExecutorState
        .activeExecutions
        .get(executionId);

        if(activeExecution){
          activeExecution.controller = controller;
        }

      }

      const activeExecution =
      toolExecutorState
      .activeExecutions
      .get(executionId);

      if(activeExecution){
        activeExecution.retries = attempts - 1;
      }

      try{

        const execute = () => {

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

        };

        const result =
        TOOL_EXECUTOR_CONFIG.ENABLE_TOOL_TIMEOUTS
        ? await executeWithTimeout(
            execute,
            tool.timeout,
            controller
          )
        : await Promise.resolve()
          .then(execute);

        resetCircuitBreaker(
          normalizedId
        );

        if(TOOL_EXECUTOR_CONFIG.ENABLE_RUNTIME_METADATA){

          tool.runtime.executions++;

          tool.runtime.updatedAt =
          Date.now();

          tool.runtime.lastExecutedAt =
          Date.now();

          toolExecutorState
          .lastExecutionAt =
          Date.now();

        }

        if(TOOL_EXECUTOR_CONFIG.ENABLE_EXECUTION_HISTORY){

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

        }

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

        if(error?.message === "TOOL_TIMEOUT"){
          toolExecutorState
          .diagnostics
          .timedOut++;
        }

        registerCircuitFailure(
          normalizedId
        );

        if(TOOL_EXECUTOR_CONFIG.ENABLE_RUNTIME_METADATA){
          tool.runtime.failures++;
          tool.runtime.updatedAt = Date.now();
        }

        toolExecutorState
        .diagnostics
        .failed++;

        if(
          attempts >= maximumAttempts
        ){

          const duration =

            Date.now() -

            toolExecutorState
            .activeExecutions
            .get(executionId)
            .startedAt;

          if(TOOL_EXECUTOR_CONFIG.ENABLE_EXECUTION_HISTORY){

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

          }

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
