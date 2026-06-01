// =====================================
// RIGO AI
// PLANNER CONSTANTS
// =====================================



// =====================================
// PLAN STATES
// =====================================

export const PLAN_STATES =
Object.freeze({

  CREATED:"created",

  ANALYZING:"analyzing",

  PLANNED:"planned",

  EXECUTING:"executing",

  COMPLETED:"completed",

  FAILED:"failed",

  TERMINATED:"terminated"

});



// =====================================
// PLAN STEP STATES
// =====================================

export const PLAN_STEP_STATES =
Object.freeze({

  PENDING:"pending",

  READY:"ready",

  RUNNING:"running",

  COMPLETED:"completed",

  FAILED:"failed",

  SKIPPED:"skipped"

});



// =====================================
// PLAN EVENTS
// =====================================

export const PLAN_EVENTS =
Object.freeze({

  CREATED:
  "planner.plan.created",

  ANALYZED:
  "planner.plan.analyzed",

  GENERATED:
  "planner.plan.generated",

  EXECUTION_STARTED:
  "planner.execution.started",

  STEP_COMPLETED:
  "planner.step.completed",

  COMPLETED:
  "planner.completed",

  FAILED:
  "planner.failed",

  TERMINATED:
  "planner.terminated"

});
