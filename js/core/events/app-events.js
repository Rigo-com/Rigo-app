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

function safeFreeze(
  value,
  visited = new WeakSet()
){

  if(
    !value ||
    typeof value !==
    "object"
  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  if(

    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Map ||
    value instanceof Set ||
    value instanceof HTMLElement

  ){

    return value;

  }

  visited.add(value);

  Object.freeze(value);

  Object.values(value).forEach((nestedValue) => {

    if(
      nestedValue &&
      typeof nestedValue ===
      "object"
    ){

      safeFreeze(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



function sanitizeAppPayload(
  payload,
  visited = new WeakMap()
){

  if(

    payload === null ||

    typeof payload !==
    "object"

  ){

    return payload;

  }

  if(
    visited.has(payload)
  ){

    return visited.get(payload);

  }

  if(
    payload instanceof Date
  ){

    return new Date(
      payload.getTime()
    );

  }

  if(
    payload instanceof RegExp
  ){

    return new RegExp(
      payload
    );

  }

  if(
    payload instanceof Map
  ){

    return new Map(
      [...payload.entries()]
    );

  }

  if(
    payload instanceof Set
  ){

    return new Set(
      [...payload.values()]
    );

  }

  if(
    typeof HTMLElement !==
    "undefined" &&

    payload instanceof HTMLElement
  ){

    return null;

  }

  const clone =

    Array.isArray(payload)
    ? []
    : {};

  visited.set(
    payload,
    clone
  );

  Object.keys(payload).forEach((key) => {

    const value =
      payload[key];

    if(
      typeof value ===
      "function"
    ){

      return;

    }

    clone[key] =
      sanitizeAppPayload(
        value,
        visited
      );

  });

  return clone;

}



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
      typeof StateAPI ===
      "undefined"
    ){

      return null;

    }

    if(
      typeof StateAPI.get !==
      "function"
    ){

      return null;

    }

    return safeFreeze(
      StateAPI.get()
    );

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

  return safeFreeze({

    source:
    "app",

    phase:
    appSnapshot
    ?.phase ||

    null,

    timestamp:
    Date.now(),

    payload:
    sanitizeAppPayload(
      payload
    )

  });

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

    if(
      typeof logDiagnosticError ===
      "function"
    ){

      await logDiagnosticError(

        "APP EVENT FAILED",

        {

          event:
          eventName,

          error:
          String(error)

        }

      );

    }

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

  return safeFreeze({

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
safeFreeze({

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
