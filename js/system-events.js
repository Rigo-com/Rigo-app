// =====================================
// RIGO AI
// SYSTEM EVENTS
// ENTERPRISE INFINITY GOD FINAL
// =====================================



// =====================================
// SYSTEM EVENT CONFIG
// =====================================

const SYSTEM_EVENTS_CONFIG =
Object.freeze({

  ENABLE_HISTORY:true,

  ENABLE_WILDCARDS:true,

  ENABLE_PRIORITIES:true,

  ENABLE_REPLAY:true,

  ENABLE_MIDDLEWARE:true,

  ENABLE_THROTTLING:true,

  ENABLE_DIAGNOSTICS:true,

  MAX_EVENT_HISTORY:
  5000,

  MAX_LISTENERS:
  500,

  MAX_EVENT_QUEUE:
  1000,

  EVENT_TIMEOUT:
  15000,

  MAX_RETRIES:3

});



// =====================================
// EVENT PRIORITIES
// =====================================

const SYSTEM_EVENT_PRIORITIES =
Object.freeze({

  LOW:1,

  NORMAL:5,

  HIGH:10,

  CRITICAL:20

});



// =====================================
// SYSTEM EVENT TYPES
// =====================================

const SYSTEM_EVENT_TYPES =
Object.freeze({



  // ===================================
  // APP
  // ===================================

  APP_INITIALIZED:
  "app.initialized",

  APP_READY:
  "app.ready",

  APP_SHUTDOWN:
  "app.shutdown",

  APP_ERROR:
  "app.error",



  // ===================================
  // AUTH
  // ===================================

  AUTH_LOGIN:
  "auth.login",

  AUTH_LOGOUT:
  "auth.logout",

  AUTH_EXPIRED:
  "auth.expired",



  // ===================================
  // MEMORY
  // ===================================

  MEMORY_CREATED:
  "memory.created",

  MEMORY_UPDATED:
  "memory.updated",

  MEMORY_DELETED:
  "memory.deleted",

  MEMORY_SYNCED:
  "memory.synced",



  // ===================================
  // AI
  // ===================================

  AI_REQUEST:
  "ai.request",

  AI_RESPONSE:
  "ai.response",

  AI_ERROR:
  "ai.error",



  // ===================================
  // UI
  // ===================================

  UI_UPDATED:
  "ui.updated",

  UI_THEME_CHANGED:
  "ui.theme.changed",

  UI_LANGUAGE_CHANGED:
  "ui.language.changed",



  // ===================================
  // NETWORK
  // ===================================

  NETWORK_ONLINE:
  "network.online",

  NETWORK_OFFLINE:
  "network.offline"

});



// =====================================
// SYSTEM EVENT STATE
// =====================================

const systemEventsState =
Object.seal({

  initialized:false,

  totalEvents:0,

  failedEvents:0,

  activeEvents:0,

  queuedEvents:0,

  listeners:
  new Map(),

  onceListeners:
  new Map(),

  wildcardListeners:
  new Set(),

  middleware:
  new Set(),

  eventHistory:[],

  throttledEvents:
  new Map(),

  eventQueue:[],

  diagnostics:{

    emitted:0,

    completed:0,

    failed:0,

    retries:0

  },

  lastEventAt:null

});



// =====================================
// HELPERS
// =====================================

function normalizeSystemEvent(
  eventName
){

  return String(
    eventName || ""
  )
  .trim()
  .toLowerCase();

}



