// =====================================
// RIGO AI
// PLANNER ENGINE
// PUBLIC API
// =====================================

import {
  initializePlannerEngine,
  shutdownPlannerEngine,
  resetPlannerEngine
}
from "./planner-lifecycle.js";

import {
  generateExecutionPlan
}
from "./planner-plan.js";

import {
  executePlan,
  terminatePlan,
  processPlannerRequest
}
from "./planner-executor.js";

import {
  getPlan,
  listPlans,
  removePlan
}
from "./planner-registry.js";

import {
  getPlannerDiagnostics,
  createPlannerSnapshot
}
from "./planner-diagnostics.js";



// =====================================
// PLANNER ENGINE API
// =====================================

export const PlannerEngine =
Object.freeze({

  initialize:
  initializePlannerEngine,

  shutdown:
  shutdownPlannerEngine,

  reset:
  resetPlannerEngine,

  generate:
  generateExecutionPlan,

  execute:
  executePlan,

  terminate:
  terminatePlan,

  process:
  processPlannerRequest,

  get:
  getPlan,

  list:
  listPlans,

  remove:
  removePlan,

  diagnostics:
  getPlannerDiagnostics,

  snapshot:
  createPlannerSnapshot

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.PlannerEngine =
  PlannerEngine;

}

if(
  typeof globalThis !==
  "undefined"
){

  globalThis.PlannerEngine =
  PlannerEngine;

}



// =====================================
// EXPORTS
// =====================================

export default PlannerEngine;
