// =====================================
// RIGO AI
// PLANNER EVENTS
// =====================================

import {
  freezePlannerObject
}
from "./planner-utils.js";

import ServiceManager
from "../../services/service-manager.js";



// =====================================
// EMIT EVENT
// =====================================

export async function emitPlannerEvent(
  eventName,
  payload = {}
){

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

      freezePlannerObject({

        source:
        "planner-engine",

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
