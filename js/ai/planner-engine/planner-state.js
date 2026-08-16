// =====================================
// RIGO AI
// PLANNER STATE
// =====================================

import {
  PLANNER_ENGINE_CONFIG
}
from "./planner-config.js";

export const plannerEngineState =
Object.seal({

  initialized:false,

  initializing:false,

  shuttingDown:false,

  startupPromise:null,

  plans:
  new Map(),

  activePlans:
  new Set(),

  queuedPlans:
  new Set(),

  executionLocks:
  new Set(),

  executionQueue:
  [],

  executionHistory:[],

  completedPlans:
  new Set(),

  failedPlans:
  new Set(),

  diagnostics:
  Object.seal({

    created:0,

    analyzed:0,

    generated:0,

    executed:0,

    completed:0,

    failed:0,

    replans:0,

    rejected:0,

    queued:0,

    terminated:0

  }),

  lastPlanAt:null

});


export function incrementPlannerDiagnostic(
  key,
  amount = 1
){

  if(!PLANNER_ENGINE_CONFIG.ENABLE_DIAGNOSTICS){
    return false;
  }

  if(
    !Object.prototype.hasOwnProperty.call(
      plannerEngineState.diagnostics,
      key
    )
  ){
    return false;
  }

  plannerEngineState.diagnostics[key] +=
  Number(amount) || 0;

  return true;

}
