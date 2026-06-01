// =====================================
// RIGO AI
// AGENT MANAGER
// PUBLIC EXPORTS
// =====================================

import {

  initializeAgentManager,
  shutdownAgentManager

}
from "./agent-lifecycle.js";

import {

  registerAgent,
  getAgent,
  listAgents

}
from "./agent-registry.js";

import {

  executeAgentTask,
  processAgentRequest,
  recoverAgent,
  pauseAgent,
  resumeAgent,
  terminateAgent

}
from "./agent-executor.js";

import {

  getAgentDiagnostics,
  createAgentSnapshot

}
from "./agent-diagnostics.js";

import {

  resetAgentManager

}
from "./agent-reset.js";



// =====================================
// AGENT MANAGER API
// =====================================

export const AgentManager =
Object.freeze({

  initialize:
  initializeAgentManager,

  shutdown:
  shutdownAgentManager,

  register:
  registerAgent,

  process:
  processAgentRequest,

  execute:
  executeAgentTask,

  recover:
  recoverAgent,

  pause:
  pauseAgent,

  resume:
  resumeAgent,

  terminate:
  terminateAgent,

  diagnostics:
  getAgentDiagnostics,

  snapshot:
  createAgentSnapshot,

  reset:
  resetAgentManager,

  get:
  getAgent,

  list:
  listAgents

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.AgentManager =
  AgentManager;

}



if(
  typeof globalThis !==
  "undefined"
){

  globalThis.AgentManager =
  AgentManager;

}



export default
AgentManager;
