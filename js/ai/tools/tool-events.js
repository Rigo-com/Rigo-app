// =====================================
// RIGO AI
// TOOL EVENTS
// =====================================
 
import {
  TOOL_EXECUTOR_CONFIG
}
from "./tool-config.js";

import {
  freezeToolObject
}
from "./tool-utils.js";

import ServiceManager
from "../../services/service-manager.js";



// =====================================
// EMIT TOOL EVENT
// =====================================

export async function emitToolEvent(
  eventName,
  payload = {}
){

  if(

    !TOOL_EXECUTOR_CONFIG
    .ENABLE_TOOL_EVENTS

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

      freezeToolObject({

        source:
        "tool-executor",

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
