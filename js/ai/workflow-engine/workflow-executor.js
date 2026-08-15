// =====================================
// RIGO AI
// WORKFLOW EXECUTOR
// =====================================

import {
  WORKFLOW_ENGINE_CONFIG
}
from "./workflow-config.js";

import {
  WORKFLOW_STATES,
  WORKFLOW_STEP_STATES,
  WORKFLOW_EVENTS
}
from "./workflow-constants.js";

import {
  workflowEngineState
}
from "./workflow-state.js";

import {
  normalizeWorkflowId,
  cloneWorkflowObject,
  isWorkflowContextValid,
  delayWorkflowExecution,
  trimWorkflowHistory,
  cleanupWorkflowRuntime,
  updateWorkflowTimestamp,
  isWorkflowExecutable,
  safelyExecuteStep
}
from "./workflow-utils.js";

import {
  emitWorkflowEvent
}
from "./workflow-events.js";

import {
  validateStepCondition
}
from "./workflow-conditions.js";

import {
  drainWorkflowQueue
}
from "./workflow-queue.js";

import ServiceManager
from "../../services/service-manager.js";


// =====================================
// STEP ROUTING
// =====================================

async function executeToolStep(
  workflow,
  step,
  context
){

  const tools =
  await ServiceManager.resolve(
    "tools"
  );

  if(
    !tools ||
    typeof tools.execute !== "function"
  ){
    throw new Error(
      "TOOL_EXECUTOR_UNAVAILABLE"
    );
  }

  const result =
  await tools.execute(
    step.assignedTool,
    {
      ...cloneWorkflowObject(
        step.input || {}
      ),
      objective:
      step.objective,
      workflowId:
      workflow.id,
      stepId:
      step.id,
      context:
      cloneWorkflowObject(context)
    },
    {
      source:
      "workflow-engine",
      workflowId:
      workflow.id,
      stepId:
      step.id,
      ...cloneWorkflowObject(
        step.metadata || {}
      )
    }
  );

  if(
    !result ||
    result.success === false
  ){
    throw new Error(
      result?.error?.message ||
      result?.message ||
      result?.code ||
      "WORKFLOW_TOOL_EXECUTION_FAILED"
    );
  }

  return result;

}


async function executeAgentStep(
  workflow,
  step,
  context
){

  const agents =
  await ServiceManager.resolve(
    "agents"
  );

  if(
    !agents ||
    typeof agents.execute !== "function"
  ){
    throw new Error(
      "AGENT_MANAGER_UNAVAILABLE"
    );
  }

  const result =
  await agents.execute(
    step.assignedAgent,
    {
      type:
      "workflow-step",
      input:{
        ...cloneWorkflowObject(
          step.input || {}
        ),
        objective:
        step.objective,
        workflowId:
        workflow.id,
        stepId:
        step.id,
        context:
        cloneWorkflowObject(context)
      },
      metadata:{
        source:
        "workflow-engine",
        workflowId:
        workflow.id,
        stepId:
        step.id,
        ...cloneWorkflowObject(
          step.metadata || {}
        )
      }
    }
  );

  if(
    !result ||
    result.queued === true
  ){
    throw new Error(
      result?.queued === true
      ? "WORKFLOW_AGENT_EXECUTION_QUEUED"
      : "WORKFLOW_AGENT_EXECUTION_FAILED"
    );
  }

  return result;

}


async function routeWorkflowStep(
  workflow,
  step,
  context
){

  if(step.assignedTool){
    return executeToolStep(
      workflow,
      step,
      context
    );
  }

  if(step.assignedAgent){
    return executeAgentStep(
      workflow,
      step,
      context
    );
  }

  if(
    typeof step.execute ===
    "function"
  ){
    return safelyExecuteStep(
      workflow,
      step,
      {
        workflow,
        step,
        context:
        cloneWorkflowObject(context)
      }
    );
  }

  throw new Error(
    "WORKFLOW_STEP_HAS_NO_EXECUTOR"
  );

}


// =====================================
// STEP EXECUTION
// =====================================

