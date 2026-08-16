// =====================================
// RIGO AI
// AGENT LIFECYCLE
// AGENT RUNTIME LIFECYCLE
// =====================================

import {
  agentManagerState
}
from "./agent-state.js";

import {
  startAgentHealthchecks,
  stopAgentHealthchecks
}
from "./agent-health.js";

import {
  terminateAgent
}
from "./agent-executor.js";

import {
  resetAgentManager
}
from "./agent-reset.js";



// =====================================
// INITIALIZE
// =====================================

export async function
initializeAgentManager(){

  if(
    agentManagerState
    .initialized
  ){

    return true;

  }

  if(
    agentManagerState
    .startupPromise
  ){

    return agentManagerState
    .startupPromise;

  }

  agentManagerState.initializing = true;
  agentManagerState.shuttingDown = false;

  const startup = Promise.resolve()
  .then(async() => {

    try{

      startAgentHealthchecks();

      agentManagerState
      .initialized =
      true;

      agentManagerState
      .diagnostics
      .initialized++;


      return true;

    }

    finally{

      agentManagerState
      .initializing =
      false;

      agentManagerState
      .startupPromise =
      null;

    }

  });

  agentManagerState.startupPromise = startup;

  return startup;

}



// =====================================
// SHUTDOWN
// =====================================

export async function
shutdownAgentManager(){

  agentManagerState
  .shuttingDown =
  true;

  stopAgentHealthchecks();

  for(
    const [agentId]
    of
    agentManagerState
    .agents
  ){

    try{

      await terminateAgent(
        agentId
      );

    }

    catch(error){}

  }

  await Promise.allSettled([
    ...agentManagerState.executionPromises
  ]);

  await resetAgentManager();

  agentManagerState
  .initialized =
  false;

  return true;

}
