// =====================================
// RIGO AI
// AGENT REGISTRY
// AGENT MANAGEMENT LAYER
// =====================================

import {
  AGENT_MANAGER_CONFIG
}
from "./agent-config.js";

import {
  AGENT_STATES,
  AGENT_EVENTS
}
from "./agent-constants.js";

import {
  agentManagerState
}
from "./agent-state.js";

import {
  normalizeAgentId,
  cloneAgentObject,
  freezeAgentObject,
  createAgentId
}
from "./agent-utils.js";

import {
  emitAgentEvent
}
from "./agent-events.js";



// =====================================
// CREATE AGENT
// =====================================

export function createAgentObject(
  config = {}
){

  return {

    id:
    normalizeAgentId(

      config.id ||

      createAgentId()

    ),

    name:
    String(
      config.name ||
      "agent"
    ),

    description:
    String(
      config.description ||
      ""
    ),

    capabilities:

      Array.isArray(
        config.capabilities
      )

      ?

      [
        ...config.capabilities
      ]

      :

      [],

    state:
    AGENT_STATES
    .IDLE,

    tasks:[],

    retries:0,

    createdAt:
    Date.now(),

    updatedAt:
    Date.now(),

    metadata:
    cloneAgentObject(
      config.metadata || {}
    ),

    execute:

      typeof config.execute ===
      "function"

      ?

      config.execute

      :

      null,

    runtime:{

      running:false,

      lastTaskAt:null,

      lastHealthcheckAt:null,

      lastFailureAt:null,

      lastRecoveryAt:null,

      lastError:null,

      recoveryAttempts:0,

      controller:null

    }

  };

}



// =====================================
// REGISTER AGENT
// =====================================

export async function registerAgent(
  config = {}
){

  if(
    agentManagerState
    .shuttingDown
  ){

    return false;

  }

  if(

    agentManagerState
    .agents
    .size >=

    AGENT_MANAGER_CONFIG
    .MAX_AGENTS

  ){

    return false;

  }

  const agent =
  createAgentObject(
    config
  );

  if(

    agentManagerState
    .agents
    .has(agent.id)

  ){

    return false;

  }

  agent.state =
  AGENT_STATES
  .READY;

  agentManagerState
  .agents
  .set(
    agent.id,
    agent
  );

  agentManagerState
  .diagnostics
  .created++;

  agentManagerState
  .lastAgentCreatedAt =
  Date.now();

  await emitAgentEvent(

    AGENT_EVENTS
    .CREATED,

    {
      agentId:
      agent.id
    }

  );

  return freezeAgentObject(
    cloneAgentObject(agent)
  );

}



// =====================================
// GET AGENT
// =====================================

export function getAgent(
  agentId
){

  const agent =
  agentManagerState
  .agents
  .get(
    normalizeAgentId(
      agentId
    )
  );

  if(!agent){

    return null;

  }

  return freezeAgentObject(
    cloneAgentObject(agent)
  );

}



// =====================================
// LIST AGENTS
// =====================================

export function listAgents(){

  return freezeAgentObject(

    [

      ...agentManagerState
      .agents
      .values()

    ]
    .map((agent) => {

      return cloneAgentObject(
        agent
      );

    })

  );

}



// =====================================
// SET STATE
// =====================================

export async function setAgentState(
  agent,
  state
){

  if(!agent){

    return false;

  }

  agent.state =
  state;

  agent.updatedAt =
  Date.now();

  await emitAgentEvent(

    AGENT_EVENTS
    .STATE_CHANGED,

    {

      agentId:
      agent.id,

      state

    }

  );

  return true;

}
