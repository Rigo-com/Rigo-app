// =====================================
// RIGO AI
// PLANNER EVENTS
// =====================================

import {
  freezePlannerObject
}
from "./planner-utils.js";



// =====================================
// EMIT EVENT
// =====================================

export async function emitPlannerEvent(
  eventName,
  payload = {}
){

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    return false;

  }

  try{

    await emitSystemEvent(

      eventName,

      freezePlannerObject({

        source:
        "planner-engine",

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
