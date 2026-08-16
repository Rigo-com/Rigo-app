// =====================================
// RIGO AI
// WORKFLOW STATE
// =====================================

import {
  WORKFLOW_ENGINE_CONFIG
}
from "./workflow-config.js";

export const workflowEngineState =
Object.seal({

  initialized:false,

  initializing:false,

  shuttingDown:false,

  startupPromise:null,

  workflows:
  new Map(),

  activeWorkflows:
  new Set(),

  executionLocks:
  new Set(),

  executions:
  new Map(),

  executionQueue:
  [],

  queuedWorkflowIds:
  new Set(),

  executionHistory:[],

  completedWorkflows:
  new Set(),

  failedWorkflows:
  new Set(),

  diagnostics:
  Object.seal({
    
    created:0,

    started:0,

    completed:0,

    failed:0,

    terminated:0,

    executedSteps:0,

    retries:0,

    queued:0,

    rejected:0

  }),

  lastWorkflowAt:null

});


export function incrementWorkflowDiagnostic(
  key,
  amount = 1
){

  if(!WORKFLOW_ENGINE_CONFIG.ENABLE_DIAGNOSTICS){
    return false;
  }

  if(
    !Object.prototype.hasOwnProperty.call(
      workflowEngineState.diagnostics,
      key
    )
  ){
    return false;
  }

  workflowEngineState.diagnostics[key] +=
  Number(amount) || 0;

  return true;

}
