// =====================================
// RIGO AI
// APP EVENTS
// SAFE APPLICATION EVENT FACADE
// =====================================



// =====================================
// APP EVENT TYPES
// =====================================

const APP_EVENTS =
Object.freeze({

  INITIALIZED:
  "app.initialized",

  BOOT_STARTED:
  "app.boot.started",

  BOOT_COMPLETED:
  "app.boot.completed",

  BOOT_FAILED:
  "app.boot.failed",

  READY:
  "app.ready",

  SHUTDOWN:
  "app.shutdown"

});



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

  try{

    if(
      typeof appState ===
      "undefined"
    ){

      return null;

    }

    return {

      phase:
      appState?.phase ||

      null

    };

  }

  catch(error){

    return null;

  }

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

  if(

    typeof emitSystemEvent !==
    "function"

  ){

    appEventsState.failed++;

    return false;

  }

  try{

    const result =
      await emitSystemEvent(

        eventName,

        createAppEventPayload(
          payload
        )

      );

    if(result){

      appEventsState.emitted++;

      appEventsState.lastEventAt =
        Date.now();

    }

    return Boolean(result);

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

  if(

    typeof SystemEvents ===
    "undefined"

  ){

    return null;

  }

  if(
    typeof SystemEvents.on !==
    "function"
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

  if(

    typeof SystemEvents ===
    "undefined"

  ){

    return null;

  }

  if(
    typeof SystemEvents.once !==
    "function"
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

  if(

    typeof SystemEvents ===
    "undefined"

  ){

    return false;

  }

  if(
    typeof SystemEvents.off !==
    "function"
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
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "APP_EVENTS",

    {

      value:
      APP_EVENTS,

      writable:
      false,

      configurable:
      false

    }

  );

  Object.defineProperty(

    window,

    "AppEvents",

    {

      value:
      AppEvents,

      writable:
      false,

      configurable:
      false

    }

  );

  Object.defineProperty(

    window,

    "emitAppEvent",

    {

      value:
      emitAppEvent,

      writable:
      false,

      configurable:
      false

    }

  );

}