export async function executeWorkflowStep(
  workflow,
  originalStep,
  context = {}
){

  const step =
  cloneWorkflowObject(
    originalStep
  );

  const validCondition =
  await validateStepCondition(
    step,
    context
  );

  if(!validCondition){
    return {
      ...step,
      state:
      WORKFLOW_STEP_STATES
      .SKIPPED
    };
  }

  let attempts = 0;

  while(
    attempts <
    WORKFLOW_ENGINE_CONFIG
    .MAX_RETRIES
  ){

    attempts++;

    try{

      step.state =
      WORKFLOW_STEP_STATES
      .RUNNING;

      await emitWorkflowEvent(
        WORKFLOW_EVENTS
        .STEP_STARTED,
        {
          workflowId:
          workflow.id,
          stepId:
          step.id
        }
      );

      const result =
      await routeWorkflowStep(
        workflow,
        step,
        context
      );

      step.result =
      cloneWorkflowObject(result);

      step.error =
      null;

      step.state =
      WORKFLOW_STEP_STATES
      .COMPLETED;

      step.retries =
      attempts - 1;

      workflowEngineState
      .diagnostics
      .executedSteps++;

      await emitWorkflowEvent(
        WORKFLOW_EVENTS
        .STEP_COMPLETED,
        {
          workflowId:
          workflow.id,
          stepId:
          step.id
        }
      );

      return step;

    }
    catch(error){

      workflowEngineState
      .diagnostics
      .retries++;

      if(
        attempts >=
        WORKFLOW_ENGINE_CONFIG
        .MAX_RETRIES
      ){

        step.state =
        WORKFLOW_STEP_STATES
        .FAILED;

        step.retries =
        attempts;

        step.error =
        error?.message ||
        String(error);

        await emitWorkflowEvent(
          WORKFLOW_EVENTS
          .STEP_FAILED,
          {
            workflowId:
            workflow.id,
            stepId:
            step.id,
            error:
            step.error
          }
        );

        return step;

      }

      await delayWorkflowExecution(
        WORKFLOW_ENGINE_CONFIG
        .RETRY_DELAY
      );

    }

  }

}


// =====================================
// PARALLEL EXECUTION
// =====================================

export async function executeParallelSteps(
  workflow,
  steps = [],
  context = {}
){

  const limitedSteps =
  steps.slice(
    0,
    WORKFLOW_ENGINE_CONFIG
    .MAX_PARALLEL_STEPS
  );

  return Promise.all(
    limitedSteps.map((step) => {
      return executeWorkflowStep(
        workflow,
        step,
        context
      );
    })
  );

}


// =====================================
// EXECUTE WORKFLOW
// =====================================

