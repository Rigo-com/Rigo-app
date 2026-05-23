// =====================================
// RIGO AI
// MEMORY EVENTS
// ENTERPRISE INFINITY GOD FINAL
// =====================================



// =====================================
// EVENT CONFIG
// =====================================

const MEMORY_EVENTS_CONFIG =
Object.freeze({

  MAX_LISTENERS_PER_EVENT:100,

  MAX_EVENT_HISTORY:1000,

  ENABLE_EVENT_HISTORY:true,

  MAX_EVENT_PAYLOAD_SIZE:
  500000,

  MAX_RECURSIVE_EVENT_DEPTH:
  10,

  EVENT_NAME_PATTERN:
  /^[a-z0-9._*-]+$/,

  EVENT_LISTENER_TIMEOUT:
  10000

});



// =====================================
// EVENT TYPES
// =====================================

const MEMORY_EVENT_TYPES =
Object.freeze({



  // ===================================
  // MEMORY EVENTS
  // ===================================

  MEMORY_CREATED:
  "memory.created",

  MEMORY_UPDATED:
  "memory.updated",

  MEMORY_DELETED:
  "memory.deleted",

  MEMORY_ARCHIVED:
  "memory.archived",

  MEMORY_RESTORED:
  "memory.restored",

  MEMORY_CORRUPTED:
  "memory.corrupted",

  MEMORY_SYNCED:
  "memory.synced",

  MEMORY_INDEXED:
  "memory.indexed",

  MEMORY_SEARCHED:
  "memory.search",



  // ===================================
  // SYSTEM EVENTS
  // ===================================

  SYSTEM_INITIALIZED:
  "system.initialized",

  SYSTEM_SHUTDOWN:
  "system.shutdown",

  SYSTEM_RESTARTED:
  "system.restarted",

  SYSTEM_RECOVERED:
  "system.recovered",

  SYSTEM_CLEANUP:
  "system.cleanup"

});



// =====================================
// EVENT STATE
// =====================================

const memoryEventsState =
Object.seal({

  listeners:
  new Map(),

  onceListeners:
  new Map(),

  wildcardListeners:
  new Set(),

  eventHistory:[],

  activeEmits:0,

  totalEvents:0,

  failedEvents:0,

  lastEventAt:null,

  activeEventStack:[],

  eventDepthMap:
  new Map()

});



// =====================================
// EVENT HELPERS
// =====================================

function normalizeEventName(
  eventName
){

  const normalizedEvent =
  String(

    normalizeMemoryString(
      eventName
    )

    ||

    ""

  )
  .toLowerCase()
  .trim();

  if(

    !MEMORY_EVENTS_CONFIG
    .EVENT_NAME_PATTERN
    .test(
      normalizedEvent
    )

  ){

    return "";

  }

  return normalizedEvent;

}



function isValidEventListener(
  listener
){

  return (
    typeof listener ===
    "function"
  );

}



function isEmittingEvent(){

  return (

    memoryEventsState
    .activeEmits > 0

  );

}



function getEventDepth(
  eventName
){

  return (

    memoryEventsState
    .eventDepthMap
    .get(eventName)

    ||

    0

  );

}



function incrementEventDepth(
  eventName
){

  const currentDepth =
  getEventDepth(
    eventName
  );

  memoryEventsState
  .eventDepthMap
  .set(

    eventName,

    currentDepth + 1

  );

}



function decrementEventDepth(
  eventName
){

  const currentDepth =
  getEventDepth(
    eventName
  );

  if(
    currentDepth <= 1
  ){

    memoryEventsState
    .eventDepthMap
    .delete(
      eventName
    );

    return;
  }

  memoryEventsState
  .eventDepthMap
  .set(

    eventName,

    currentDepth - 1

  );

}



// =====================================
// SAFE CLONE
// =====================================