function createSystemEventId(){

  return (

    "event_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



function isValidSystemListener(
  listener
){

  return (
    typeof listener ===
    "function"
  );

}



// =====================================
// EVENT OBJECT
// =====================================

function createSystemEvent(
  type,
  payload = {},
  options = {}
){

  return Object.freeze({

    id:
    createSystemEventId(),

    type:
    normalizeSystemEvent(
      type
    ),

    payload:
    payload || {},

    priority:

      Number(
        options.priority
      )

      ||

      SYSTEM_EVENT_PRIORITIES
      .NORMAL,

    timestamp:
    Date.now(),

    retries:0,

    cancelled:false

  });

}



// =====================================
// LISTENER REGISTRATION
// =====================================

function onSystemEvent(
  eventName,
  listener
){

  const normalizedEvent =
  normalizeSystemEvent(
    eventName
  );

  if(
    !normalizedEvent
  ){

    return false;
  }

  if(
    !isValidSystemListener(
      listener
    )
  ){

    return false;
  }

  if(

    !systemEventsState
    .listeners
    .has(
      normalizedEvent
    )

  ){

    systemEventsState
    .listeners
    .set(
      normalizedEvent,
      new Set()
    );

  }

  const listeners =

    systemEventsState
    .listeners
    .get(
      normalizedEvent
    );

  if(

    listeners.size >=

    SYSTEM_EVENTS_CONFIG
    .MAX_LISTENERS

  ){

    return false;
  }

  listeners.add(
    listener
  );

  return true;

}



// =====================================
// ONCE LISTENER
// =====================================

function onceSystemEvent(
  eventName,
  listener
){

  const normalizedEvent =
  normalizeSystemEvent(
    eventName
  );

  if(
    !normalizedEvent
  ){

    return false;
  }

  if(
    !isValidSystemListener(
      listener
    )
  ){

    return false;
  }

  if(

    !systemEventsState
    .onceListeners
    .has(
      normalizedEvent
    )

  ){

    systemEventsState
    .onceListeners
    .set(
      normalizedEvent,
      new Set()
    );

  }

  systemEventsState
  .onceListeners
  .get(
    normalizedEvent
  )
  .add(
    listener
  );

  return true;

}



// =====================================
// WILDCARD LISTENERS
// =====================================

function onAnySystemEvent(
  listener
){

  if(
    !isValidSystemListener(
      listener
    )
  ){

    return false;
  }

  systemEventsState
  .wildcardListeners
  .add(
    listener
  );

  return true;

}



// =====================================
// REMOVE LISTENER
// =====================================

function offSystemEvent(
  eventName,
  listener
){

  const normalizedEvent =
  normalizeSystemEvent(
    eventName
  );

  const listeners =

    systemEventsState
    .listeners
    .get(
      normalizedEvent
    );

  if(!listeners){

    return false;
  }

  return listeners.delete(
    listener
  );

}



// =====================================
// MIDDLEWARE
// =====================================

function useSystemEventMiddleware(
  middleware
){

  if(
    typeof middleware !==
    "function"
  ){

    return false;
  }

  systemEventsState
  .middleware
  .add(
    middleware
  );

  return true;

}



// =====================================
// MIDDLEWARE EXECUTION
// =====================================

async function executeEventMiddleware(
  event
){

  for(

    const middleware

    of

    systemEventsState
    .middleware

  ){

    try{

      const result =
      await middleware(
        event
      );

      if(
        result === false
      ){

        event.cancelled =
        true;

        return false;
      }

    }

    catch(error){

      systemEventsState
      .failedEvents++;

    }

  }

  return true;

}



// =====================================
// THROTTLING
// =====================================

function isEventThrottled(
  eventType,
  throttleMs = 100
){

  const now =
  Date.now();

  const previous =

    systemEventsState
    .throttledEvents
    .get(
      eventType
    );

  if(

    previous &&

    (
      now - previous
    ) < throttleMs

  ){

    return true;
  }

  systemEventsState
  .throttledEvents
  .set(
    eventType,
    now
  );

  return false;

}



// =====================================
// SAFE EXECUTION
// =====================================

async function executeSystemListener(
  listener,
  event
){

  try{

    return await Promise.race([

      Promise.resolve(
        listener(event)
      ),

      new Promise((resolve) => {

        setTimeout(() => {

          resolve(false);

        },

        SYSTEM_EVENTS_CONFIG
        .EVENT_TIMEOUT);

      })

    ]);

  }

  catch(error){

    systemEventsState
    .failedEvents++;

    return false;

  }

}



// =====================================
// EVENT HISTORY
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
  .push({

    id:event.id,

    type:event.type,

    timestamp:event.timestamp

  });

  if(

    systemEventsState
    .eventHistory
    .length >

    SYSTEM_EVENTS_CONFIG
    .MAX_EVENT_HISTORY

  ){

    systemEventsState
    .eventHistory
    .shift();

  }

  return true;

}



// =====================================
// EMIT EVENT
// =====================================

async function emitSystemEvent(
  eventName,
  payload = {},
  options = {}
){

  const normalizedEvent =
  normalizeSystemEvent(
    eventName
  );

  if(!normalizedEvent){

    return false;
  }

  if(

    SYSTEM_EVENTS_CONFIG
    .ENABLE_THROTTLING

  ){

    if(

      isEventThrottled(
        normalizedEvent
      )

    ){

      return false;
    }

  }

  const event =
  createSystemEvent(

    normalizedEvent,
    payload,
    options

  );

  systemEventsState
  .activeEvents++;

  systemEventsState
  .diagnostics
  .emitted++;

  try{



    // ================================
    // MIDDLEWARE
    // ================================

    const middlewareSuccess =
    await executeEventMiddleware(
      event
    );

    if(!middlewareSuccess){

      return false;
    }



    // ================================
    // NORMAL LISTENERS
    // ================================

    const listeners = [

      ...(systemEventsState
      .listeners
      .get(
        normalizedEvent
      )

      ||

      new Set())

    ];



    // ================================
    // ONCE LISTENERS
    // ================================

    const onceListeners = [

      ...(systemEventsState
      .onceListeners
      .get(
        normalizedEvent
      )

      ||

      new Set())

    ];



    // ================================
    // EXECUTION
    // ================================

    const executions = [];

    listeners.forEach((listener) => {

      executions.push(

        executeSystemListener(
          listener,
          event
        )

      );

    });

    onceListeners.forEach((listener) => {

      executions.push(

        executeSystemListener(
          listener,
          event
        )

      );

    });



    // ================================
    // WILDCARDS
    // ================================

    systemEventsState
    .wildcardListeners
    .forEach((listener) => {

      executions.push(

        executeSystemListener(
          listener,
          event
        )

      );

    });

    await Promise.allSettled(
      executions
    );



    // ================================
    // CLEAN ONCE LISTENERS
    // ================================

    if(
      onceListeners.length > 0
    ){

      systemEventsState
      .onceListeners
      .delete(
        normalizedEvent
      );

    }

    systemEventsState
    .totalEvents++;

    systemEventsState
    .diagnostics
    .completed++;

    systemEventsState
    .lastEventAt =
    Date.now();

    storeSystemEventHistory(
      event
    );

    return true;

  }

  catch(error){

    systemEventsState
    .failedEvents++;

    systemEventsState
    .diagnostics
    .failed++;

    return false;

  }

  finally{

    systemEventsState
    .activeEvents =

    Math.max(

      0,

      systemEventsState
      .activeEvents - 1

    );

  }

}



// =====================================
// EVENT REPLAY
// =====================================

async function replaySystemEvents(
  eventType = null
){

  const history =

    systemEventsState
    .eventHistory
    .filter((event) => {

      if(!eventType){

        return true;
      }

      return (
        event.type ===
        normalizeSystemEvent(
          eventType
        )
      );

    });

  for(
    const event
    of history
  ){

    await emitSystemEvent(
      event.type,
      {},
      {
        replay:true
      }
    );

  }

  return true;

}



// =====================================
// CLEAR HISTORY
// =====================================

function clearSystemEventHistory(){

  systemEventsState
  .eventHistory =
  [];

  return true;

}



// =====================================
// RESET
// =====================================

function resetSystemEvents(){

  systemEventsState
  .listeners
  .clear();

  systemEventsState
  .onceListeners
  .clear();

  systemEventsState
  .wildcardListeners
  .clear();

  systemEventsState
  .middleware
  .clear();

  systemEventsState
  .eventQueue = [];

  clearSystemEventHistory();

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getSystemEventDiagnostics(){

  return {

    initialized:
    systemEventsState
    .initialized,

    totalEvents:
    systemEventsState
    .totalEvents,

    failedEvents:
    systemEventsState
    .failedEvents,

    activeEvents:
    systemEventsState
    .activeEvents,

    listeners:

      systemEventsState
      .listeners
      .size,

    onceListeners:

      systemEventsState
      .onceListeners
      .size,

    wildcardListeners:

      systemEventsState
      .wildcardListeners
      .size,

    middleware:

      systemEventsState
      .middleware
      .size,

    historySize:

      systemEventsState
      .eventHistory
      .length,

    diagnostics:

      systemEventsState
      .diagnostics,

    lastEventAt:

      systemEventsState
      .lastEventAt

  };

}



// =====================================
// PUBLIC API
// =====================================

const SystemEvents =
Object.freeze({

  on:
  onSystemEvent,

  once:
  onceSystemEvent,

  off:
  offSystemEvent,

  emit:
  emitSystemEvent,

  onAny:
  onAnySystemEvent,

  replay:
  replaySystemEvents,

  use:
  useSystemEventMiddleware,

  diagnostics:
  getSystemEventDiagnostics,

  reset:
  resetSystemEvents

});