export async function executeWorkflow(
  workflowId,
  context = {}
){

  const normalizedId =
  normalizeWorkflowId(
    workflowId
  );

  if(!normalizedId){
    return false;
  }

  if(
    !isWorkflowContextValid(
      context
    )
  ){
    workflowEngineState
    .diagnostics
    .rejected++;
    return false;
  }

  const workflow =
  workflowEngineState
  .workflows
  .get(normalizedId);

  if(!workflow){
    return false;
  }

  if(
    !isWorkflowExecutable(
      workflow
    )
  ){
    return false;
  }

  if(
    workflowEngineState
    .executionLocks
    .has(normalizedId)
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

    if(
      workflowEngineState
      .executionQueue
      .length >=
      WORKFLOW_ENGINE_CONFIG
      .MAX_QUEUE_SIZE
    ){
      workflowEngineState
      .diagnostics
      .rejected++;
      return false;
    }

    if(
      workflowEngineState
      .queuedWorkflowIds
      .has(normalizedId)
    ){
      return {
        queued:true
      };
    }

    workflowEngineState
    .queuedWorkflowIds
    .add(normalizedId);

    workflowEngineState
    .executionQueue
    .push({
      workflowId:
      normalizedId,
      context
    });

    workflowEngineState
    .diagnostics
    .queued++;

    return {
      queued:true
    };

  }

  workflowEngineState
  .executionLocks
  .add(normalizedId);

  workflowEngineState
  .activeWorkflows
  .add(normalizedId);

  workflow.runtime.running =
  true;

  workflow.runtime.startedAt =
  Date.now();

  if(
    !workflow.runtime.controller &&
    typeof AbortController !==
    "undefined"
  ){
    workflow.runtime.controller =
    new AbortController();
  }

  workflow.state =
  WORKFLOW_STATES
  .RUNNING;

  updateWorkflowTimestamp(
    workflow
  );

  workflowEngineState
  .diagnostics
  .started++;

  await emitWorkflowEvent(
    WORKFLOW_EVENTS
    .STARTED,
    {
      workflowId:
      normalizedId
    }
  );

  try{

    const completedSteps = [];

    const parallelSteps =
    workflow.steps.filter(
      (step) => step.parallel === true
    );

    const sequentialSteps =
    workflow.steps.filter(
      (step) => step.parallel !== true
    );

    if(parallelSteps.length > 0){

      const results =
      await executeParallelSteps(
        workflow,
        parallelSteps,
        context
      );

      completedSteps.push(
        ...results
      );

      const parallelFailure =
      results.find((result) => {
        return (
          result.state !==
          WORKFLOW_STEP_STATES
          .COMPLETED &&
          result.state !==
          WORKFLOW_STEP_STATES
          .SKIPPED
        );
      });

      if(parallelFailure){
        throw new Error(
          parallelFailure.error ||
          "PARALLEL_WORKFLOW_STEP_FAILED"
        );
      }

    }

    for(
      const step
      of sequentialSteps
    ){

      if(
        workflow.runtime
        .controller
        ?.signal
        ?.aborted
      ){
        throw new Error(
          "WORKFLOW_TERMINATED"
        );
      }

      const result =
      await executeWorkflowStep(
        workflow,
        step,
        context
      );

      completedSteps.push(result);

      if(
        result.state !==
        WORKFLOW_STEP_STATES
        .COMPLETED &&
        result.state !==
        WORKFLOW_STEP_STATES
        .SKIPPED
      ){
        throw new Error(
          result.error ||
          "WORKFLOW_STEP_FAILED"
        );
      }

    }

    workflow.steps =
    completedSteps;

    workflow.state =
    WORKFLOW_STATES
    .COMPLETED;

    cleanupWorkflowRuntime(
      workflow
    );

    workflowEngineState
    .completedWorkflows
    .add(normalizedId);

    workflowEngineState
    .failedWorkflows
    .delete(normalizedId);

    workflowEngineState
    .executionHistory
    .push({
      workflowId:
      normalizedId,
      success:true,
      timestamp:
      Date.now()
    });

    trimWorkflowHistory();

    workflowEngineState
    .diagnostics
    .completed++;

    await emitWorkflowEvent(
      WORKFLOW_EVENTS
      .COMPLETED,
      {
        workflowId:
        normalizedId
      }
    );

    return true;

  }
  catch(error){

    workflow.state =
    WORKFLOW_STATES
    .FAILED;

    workflow.retries++;

    workflowEngineState
    .failedWorkflows
    .add(normalizedId);

    workflowEngineState
    .executionHistory
    .push({
      workflowId:
      normalizedId,
      success:false,
      error:
      error?.message ||
      String(error),
      timestamp:
      Date.now()
    });

    trimWorkflowHistory();

    workflowEngineState
    .diagnostics
    .failed++;

    await emitWorkflowEvent(
      WORKFLOW_EVENTS
      .FAILED,
      {
        workflowId:
        normalizedId,
        error:
        error?.message ||
        String(error)
      }
    );

    return false;

  }
  finally{

    cleanupWorkflowRuntime(
      workflow
    );

    workflowEngineState
    .activeWorkflows
    .delete(normalizedId);

    workflowEngineState
    .executionLocks
    .delete(normalizedId);

    drainWorkflowQueue(
      executeWorkflow
    );

  }

}


// =====================================
// TERMINATE
// =====================================

export async function terminateWorkflow(
  workflowId
){

  const normalizedId =
  normalizeWorkflowId(
    workflowId
  );

  const workflow =
  workflowEngineState
  .workflows
  .get(normalizedId);

  if(!workflow){
    return false;
  }

  workflow.runtime
  .controller
  ?.abort();

  workflow.state =
  WORKFLOW_STATES
  .TERMINATED;

  cleanupWorkflowRuntime(
    workflow
  );

  workflowEngineState
  .activeWorkflows
  .delete(normalizedId);

  workflowEngineState
  .executionLocks
  .delete(normalizedId);

  workflowEngineState
  .queuedWorkflowIds
  .delete(normalizedId);

  workflowEngineState
  .diagnostics
  .terminated++;

  await emitWorkflowEvent(
    WORKFLOW_EVENTS
    .TERMINATED,
    {
      workflowId:
      normalizedId
    }
  );

  return true;

}
