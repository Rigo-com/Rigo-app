// =====================================
// RIGO AI
// AGENT DIAGNOSTICS
// AGENT MONITORING
// =====================================

import {
  agentManagerState
}
from "./agent-state.js";

import {
  cloneAgentObject,
  freezeAgentObject
}
from "./agent-utils.js";



// =====================================
// SNAPSHOT
// =====================================

export function
createAgentSnapshot(){

  return freezeAgentObject({

    initialized:
    agentManagerState
    .initialized,

    totalAgents:

      agentManagerState
      .agents
      .size,

    activeAgents:

      agentManagerState
      .activeAgents
      .size,

    failedAgents:

      agentManagerState
      .failedAgents
      .size,

    queuedTasks:

      agentManagerState
      .taskQueue
      .length,

    executions:
      agentManagerState.executionPromises.size,

    initializing:
      agentManagerState.initializing,

    shuttingDown:
      agentManagerState.shuttingDown,

    timestamp:
    Date.now()

  });

}



// =====================================
// DIAGNOSTICS
// =====================================

export function
getAgentDiagnostics(){

  return freezeAgentObject({

    initialized:
    agentManagerState
    .initialized,

    agents:

      agentManagerState
      .agents
      .size,

    activeAgents:

      agentManagerState
      .activeAgents
      .size,

    failedAgents:

      agentManagerState
      .failedAgents
      .size,

    queuedTasks:

      agentManagerState
      .taskQueue
      .length,

    executions:
      agentManagerState.executionPromises.size,

    initializing:
      agentManagerState.initializing,

    shuttingDown:
      agentManagerState.shuttingDown,

    diagnostics:
    cloneAgentObject(

      agentManagerState
      .diagnostics

    ),

    timestamp:
    Date.now()

  });

}
