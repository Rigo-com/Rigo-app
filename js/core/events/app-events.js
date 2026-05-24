// =====================================
// RIGO AI
// APP EVENTS
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
// VALIDATION
// =====================================

function validateAppEventName(
  eventName
){

  return (

    typeof eventName ===
    "string" &&

    eventName
    .trim()
    .length > 0

  );

}



// =====================================
// APP SNAPSHOT
// =====================================

function getAppEventSnapshot(){

  try{

    return (

      typeof AppState !==
      "undefined"

      ?

      AppState
      .get?.()

      :

      null

    );

  }

  catch(error){

    return null;

  }

}



// =====================================
// CREATE PAYLOAD
// =====================================

function createAppEventPayload(
  payload = {}
){

  const appSnapshot =
  getAppEventSnapshot();

  return Object.freeze({

    source:
    "app",

    phase:
    appSnapshot
    ?.phase ||

    null,

    timestamp:
    Date.now(),

    ...payload

  });

}



// =====================================
// EMIT APP EVENT
// =====================================

async function emitAppEvent(
  eventName,
  payload = {}
){

  const validEvent =
  validateAppEventName(
    eventName
  );

  if(!validEvent){

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

      createAppEventPayload(
        payload
      )

    );

    return true;

  }

  catch(error){

    console.error(
      "APP EVENT ERROR:",
      error
    );

    return false;

  }

}



// =====================================
// PUBLIC API
// =====================================

const AppEvents =
Object.freeze({

  EVENTS:
  APP_EVENTS,

  emit:
  emitAppEvent

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.APP_EVENTS =
  APP_EVENTS;

  window.AppEvents =
  AppEvents;

  window.emitAppEvent =
  emitAppEvent;

}
