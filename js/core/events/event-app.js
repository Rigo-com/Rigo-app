// =====================================
// RIGO AI
// APP EVENTS
// SAFE APPLICATION EVENT FACADE
// =====================================



// =====================================
// IMPORTS
// =====================================

import {
  APP_EVENTS
}
from "./event-types.js";

import SystemEvents
from "./event-manager.js";



// =====================================
// INTERNAL STATE
// =====================================

const appEventsState =
Object.seal({

  emitted:
  0,

  failed:
  0,

  lastEventAt:
  null

});



// =====================================
// HELPERS
// =====================================

function validateAppEventName(
  eventName
){

  if(
    typeof eventName !==
    "string"
  ){

    return false;

  }

  const normalizedEvent =
    eventName
    .trim()
    .toLowerCase();

  if(
    !normalizedEvent
  ){

    return false;

  }

  return normalizedEvent
    .startsWith("app.");

}



function getSafeAppSnapshot(){

  return {

    phase:
    null

  };

}



// =====================================
// PAYLOAD CREATION
// =====================================

function createAppEventPayload(
  payload = {}
){

  const appSnapshot =
  getSafeAppSnapshot();

  return {

    source:
    "app",

    phase:
    appSnapshot
    ?.phase ||

    null,

    timestamp:
    Date.now(),

    payload

  };

}



// =====================================
// EMIT
// =====================================

async function emitAppEvent(
  eventName,
  payload = {}
){

  const validEvent =
  validateAppEventName(
    eventName
  );

  if(
    !validEvent
  ){

    appEventsState.failed++;

    return false;

  }

  try{

    const result =
    await SystemEvents.emit(

      eventName,

      createAppEventPayload(
        payload
      )

    );

    if(
      result
    ){

      appEventsState.emitted++;

      appEventsState.lastEventAt =
      Date.now();

    }

    return Boolean(
      result
    );

  }

  catch(error){

    appEventsState.failed++;

    console.warn(
      "[AppEvents] Event emit failed",
      {

        event:
        eventName,

        error:
        String(error)

      }

    );

    return false;

  }

}



// =====================================
// SUBSCRIPTIONS
// =====================================

function onAppEvent(
  eventName,
  listener
){

  if(
    !validateAppEventName(
      eventName
    )
  ){

    return null;

  }

  return SystemEvents.on(
    eventName,
    listener
  );

}



function onceAppEvent(
  eventName,
  listener
){

  if(
    !validateAppEventName(
      eventName
    )
  ){

    return null;

  }

  return SystemEvents.once(
    eventName,
    listener
  );

}



function offAppEvent(
  eventName,
  listener
){

  if(
    !validateAppEventName(
      eventName
    )
  ){

    return false;

  }

  return SystemEvents.off(
    eventName,
    listener
  );

}



// =====================================
// DIAGNOSTICS
// =====================================

function getAppEventDiagnostics(){

  return Object.freeze({

    emitted:
    appEventsState
    .emitted,

    failed:
    appEventsState
    .failed,

    lastEventAt:
    appEventsState
    .lastEventAt,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const AppEvents =
Object.freeze({

  EVENTS:
  APP_EVENTS,

  emit:
  emitAppEvent,

  on:
  onAppEvent,

  once:
  onceAppEvent,

  off:
  offAppEvent,

  diagnostics:
  getAppEventDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export {

  emitAppEvent,

  onAppEvent,

  onceAppEvent,

  offAppEvent,

  getAppEventDiagnostics,

  AppEvents

};

export default
AppEvents;
