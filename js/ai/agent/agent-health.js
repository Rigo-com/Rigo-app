// =====================================
// RIGO AI
// AGENT HEALTH
// HEALTHCHECK SYSTEM
// =====================================

import {
  AGENT_MANAGER_CONFIG
}
from "./agent-config.js";

import {
  AGENT_STATES
}
from "./agent-constants.js";

import {
  agentManagerState
}
from "./agent-state.js";

import {
  recoverAgent
}
from "./agent-executor.js";



// =====================================
// PERFORM HEALTHCHECKS
// =====================================

export async function
performAgentHealthchecks(){

  for(
    const [agentId, agent]
    of
    agentManagerState
    .agents
  ){

    agent.runtime
    .lastHealthcheckAt =
    Date.now();

    if(

      agent.state ===
      AGENT_STATES
      .FAILED

      &&

      AGENT_MANAGER_CONFIG
      .ENABLE_AGENT_RECOVERY

    ){

      recoverAgent(
        agentId
      )
      .catch(() => {});

    }

  }

  return true;

}



// =====================================
// START HEALTHCHECKS
// =====================================

export function
startAgentHealthchecks(){

  if(
    agentManagerState
    .healthcheckTimer
  ){

    return true;

  }

  agentManagerState
  .healthcheckTimer =
  setInterval(() => {

    performAgentHealthchecks()
    .catch(() => {});

  },

  AGENT_MANAGER_CONFIG
  .AGENT_HEALTHCHECK_INTERVAL);

  return true;

}



// =====================================
// STOP HEALTHCHECKS
// =====================================

export function
stopAgentHealthchecks(){

  if(
    !agentManagerState
    .healthcheckTimer
  ){

    return true;

  }

  clearInterval(

    agentManagerState
    .healthcheckTimer

  );

  agentManagerState
  .healthcheckTimer =
  null;

  return true;

}
