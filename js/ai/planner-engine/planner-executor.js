// =====================================
// RIGO AI
// PLANNER EXECUTOR
// =====================================

import {
  plannerEngineState
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
  drainPlannerQueue
}
from "./planner-queue.js";



// =====================================
// EXECUTE STEP
// =====================================

export async function executePlanStep(
  plan,
  step
){

  let attempts = 0;

  while(

    attempts <

    PLANNER_ENGINE_CONFIG
    .MAX_RETRIES

  ){

    attempts++;

    try{

      if(
        step.assignedTool
      ){

        if(
          typeof ToolExecutor ===
          "undefined"
        ){

          throw new Error(
            "TOOL EXECUTOR UNAVAILABLE"
          );

        }

        if(
          typeof ToolExecutor.execute !==
          "function"
        ){

          throw new Error(
            "INVALID TOOL EXECUTOR"
          );

        }

        const result =
        await ToolExecutor.execute(

          step.assignedTool,

          {

            objective:
            step.objective,

            signal:

              plan.runtime
              .controller
              ?.signal || null

          },

          {

            source:
            "planner-engine"

          }

        );

        if(
          !result
        ){

          throw new Error(
            "INVALID TOOL RESULT"
          );

        }

        return {

          ...step,

          result,

          retries:
          attempts - 1,

          state:
          PLAN_STEP_STATES
          .COMPLETED

        };

      }

      return {

        ...step,

        retries:
        attempts - 1,

        state:
        PLAN_STEP_STATES
        .COMPLETED

      };

    }

    catch(error){

      if(

        attempts >=

        PLANNER_ENGINE_CONFIG
        .MAX_RETRIES

      ){

        return {

          ...step,

          error:
          String(error),

          retries:
          attempts,

          state:
          PLAN_STEP_STATES
          .FAILED

        };

      }

      plannerEngineState
      .diagnostics
      .replans++;

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
    .has(
      normalizedId
    )

  ){

    return false;

  }

  const plan =
  plannerEngineState
  .plans
  .get(
    normalizedId
  );

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

    if(

      !plannerEngineState
      .queuedPlans
      .has(
        normalizedId
      )

    ){

      plannerEngineState
      .queuedPlans
      .add(
        normalizedId
      );

      plannerEngineState
      .executionQueue
      .push(
        normalizedId
      );

    }

    plannerEngineState
    .diagnostics
    .queued++;

    return {
      queued:true
    };

  }

  plannerEngineState
  .executionLocks
  .add(
    normalizedId
  );

  plannerEngineState
  .activePlans
  .add(
    normalizedId
  );

  plan.runtime.running =
  true;

  plan.runtime.startedAt =
  Date.now();

  plan.state =
  PLAN_STATES
  .EXECUTING;

  plannerEngineState
  .diagnostics
  .executed++;

  try{

    const completedSteps = [];

    for(
      const step
      of plan.steps
    ){

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
          "PLAN STEP FAILED"
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
    .add(
      normalizedId
    );

    plannerEngineState
    .diagnostics
    .completed++;

    plannerEngineState
    .executionHistory
    .push({

      planId:
      normalizedId,

      success:true,

      completedAt:
      Date.now()

    });

    trimPlannerHistory();

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
    .add(
      normalizedId
    );

    plannerEngineState
    .diagnostics
    .failed++;

    plannerEngineState
    .executionHistory
    .push({

      planId:
      normalizedId,

      success:false,

      error:
      String(error),

      failedAt:
      Date.now()

    });

    trimPlannerHistory();

    await emitPlannerEvent(

      PLAN_EVENTS
      .FAILED,

      {

        planId:
        normalizedId,

        error:
        String(error)

      }

    );

    return false;

  }

  finally{

    plan.runtime.running =
    false;

    plan.runtime.controller =
    null;

    plannerEngineState
    .activePlans
    .delete(
      normalizedId
    );

    plannerEngineState
    .executionLocks
    .delete(
      normalizedId
    );

    drainPlannerQueue()
    .catch(() => {});

  }

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

  await executePlan(
    plan.id
  );

  return getPlan(
    plan.id
  );

}