function safeCloneEventPayload(
  value,
  visited = new WeakMap()
){

  if(

    value === null ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return visited.get(
      value
    );

  }

  const clone =

    Array.isArray(value)

    ? []

    : {};

  visited.set(
    value,
    clone
  );

  Object.keys(value)
  .forEach((key) => {

    clone[key] =
    safeCloneEventPayload(

      value[key],
      visited

    );

  });

  return clone;

}



// =====================================
// DEEP FREEZE
// =====================================

function deepFreezeEventObject(
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

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(
    value
  )
  .forEach((nestedValue) => {

    if(

      nestedValue &&

      typeof nestedValue ===
      "object"

    ){

      deepFreezeEventObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// EVENT PAYLOAD VALIDATION
// =====================================

function validateEventPayload(
  payload
){

  try{

    const serialized =
    JSON.stringify(
      payload
    );

    return (

      serialized.length <=

      MEMORY_EVENTS_CONFIG
      .MAX_EVENT_PAYLOAD_SIZE

    );

  }

  catch(error){

    return false;

  }

}



// =====================================
// EVENT HISTORY
// =====================================

function storeEventHistory(
  event
){

  if(

    MEMORY_EVENTS_CONFIG
    .ENABLE_EVENT_HISTORY !==
    true

  ){

    return false;

  }

  const compactEvent = {

    id:event.id,

    type:event.type,

    timestamp:event.timestamp

  };

  memoryEventsState
  .eventHistory
  .push(
    compactEvent
  );

  if(

    memoryEventsState
    .eventHistory
    .length >

    MEMORY_EVENTS_CONFIG
    .MAX_EVENT_HISTORY

  ){

    memoryEventsState
    .eventHistory
    .shift();

  }

  return true;

}



// =====================================
// EVENT OBJECT
// =====================================

function createMemoryEvent(
  type,
  payload = {}
){

  const safePayload =
  safeCloneEventPayload(
    payload
  );

  return deepFreezeEventObject({

    id:
    createMemoryId(),

    type:
    normalizeEventName(
      type
    ),

    payload:
    safePayload,

    timestamp:
    Date.now()

  });

}



// =====================================
// SUBSCRIBE
// =====================================

function subscribeMemoryEvent(
  eventName,
  listener
){

  const normalizedEvent =
  normalizeEventName(
    eventName
  );

  if(
    !normalizedEvent
  ){

    return false;

  }

  if(
    !isValidEventListener(
      listener
    )
  ){

    return false;

  }



  // ===================================
  // WILDCARD LISTENERS
  // ===================================

  if(
    normalizedEvent === "*"
  ){

    memoryEventsState
    .wildcardListeners
    .add(listener);

    return true;

  }

  if(

    !memoryEventsState
    .listeners
    .has(
      normalizedEvent
    )

  ){

    memoryEventsState
    .listeners
    .set(
      normalizedEvent,
      new Set()
    );

  }

  const listeners =

    memoryEventsState
    .listeners
    .get(
      normalizedEvent
    );

  if(

    listeners.size >=

    MEMORY_EVENTS_CONFIG
    .MAX_LISTENERS_PER_EVENT

  ){

    return false;

  }

  if(
    listeners.has(
      listener
    )
  ){

    return true;

  }

  listeners.add(
    listener
  );

  return true;

}



// =====================================
// SUBSCRIBE ONCE
// =====================================

function onceMemoryEvent(
  eventName,
  listener
){

  const normalizedEvent =
  normalizeEventName(
    eventName
  );

  if(
    !normalizedEvent
  ){

    return false;

  }

  if(
    !isValidEventListener(
      listener
    )
  ){

    return false;

  }

  if(

    !memoryEventsState
    .onceListeners
    .has(
      normalizedEvent
    )

  ){

    memoryEventsState
    .onceListeners
    .set(
      normalizedEvent,
      new Set()
    );

  }

  const listeners =

    memoryEventsState
    .onceListeners
    .get(
      normalizedEvent
    );

  if(

    listeners.size >=

    MEMORY_EVENTS_CONFIG
    .MAX_LISTENERS_PER_EVENT

  ){

    return false;

  }

  if(
    listeners.has(
      listener
    )
  ){

    return true;

  }

  listeners.add(
    listener
  );

  return true;

}



// =====================================
// UNSUBSCRIBE
// =====================================

function unsubscribeMemoryEvent(
  eventName,
  listener
){

  const normalizedEvent =
  normalizeEventName(
    eventName
  );

  if(
    !normalizedEvent
  ){

    return false;

  }

  let removed = false;

  if(
    normalizedEvent === "*"
  ){

    return memoryEventsState
    .wildcardListeners
    .delete(
      listener
    );

  }

  const normalListeners =

    memoryEventsState
    .listeners
    .get(
      normalizedEvent
    );

  const onceListeners =

    memoryEventsState
    .onceListeners
    .get(
      normalizedEvent
    );

  if(
    normalListeners
  ){

    removed =
    normalListeners.delete(
      listener
    ) || removed;

    if(
      normalListeners.size <= 0
    ){

      memoryEventsState
      .listeners
      .delete(
        normalizedEvent
      );

    }

  }

  if(
    onceListeners
  ){

    removed =
    onceListeners.delete(
      listener
    ) || removed;

    if(
      onceListeners.size <= 0
    ){

      memoryEventsState
      .onceListeners
      .delete(
        normalizedEvent
      );

    }

  }

  return removed;

}



// =====================================
// LISTENER TIMEOUT
// =====================================

function createListenerTimeout(){

  return new Promise((resolve) => {

    setTimeout(() => {

      resolve(false);

    },

    MEMORY_EVENTS_CONFIG
    .EVENT_LISTENER_TIMEOUT);

  });

}



// =====================================
// LISTENER EXECUTION
// =====================================

async function executeEventListener(
  listener,
  event
){

  try{

    const result =
    await Promise.race([

      Promise.resolve(
        listener(event)
      ),

      createListenerTimeout()

    ]);

    return result !== false;

  }

  catch(error){

    memoryEventsState
    .failedEvents++;

    if(
      memoryState?.runtime
    ){

      memoryState.runtime
      .lastError =
      error;

    }

    return false;

  }

}



// =====================================
// EMIT EVENT
// =====================================

async function emitMemoryEvent(
  eventName,
  payload = {}
){

  const normalizedEvent =
  normalizeEventName(
    eventName
  );

  if(
    !normalizedEvent
  ){

    return false;

  }



  // ===================================
  // RECURSION PROTECTION
  // ===================================

  const currentDepth =
  getEventDepth(
    normalizedEvent
  );

  if(

    currentDepth >=

    MEMORY_EVENTS_CONFIG
    .MAX_RECURSIVE_EVENT_DEPTH

  ){

    memoryEventsState
    .failedEvents++;

    return false;

  }



  // ===================================
  // PAYLOAD VALIDATION
  // ===================================

  if(
    !validateEventPayload(
      payload
    )
  ){

    memoryEventsState
    .failedEvents++;

    return false;

  }

  const event =
  createMemoryEvent(
    normalizedEvent,
    payload
  );



  // ================================
  // SYSTEM EVENTS BRIDGE
  // ================================

  if(

    typeof emitSystemEvent ===
    "function"

  ){

    try{

      const bridgeResult =
      emitSystemEvent(

        normalizedEvent,

        {

          source:"memory",

          memoryEvent:true,

          payload:
          safeCloneEventPayload(
            payload
          )

        }

      );

      if(

        bridgeResult &&

        typeof bridgeResult
        .catch ===
        "function"

      ){

        bridgeResult
        .catch(() => {});

      }

    }

    catch(error){}

  }

  memoryEventsState
  .activeEmits++;

  incrementEventDepth(
    normalizedEvent
  );

  memoryEventsState
  .activeEventStack
  .push(
    normalizedEvent
  );

  try{

    const listeners = [

      ...(memoryEventsState
      .listeners
      .get(
        normalizedEvent
      )

      ||

      new Set())

    ];

    const onceListeners = [

      ...(memoryEventsState
      .onceListeners
      .get(
        normalizedEvent
      )

      ||

      new Set())

    ];

    const wildcardListeners = [

      ...memoryEventsState
      .wildcardListeners

    ];

    const executionPromises = [];



    // ================================
    // NORMAL LISTENERS
    // ================================

    listeners.forEach((listener) => {

      executionPromises.push(

        executeEventListener(
          listener,
          event
        )

      );

    });



    // ================================
    // ONCE LISTENERS
    // ================================

    onceListeners.forEach((listener) => {

      executionPromises.push(

        executeEventListener(
          listener,
          event
        )

      );

    });



    // ================================
    // WILDCARD LISTENERS
    // ================================

    wildcardListeners.forEach((listener) => {

      executionPromises.push(

        executeEventListener(
          listener,
          event
        )

      );

    });

    await Promise.allSettled(
      executionPromises
    );



    // ================================
    // CLEAN ONCE LISTENERS
    // ================================

    if(
      onceListeners.length > 0
    ){

      memoryEventsState
      .onceListeners
      .delete(
        normalizedEvent
      );

    }

    memoryEventsState
    .totalEvents++;

    memoryEventsState
    .lastEventAt =
    Date.now();

    storeEventHistory(
      event
    );

    return true;

  }

  catch(error){

    memoryEventsState
    .failedEvents++;

    if(
      memoryState?.runtime
    ){

      memoryState.runtime
      .lastError =
      error;

    }

    return false;

  }

  finally{

    decrementEventDepth(
      normalizedEvent
    );

    memoryEventsState
    .activeEventStack
    .pop();

    memoryEventsState
    .activeEmits =

    Math.max(

      0,

      memoryEventsState
      .activeEmits - 1

    );

  }

}



// =====================================
// CLEAR EVENT HISTORY
// =====================================

function clearMemoryEventHistory(){

  memoryEventsState
  .eventHistory =
  [];

  return true;

}



// =====================================
// CLEAR EVENT LISTENERS
// =====================================

function clearMemoryEventListeners(){

  memoryEventsState
  .listeners
  .clear();

  memoryEventsState
  .onceListeners
  .clear();

  memoryEventsState
  .wildcardListeners
  .clear();

  memoryEventsState
  .eventDepthMap
  .clear();

  memoryEventsState
  .activeEventStack =
  [];

  memoryEventsState
  .activeEmits = 0;

  memoryEventsState
  .totalEvents = 0;

  memoryEventsState
  .failedEvents = 0;

  memoryEventsState
  .lastEventAt = null;

  return true;

}



// =====================================
// EVENT DIAGNOSTICS
// =====================================

function getMemoryEventDiagnostics(){

  const listenerCounts = {};

  let activeListeners = 0;

  memoryEventsState
  .listeners
  .forEach((listeners,eventName) => {

    listenerCounts[
      eventName
    ] = listeners.size;

    activeListeners +=
    listeners.size;

  });

  return {

    totalEvents:

      memoryEventsState
      .totalEvents,

    failedEvents:

      memoryEventsState
      .failedEvents,

    registeredEvents:

      memoryEventsState
      .listeners
      .size,

    onceEvents:

      memoryEventsState
      .onceListeners
      .size,

    wildcardListeners:

      memoryEventsState
      .wildcardListeners
      .size,

    historySize:

      memoryEventsState
      .eventHistory
      .length,

    historyEnabled:

      MEMORY_EVENTS_CONFIG
      .ENABLE_EVENT_HISTORY,

    maxListeners:

      MEMORY_EVENTS_CONFIG
      .MAX_LISTENERS_PER_EVENT,

    maxHistory:

      MEMORY_EVENTS_CONFIG
      .MAX_EVENT_HISTORY,

    activeEmits:

      memoryEventsState
      .activeEmits,

    activeListeners,

    activeEventStack:[
      ...memoryEventsState
      .activeEventStack
    ],

    lastEventAt:

      memoryEventsState
      .lastEventAt,

    listeners:
    listenerCounts

  };

}
