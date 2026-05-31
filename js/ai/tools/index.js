// =====================================
// RIGO AI
// TOOL EXECUTOR
// PUBLIC EXPORTS
// =====================================

import {

  initializeToolExecutor,
  shutdownToolExecutor,
  resetToolRuntime

}
from "./tool-lifecycle.js";

import {

  registerTool,
  removeTool,
  getTool,
  enableTool,
  disableTool,
  listTools

}
from "./tool-registry.js";

import {

  searchTools

}
from "./tool-index.js";

import {

  executeTool

}
from "./tool-executor.js";

import {

  cancelExecution,
  queueExecution,
  processExecutionQueue

}
from "./tool-queue.js";

import {

  getToolDiagnostics,
  createToolExecutorSnapshot,
  getToolExecutorHealth

}
from "./tool-diagnostics.js";



// =====================================
// TOOL EXECUTOR API
// =====================================

export const ToolExecutor =
Object.freeze({

  initialize:
  initializeToolExecutor,

  shutdown:
  shutdownToolExecutor,

  register:
  registerTool,

  remove:
  removeTool,

  get:
  getTool,

  search:
  searchTools,

  enable:
  enableTool,

  disable:
  disableTool,

  execute:
  executeTool,

  cancel:
  cancelExecution,

  queue:
  queueExecution,

  processQueue:
  processExecutionQueue,

  list:
  listTools,

  diagnostics:
  getToolDiagnostics,

  snapshot:
  createToolExecutorSnapshot,

  health:
  getToolExecutorHealth,

  reset:
  resetToolRuntime

});



if(
  typeof window !==
  "undefined"
){

  window.ToolExecutor =
  ToolExecutor;

}

if(
  typeof globalThis !==
  "undefined"
){

  globalThis.ToolExecutor =
  ToolExecutor;

}



export default
ToolExecutor;
