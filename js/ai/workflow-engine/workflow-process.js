// =====================================
// RIGO AI
// WORKFLOW PROCESS
// =====================================

import {
  registerWorkflow
}
from "./workflow-registry.js";

import {
  executeWorkflow
}
from "./workflow-executor.js";



// =====================================
// PROCESS REQUEST
// =====================================

export async function processWorkflowRequest(
  payload = {}
){

  const workflow =
  await registerWorkflow(
    payload
  );

  if(!workflow){

    return false;

  }

  return executeWorkflow(
    workflow.id,
    payload.context || {}
  );

}
