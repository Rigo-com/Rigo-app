// =====================================
// RIGO AI
// MAIN AI ENTRY POINT
// =====================================

import AIKernel
from "./ai-kernel/index.js";

import ContextManager
from "./context/index.js";

import ToolExecutor
from "./tools/index.js";

import AgentManager
from "./agent/index.js";

import PlannerEngine
from "./planner-engine/index.js";

import WorkflowEngine
from "./workflow-engine/index.js";

import ServiceManager
from "../services/service-manager.js";



// =====================================
// SERVICE REGISTRATION
// =====================================

async function registerAIServices(){

  const services = [
    ["contexts",ContextManager],
    ["tools",ToolExecutor],
    ["agents",AgentManager],
    ["planner",PlannerEngine],
    ["workflows",WorkflowEngine]
  ];

  for(const [name,service] of services){

    if(ServiceManager.has(name)){
      continue;
    }

    await ServiceManager.register(
      name,
      async () => service
    );

  }

  return true;

}



// =====================================
// LIFECYCLE
// =====================================

async function initialize(){

  await registerAIServices();

  // The kernel owns synchronization/initialization of all
  // registered AI subsystems through the central container.
  await AIKernel.initialize();

  return true;

}



async function shutdown(){

  await WorkflowEngine.shutdown();
  await PlannerEngine.shutdown();
  await AgentManager.shutdown();
  await ToolExecutor.shutdown();
  await ContextManager.shutdown();
  await AIKernel.shutdown();

  return true;

}



async function reset(){

  await WorkflowEngine.reset();
  await PlannerEngine.reset();
  await AgentManager.reset();
  await ToolExecutor.reset();
  await ContextManager.reset();

  if(typeof AIKernel.destroy === "function"){
    await AIKernel.destroy();
  }

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function diagnostics(){

  return Object.freeze({
    kernel:AIKernel.diagnostics(),
    context:ContextManager.diagnostics(),
    tools:ToolExecutor.diagnostics(),
    agents:AgentManager.diagnostics(),
    planner:PlannerEngine.diagnostics(),
    workflow:WorkflowEngine.diagnostics(),
    timestamp:Date.now()
  });

}



function snapshot(){

  return Object.freeze({
    kernel:AIKernel.state(),
    context:ContextManager.snapshot(),
    tools:ToolExecutor.snapshot(),
    agents:AgentManager.snapshot(),
    planner:PlannerEngine.snapshot(),
    workflow:WorkflowEngine.snapshot(),
    timestamp:Date.now()
  });

}



// =====================================
// AI API
// =====================================

export const AI =
Object.freeze({
  initialize,
  shutdown,
  reset,
  diagnostics,
  snapshot,
  registerServices:registerAIServices,
  AIKernel,
  ContextManager,
  ToolExecutor,
  AgentManager,
  PlannerEngine,
  WorkflowEngine
});



if(typeof window !== "undefined"){
  window.AI = AI;
}

if(typeof globalThis !== "undefined"){
  globalThis.AI = AI;
}

export default AI;
