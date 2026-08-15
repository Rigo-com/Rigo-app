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
  .taskQueue
  .forEach((queuedTask) => {

    queuedTask.reject?.(
      new Error("AGENT MANAGER RESET")
    );

  });

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

  agentManagerState
  .queueProcessing =
  false;

  return true;

}
