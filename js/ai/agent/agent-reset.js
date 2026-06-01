// =====================================
// RIGO AI
// AGENT RESET
// =====================================

import {
  agentManagerState
}
from "./agent-state.js";



// =====================================
// RESET AGENT MANAGER
// =====================================

export async function
resetAgentManager(){

  agentManagerState
  .agents
  .clear();

  agentManagerState
  .activeAgents
  .clear();

  agentManagerState
  .failedAgents
  .clear();

  agentManagerState
  .executionLocks
  .clear();

  agentManagerState
  .taskQueue =
  [];

  return true;

}
