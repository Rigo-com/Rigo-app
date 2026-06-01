// =====================================
// RIGO AI
// MAIN AI ENTRY POINT
// =====================================



// =====================================
// IMPORTS
// =====================================

import AgentManager
from "./agent/index.js";

import AIKernel
from "./ai-kernel/index.js";

import ContextManager
from "./context/index.js";

import PlannerEngine
from "./planner-engine/index.js";

import WorkflowEngine
from "./workflow-engine/index.js";

import ToolExecutor
from "./tools/index.js";



// =====================================
// AI MODULES
// =====================================

export const AI =
Object.freeze({

  AgentManager,

  AIKernel,

  ContextManager,

  PlannerEngine,

  WorkflowEngine,

  ToolExecutor

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.AI =
  AI;

}

if(
  typeof globalThis !==
  "undefined"
){

  globalThis.AI =
  AI;

}



// =====================================
// EXPORTS
// =====================================

export default
AI;
