// =====================================
// RIGO AI
// WORKFLOW ENGINE
// PUBLIC EXPORTS
// =====================================

import {
  initializeWorkflowEngine,
  shutdownWorkflowEngine,
  resetWorkflowEngine
}
from "./workflow-lifecycle.js";

import {
  registerWorkflow,
  getWorkflow,
  listWorkflows,
  removeWorkflow
}
from "./workflow-registry.js";

import {
  executeWorkflow,
  terminateWorkflow
}
from "./workflow-executor.js";

import {
  processWorkflowRequest
}
from "./workflow-process.js";

import {
  getWorkflowDiagnostics,
  getWorkflowHealthReport,
  createWorkflowSnapshot
}
from "./workflow-diagnostics.js";



// =====================================
// API
// =====================================

export const WorkflowEngine =
Object.freeze({

  initialize:
  initializeWorkflowEngine,

  shutdown:
  shutdownWorkflowEngine,

  register:
  registerWorkflow,

  execute:
  executeWorkflow,

  terminate:
  terminateWorkflow,

  process:
  processWorkflowRequest,

  get:
  getWorkflow,

  list:
  listWorkflows,

  remove:
  removeWorkflow,

  diagnostics:
  getWorkflowDiagnostics,

  health:
  getWorkflowHealthReport,

  snapshot:
  createWorkflowSnapshot,

  reset:
  resetWorkflowEngine

});




export default
WorkflowEngine;
