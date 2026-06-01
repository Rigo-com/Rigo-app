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

  agentManagerState
  .startupPromise =

  (async() => {

    if(
      agentManagerState
      .initializing
    ){

      return false;

    }

    agentManagerState
    .initializing =
    true;

    try{

      startAgentHealthchecks();

      agentManagerState
      .initialized =
      true;

      agentManagerState
      .shuttingDown =
      false;

      agentManagerState
      .diagnostics
      .initialized++;

      if(

        typeof AIKernel !==
        "undefined"

        &&

        typeof AIKernel
        .registerSystem ===
        "function"

      ){

        AIKernel.registerSystem(
          "agents",
          true
        );

      }

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

  })();

  return agentManagerState
  .startupPromise;

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

  await resetAgentManager();

  agentManagerState
  .initialized =
  false;

  return true;

}
