// =====================================
// RIGO AI
// PLANNER EXECUTOR
// =====================================

import {
  plannerEngineState,
  incrementPlannerDiagnostic
}
from "./planner-state.js";

import {
  PLANNER_ENGINE_CONFIG
}
from "./planner-config.js";

import {
  PLAN_STATES,
  PLAN_STEP_STATES,
  PLAN_EVENTS
}
from "./planner-constants.js";

import {
  normalizePlanId,
  delayPlannerExecution,
  trimPlannerHistory
}
from "./planner-utils.js";

import {
  emitPlannerEvent
}
from "./planner-events.js";

import {
  generateExecutionPlan
}
from "./planner-plan.js";

import {
  getPlan
}
from "./planner-registry.js";

import {
  drainPlannerQueue,
  enqueuePlan,
  removeQueuedPlan
}
from "./planner-queue.js";

import ServiceManager
from "../../services/service-manager.js";


// =====================================
// EXECUTION HELPERS
// =====================================

async function executeAssignedTool(
  plan,
  step
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
      objective:
      step.objective,
      planId:
      plan.id,
      stepId:
      step.id,
      context:
      plan.context || {},
      metadata:
      plan.metadata || {}
    },
    {
      source:
      "planner-engine",
      planId:
      plan.id,
      stepId:
      step.id
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
      "PLANNER_TOOL_EXECUTION_FAILED"
    );
  }

  return result;

}


async function executeAssignedAgent(
  plan,
  step
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
      "planner-step",
      input:{
        objective:
        step.objective,
        planId:
        plan.id,
        stepId:
        step.id,
        context:
        plan.context || {},
        metadata:
        plan.metadata || {}
      },
      metadata:{
        source:
        "planner-engine",
        planId:
        plan.id,
        stepId:
        step.id
      }
    }
  );

  if(
    !result ||
    result.queued === true
  ){
    throw new Error(
      result?.queued === true
      ? "PLANNER_AGENT_EXECUTION_QUEUED"
      : "PLANNER_AGENT_EXECUTION_FAILED"
    );
  }

  return result;

}


// =====================================
// EXECUTE STEP
// =====================================

function executeWithPlanAbort(
  operation,
  signal
){

  if(!signal){
    return operation;
  }

  if(signal.aborted){
    return Promise.reject(
      new Error("PLAN_TERMINATED")
    );
  }

  return new Promise((resolve,reject) => {

    const abort = () => {
      reject(new Error("PLAN_TERMINATED"));
    };

    signal.addEventListener(
      "abort",
      abort,
      {once:true}
    );

    Promise.resolve(operation)
    .then(resolve,reject)
    .finally(() => {
      signal.removeEventListener("abort",abort);
    });

  });

}

export async function executePlanStep(
  plan,
  step
){

  let attempts = 0;

  const maximumAttempts =
  PLANNER_ENGINE_CONFIG.ENABLE_REPLANNING
  ? PLANNER_ENGINE_CONFIG.MAX_RETRIES
  : 1;

  while(
    attempts <
    maximumAttempts
  ){

    attempts++;

    try{

      let result = null;
      let executor = null;

      if(step.assignedTool){

        executor =
        "tool";

        result =
        await executeWithPlanAbort(
          executeAssignedTool(plan,step),
          plan.runtime.controller?.signal
        );

      }
      else if(step.assignedAgent){

        executor =
        "agent";

        result =
        await executeWithPlanAbort(
          executeAssignedAgent(plan,step),
          plan.runtime.controller?.signal
        );

      }
      else{

        throw new Error(
          "PLAN_STEP_HAS_NO_EXECUTOR"
        );

      }

      return {
        ...step,
        result,
        executor,
        retries:
        attempts - 1,
        state:
        PLAN_STEP_STATES
        .COMPLETED
      };

    }
    catch(error){

      if(
        error?.message === "PLAN_TERMINATED" ||
        attempts >= maximumAttempts
      ){

        return {
          ...step,
          error:
          error?.message ||
          String(error),
          retries:
          attempts - 1,
          state:
          PLAN_STEP_STATES
          .FAILED
        };

      }

      incrementPlannerDiagnostic("replans");

      await delayPlannerExecution(
        PLANNER_ENGINE_CONFIG
        .RETRY_DELAY
      );

    }

  }

}


// =====================================
// EXECUTE PLAN
// =====================================

