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

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    return false;

  }

  try{

    await emitSystemEvent(

      eventName,

      freezeToolObject({

        source:
        "tool-executor",

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
