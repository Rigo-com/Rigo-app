// =====================================
// RIGO AI
// WORKFLOW EVENTS
// =====================================

import {
  WORKFLOW_ENGINE_CONFIG
}
from "./workflow-config.js";

import {
  freezeWorkflowObject
}
from "./workflow-utils.js";



// =====================================
// EMIT EVENT
// =====================================

export async function emitWorkflowEvent(
  eventName,
  payload = {}
){

  if(
    !WORKFLOW_ENGINE_CONFIG
    .ENABLE_WORKFLOW_EVENTS
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

      freezeWorkflowObject({

        source:
        "workflow-engine",

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
