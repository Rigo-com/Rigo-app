// =====================================
// RIGO AI
// AGENT EVENTS
// =====================================

import {
  AGENT_MANAGER_CONFIG
}
from "./agent-config.js";

import {
  freezeAgentObject
}
from "./agent-utils.js";

import {
  agentManagerState
}
from "./agent-state.js";

import ServiceManager
from "../../services/service-manager.js";



// =====================================
// EMIT AGENT EVENT
// =====================================

export async function emitAgentEvent(
  eventName,
  payload = {}
){

  if(
    !AGENT_MANAGER_CONFIG
    .ENABLE_AGENT_EVENTS
  ){

    return false;

  }

  try{

    const events =
    await ServiceManager.resolve(
      "events"
    );

    if(
      !events ||
      typeof events.emit !==
      "function"
    ){

      agentManagerState
      .diagnostics
      .eventsFailed++;

      return false;

    }

    const emitted =
    await events.emit(

      eventName,

      freezeAgentObject({

        source:
        "agent-manager",

        timestamp:
        Date.now(),

        ...payload

      })

    );

    if(emitted){
      agentManagerState
      .diagnostics
      .eventsEmitted++;
    }
    else{
      agentManagerState
      .diagnostics
      .eventsFailed++;
    }

    return Boolean(emitted);

  }

  catch(error){

    agentManagerState
    .diagnostics
    .eventsFailed++;

    return false;

  }

}