export async function executePlan(
  planId
){

  const normalizedId =
  normalizePlanId(
    planId
  );

  if(
    plannerEngineState
    .executionLocks
    .has(normalizedId)
  ){
    return false;
  }

  const plan =
  plannerEngineState
  .plans
  .get(normalizedId);

  if(!plan){
    return false;
  }

  if(
    plannerEngineState
    .activePlans
    .size >=
    PLANNER_ENGINE_CONFIG
    .MAX_PARALLEL_PLANS
  ){

    const queued =
    enqueuePlan(normalizedId);

    if(!queued.queued){
      incrementPlannerDiagnostic("rejected");
    }

    return queued;

  }

  plannerEngineState
  .executionLocks
  .add(normalizedId);

  plannerEngineState
  .activePlans
  .add(normalizedId);

  plan.runtime.running =
  true;

  plan.runtime.startedAt =
  Date.now();

  if(
    typeof AbortController !==
    "undefined"
  ){
    plan.runtime.controller =
    new AbortController();
  }

  const timeoutId =
  setTimeout(() => {
    plan.runtime.controller?.abort();
  },plan.timeout || PLANNER_ENGINE_CONFIG.PLAN_TIMEOUT);

  plan.state =
  PLAN_STATES
  .EXECUTING;

  incrementPlannerDiagnostic("executed");

  try{

    const completedSteps = [];

    for(
      const step
      of plan.steps
    ){

      if(
        plan.runtime
        .controller
        ?.signal
        ?.aborted
      ){
        throw new Error(
          "PLAN_TERMINATED"
        );
      }

      const result =
      await executePlanStep(
        plan,
        step
      );

      completedSteps.push(
        result
      );

      if(
        result.state !==
        PLAN_STEP_STATES
        .COMPLETED
      ){
        throw new Error(
          result.error ||
          "PLAN_STEP_FAILED"
        );
      }

    }

    plan.steps =
    completedSteps;

    plan.state =
    PLAN_STATES
    .COMPLETED;

    plan.runtime.running =
    false;

    plan.runtime.completedAt =
    Date.now();

    plannerEngineState
    .completedPlans
    .add(normalizedId);

    incrementPlannerDiagnostic("completed");

    if(PLANNER_ENGINE_CONFIG.ENABLE_EXECUTION_HISTORY){
      plannerEngineState.executionHistory.push({
        planId:normalizedId,
        success:true,
        completedAt:Date.now()
      });
      trimPlannerHistory();
    }

    await emitPlannerEvent(
      PLAN_EVENTS
      .COMPLETED,
      {
        planId:
        normalizedId
      }
    );

    return true;

  }
  catch(error){

    plan.state =
    PLAN_STATES
    .FAILED;

    plan.runtime.running =
    false;

    plannerEngineState
    .failedPlans
    .add(normalizedId);

    incrementPlannerDiagnostic("failed");

    if(PLANNER_ENGINE_CONFIG.ENABLE_EXECUTION_HISTORY){
      plannerEngineState.executionHistory.push({
        planId:normalizedId,
        success:false,
        error:error?.message || String(error),
        failedAt:Date.now()
      });
      trimPlannerHistory();
    }

    await emitPlannerEvent(
      PLAN_EVENTS
      .FAILED,
      {
        planId:
        normalizedId,
        error:
        error?.message ||
        String(error)
      }
    );

    return false;

  }
  finally{

    clearTimeout(timeoutId);

    plan.runtime.running =
    false;

    plan.runtime.controller =
    null;

    plannerEngineState
    .activePlans
    .delete(normalizedId);

    plannerEngineState
    .executionLocks
    .delete(normalizedId);

    drainPlannerQueue(
      executePlan
    )
    .catch(() => {});

  }

}


// =====================================
// TERMINATE PLAN
// =====================================

export async function terminatePlan(
  planId
){

  if(!PLANNER_ENGINE_CONFIG.ENABLE_PLAN_ABORT){
    return false;
  }

  const normalizedId =
  normalizePlanId(
    planId
  );

  const plan =
  plannerEngineState
  .plans
  .get(normalizedId);

  if(!plan){
    return false;
  }

  plan.runtime
  ?.controller
  ?.abort();

  plan.runtime.running =
  false;

  plan.runtime.terminatedAt =
  Date.now();

  plan.state =
  PLAN_STATES
  .FAILED;

  plannerEngineState
  .activePlans
  .delete(normalizedId);

  plannerEngineState
  .queuedPlans
  .delete(normalizedId);

  removeQueuedPlan(normalizedId);

  plannerEngineState
  .executionLocks
  .delete(normalizedId);

  plannerEngineState
  .failedPlans
  .add(normalizedId);

  incrementPlannerDiagnostic("terminated");

  await emitPlannerEvent(
    PLAN_EVENTS
    .FAILED,
    {
      planId:
      normalizedId,
      terminated:true
    }
  );

  return true;

}


// =====================================
// PROCESS REQUEST
// =====================================

export async function processPlannerRequest(
  payload = {}
){

  const plan =
  await generateExecutionPlan(
    payload
  );

  if(!plan){
    return false;
  }

  const execution =
  await executePlan(
    plan.id
  );

  if(
    execution?.queued === true
  ){
    return getPlan(
      plan.id
    );
  }

  return getPlan(
    plan.id
  );

}
