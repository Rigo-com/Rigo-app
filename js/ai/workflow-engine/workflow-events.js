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

import ServiceManager
from "../../services/service-manager.js";



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

  try{

    const events =
    await ServiceManager.resolve(
      "events"
    );

    if(!events?.emit){
      return false;
    }

    const emitted =
    await events.emit(

      eventName,

      freezeWorkflowObject({

        source:
        "workflow-engine",

        timestamp:
        Date.now(),

        ...payload

      })

    );

    return Boolean(emitted);

  }

  catch(error){

    return false;

  }

}
