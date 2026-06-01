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

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    return false;

  }

  try{

    await emitSystemEvent(

      eventName,

      freezeAgentObject({

        source:
        "agent-manager",

        timestamp:
        Date.now(),

        ...payload

      })

    );

    return true;

  }

  catch(error){

    return false;

  }

}
