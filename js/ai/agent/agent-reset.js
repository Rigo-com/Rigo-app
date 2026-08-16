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

  for(const agent of agentManagerState.agents.values()){
    agent.runtime.controller?.abort();
  }

  agentManagerState
  .taskQueue
  .forEach((queuedTask) => {

    queuedTask.reject?.(
      new Error("AGENT MANAGER RESET")
    );

  });

  await Promise.allSettled([
    ...agentManagerState.executionPromises
  ]);

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
  .executionPromises
  .clear();

  agentManagerState
  .taskQueue =
  [];

  agentManagerState
  .queueProcessing =
  false;

  Object.keys(
    agentManagerState
    .diagnostics
  )
  .forEach((key) => {
    agentManagerState
    .diagnostics[key] = 0;
  });

  agentManagerState
  .lastAgentCreatedAt =
  null;

  return true;

}
