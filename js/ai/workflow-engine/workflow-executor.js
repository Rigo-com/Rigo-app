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

      await safelyExecuteStep(

        workflow,

        step,

        {

          workflow,
          step,

          context:
          cloneWorkflowObject(
            context
          )

        }

      );

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

        await emitWorkflowEvent(

          WORKFLOW_EVENTS
          .STEP_FAILED,

          {

            workflowId:
            workflow.id,

            stepId:
            step.id,

            error:
            String(error)

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
  .get(
    normalizedId
  );

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
    .has(
      normalizedId
    )

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
      .has(
        normalizedId
      )

    ){

      return {
        queued:true
      };

    }

    workflowEngineState
    .queuedWorkflowIds
    .add(
      normalizedId
    );

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
  .add(
    normalizedId
  );

  workflowEngineState
  .activeWorkflows
  .add(
    normalizedId
  );

  workflow.runtime.running =
  true;

  workflow.runtime.startedAt =
  Date.now();

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

    if(
      parallelSteps.length > 0
    ){

      const results =
      await executeParallelSteps(

        workflow,
        parallelSteps,
        context

      );

      completedSteps.push(
        ...results
      );

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
          "WORKFLOW TERMINATED"
        );

      }

      const result =
      await executeWorkflowStep(

        workflow,
        step,
        context

      );

      completedSteps.push(
        result
      );

      if(

        result.state !==
        WORKFLOW_STEP_STATES
        .COMPLETED

        &&

        result.state !==
        WORKFLOW_STEP_STATES
        .SKIPPED

      ){

        throw new Error(
          "WORKFLOW STEP FAILED"
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
    .add(
      normalizedId
    );

    workflowEngineState
    .failedWorkflows
    .delete(
      normalizedId
    );

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

    cleanupWorkflowRuntime(
      workflow
    );

    workflowEngineState
    .failedWorkflows
    .add(
      normalizedId
    );

    workflowEngineState
    .diagnostics
    .failed++;

    return false;

  }

  finally{

    cleanupWorkflowRuntime(
      workflow
    );

    workflowEngineState
    .activeWorkflows
    .delete(
      normalizedId
    );

    workflowEngineState
    .executionLocks
    .delete(
      normalizedId
    );

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
  .get(
    normalizedId
  );

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
  .delete(
    normalizedId
  );

  workflowEngineState
  .executionLocks
  .delete(
    normalizedId
  );

  workflowEngineState
  .queuedWorkflowIds
  .delete(
    normalizedId
  );

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
