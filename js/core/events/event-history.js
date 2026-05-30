// =====================================
// RIGO AI
// EVENT HISTORY
// =====================================



// =====================================
// IMPORTS
// =====================================

import {
  SYSTEM_EVENTS_CONFIG
}
from "./event-types.js";

import {
  systemEventsState
}
from "./event-state.js";

import {
  safeFreeze,
  cloneSystemPayload,
  normalizeSystemEvent
}
from "./event-utils.js";



// =====================================
// STORE HISTORY
// =====================================

function storeSystemEventHistory(
  event
){

  if(

    !SYSTEM_EVENTS_CONFIG
    .ENABLE_HISTORY

  ){

    return false;

  }

  systemEventsState
  .eventHistory
  .set(

    event.id,

    safeFreeze({

      id:
      event.id,

      type:
      event.type,

      payload:
      cloneSystemPayload(
        event.payload
      ),

      timestamp:
      event.timestamp,

      priority:
      event.priority

    })

  );

  if(

    systemEventsState
    .eventHistory
    .size >

    SYSTEM_EVENTS_CONFIG
    .MAX_EVENT_HISTORY

  ){

    const oldestKey =

      systemEventsState
      .eventHistory
      .keys()
      .next()
      .value;

    systemEventsState
    .eventHistory
    .delete(
      oldestKey
    );

  }

  return true;

}



// =====================================
// CLEAR HISTORY
// =====================================

function clearSystemEventHistory(){

  systemEventsState
  .eventHistory
  .clear();

  return true;

}



// =====================================
// GET HISTORY
// =====================================

function getSystemEventHistory(
  eventType = null
){

  return [

    ...systemEventsState
    .eventHistory
    .values()

  ]

  .filter((event) => {

    if(
      !eventType
    ){

      return true;

    }

    return (

      event.type ===

      normalizeSystemEvent(
        eventType
      )

    );

  });

}



// =====================================
// EXPORTS
// =====================================

export {

  storeSystemEventHistory,

  clearSystemEventHistory,

  getSystemEventHistory

};
