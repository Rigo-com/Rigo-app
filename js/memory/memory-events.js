// =====================================
// RIGO AI
// MEMORY EVENTS
// FINAL OPTIMIZED EVENT BUS
// =====================================



// =====================================
// EVENT CONFIG
// =====================================

const MEMORY_EVENTS_CONFIG =
Object.freeze({

  MAX_LISTENERS_PER_EVENT:
  100,

  MAX_EVENT_HISTORY:
  1000,

  ENABLE_EVENT_HISTORY:
  true,

  MAX_EVENT_PAYLOAD_SIZE:
  500000,

  MAX_RECURSIVE_EVENT_DEPTH:
  10,

  EVENT_LISTENER_TIMEOUT:
  10000,

  EVENT_NAME_PATTERN:
  /^[a-z0-9._*-]+$/

});



// =====================================
// EVENT TYPES
// =====================================

const MEMORY_EVENT_TYPES =
Object.freeze({

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

  wildcardListeners:
  new Set(),

  eventHistory:[],

  eventDepth:
  new Map(),

  activeStack:[],

  activeEmits:0,

  totalEvents:0,

  failedEvents:0,

  lastEventAt:null

});



// =====================================
// HELPERS
// =====================================

function normalizeEventName(
  eventName
){

  if(
    eventName === "*"
  ){

    return "*";

  }

  const normalized =
  String(

    normalizeMemoryString?.(
      eventName
    )

    || ""

  )
  .toLowerCase()
  .trim();

  if(
    !normalized
  ){

    return "";

  }

  if(

    !MEMORY_EVENTS_CONFIG
    .EVENT_NAME_PATTERN
    .test(
      normalized
    )

  ){

    return "";

  }

  return normalized;

}



function isValidEventListener(
  listener
){

  return (
    typeof listener ===
    "function"
  );

}



function updateEventDepth(
  eventName,
  operation
){

  const currentDepth =

    memoryEventsState
    .eventDepth
    .get(eventName)

    || 0;

  if(
    operation === "increment"
  ){

    memoryEventsState
    .eventDepth
    .set(
      eventName,
      currentDepth + 1
    );

    return currentDepth + 1;

  }

  if(
    currentDepth <= 1
  ){

    memoryEventsState
    .eventDepth
    .delete(
      eventName
    );

    return 0;

  }

  memoryEventsState
  .eventDepth
  .set(
    eventName,
    currentDepth - 1
  );

  return currentDepth - 1;

}



function validateEventPayload(
  payload
){

  try{

    const serialized =
    JSON.stringify(
      payload
    );

    return (

      typeof serialized ===
      "string"

      &&

      serialized.length <=

      MEMORY_EVENTS_CONFIG
      .MAX_EVENT_PAYLOAD_SIZE

    );

  }

  catch{

    return false;

  }

}



function createMemoryEvent(
  type,
  payload = {}
){

  return {

    id:
    createMemoryId?.(),

    type:
    normalizeEventName(
      type
    ),

    payload,

    timestamp:
    Date.now()

  };

}



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

  memoryEventsState
  .eventHistory
  .push({

    id:
    event.id,

    type:
    event.type,

    timestamp:
    event.timestamp

  });

  while(

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



function getEventListeners(
  eventName
){

  return [

    ...(memoryEventsState
    .listeners
    .get(eventName)

    ||

    []),

    ...memoryEventsState
    .wildcardListeners

  ];

}



function hasEventListeners(
  eventName
){

  return (
    getEventListeners(
      eventName
    ).length > 0
  );

}



// =====================================
// SUBSCRIBE
// =====================================

function subscribeMemoryEvent(
  eventName,
  listener,
  options = {}
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

  const listenerObject = {

    callback:
    listener,

    once:
    options.once === true

  };

  if(
    normalizedEvent === "*"
  ){

    memoryEventsState
    .wildcardListeners
    .add(
      listenerObject
    );

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

  listeners.add(
    listenerObject
  );

  return true;

}



function onceMemoryEvent(
  eventName,
  listener
){

  return subscribeMemoryEvent(

    eventName,

    listener,

    {
      once:true
    }

  );

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

  const removeListener =
  (collection) => {

    let removed = false;

    collection.forEach((item) => {

      if(
        item.callback ===
        listener
      ){

        collection.delete(
          item
        );

        removed = true;

      }

    });

    return removed;

  };

  if(
    normalizedEvent === "*"
  ){

    return removeListener(

      memoryEventsState
      .wildcardListeners

    );

  }

  const listeners =

    memoryEventsState
    .listeners
    .get(
      normalizedEvent
    );

  if(
    !listeners
  ){

    return false;

  }

  const removed =
  removeListener(
    listeners
  );

  if(
    listeners.size <= 0
  ){

    memoryEventsState
    .listeners
    .delete(
      normalizedEvent
    );

  }

  return removed;

}



// =====================================
// EXECUTE LISTENER
// =====================================

async function executeEventListener(
  listener,
  event
){

  let timeoutId = null;

  try{

    const timeoutPromise =
    new Promise((resolve) => {

      timeoutId =
      setTimeout(() => {

        resolve(false);

      },

      MEMORY_EVENTS_CONFIG
      .EVENT_LISTENER_TIMEOUT);

    });

    const result =
    await Promise.race([

      Promise.resolve(

        listener.callback(
          event
        )

      ),

      timeoutPromise

    ]);

    return result !== false;

  }

  catch(error){

    memoryEventsState
    .failedEvents++;

    memoryState
    ?.runtime &&
    (
      memoryState.runtime
      .lastError = error
    );

    return false;

  }

  finally{

    if(
      timeoutId
    ){

      clearTimeout(
        timeoutId
      );

    }

  }

}



// =====================================
// EMIT
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

  if(
    !validateEventPayload(
      payload
    )
  ){

    return false;

  }

  const currentDepth =

    memoryEventsState
    .eventDepth
    .get(
      normalizedEvent
    )

    || 0;

  if(

    currentDepth >=

    MEMORY_EVENTS_CONFIG
    .MAX_RECURSIVE_EVENT_DEPTH

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

  const listeners =
  getEventListeners(
    normalizedEvent
  );

  memoryEventsState
  .activeEmits++;

  memoryEventsState
  .activeStack
  .push(
    normalizedEvent
  );

  updateEventDepth(
    normalizedEvent,
    "increment"
  );

  try{

    await Promise.allSettled(

      listeners.map((listener) => {

        return executeEventListener(
          listener,
          event
        );

      })

    );

    listeners.forEach((listener) => {

      if(
        listener.once === true
      ){

        unsubscribeMemoryEvent(

          normalizedEvent,

          listener.callback

        );

      }

    });

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

    memoryState
    ?.runtime &&
    (
      memoryState.runtime
      .lastError = error
    );

    return false;

  }

  finally{

    updateEventDepth(
      normalizedEvent,
      "decrement"
    );

    memoryEventsState
    .activeStack
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
// CLEANUP
// =====================================

function clearMemoryEventHistory(){

  memoryEventsState
  .eventHistory =
  [];

  return true;

}



function clearMemoryEventListeners(){

  memoryEventsState
  .listeners
  .clear();

  memoryEventsState
  .wildcardListeners
  .clear();

  memoryEventsState
  .eventDepth
  .clear();

  memoryEventsState
  .activeStack =
  [];

  memoryEventsState
  .activeEmits = 0;

  return true;

}



function resetMemoryEventDiagnostics(){

  memoryEventsState
  .totalEvents = 0;

  memoryEventsState
  .failedEvents = 0;

  memoryEventsState
  .lastEventAt = null;

  return true;

}



function destroyMemoryEventBus(){

  clearMemoryEventListeners();

  clearMemoryEventHistory();

  resetMemoryEventDiagnostics();

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getMemoryEventDiagnostics(){

  let activeListeners = 0;

  memoryEventsState
  .listeners
  .forEach((listeners) => {

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

    wildcardListeners:

      memoryEventsState
      .wildcardListeners
      .size,

    activeListeners,

    activeEmits:

      memoryEventsState
      .activeEmits,

    historySize:

      memoryEventsState
      .eventHistory
      .length,

    activeStack:[
      ...memoryEventsState
      .activeStack
    ],

    lastEventAt:

      memoryEventsState
      .lastEventAt

  };

}



// =====================================
// PUBLIC API
// =====================================

const MemoryEvents =
Object.freeze({

  on:
  subscribeMemoryEvent,

  once:
  onceMemoryEvent,

  off:
  unsubscribeMemoryEvent,

  emit:
  emitMemoryEvent,

  hasListeners:
  hasEventListeners,

  clear:
  clearMemoryEventListeners,

  clearHistory:
  clearMemoryEventHistory,

  resetDiagnostics:
  resetMemoryEventDiagnostics,

  destroy:
  destroyMemoryEventBus,

  diagnostics:
  getMemoryEventDiagnostics,

  types:
  MEMORY_EVENT_TYPES

});



// =====================================
// EXPORTS
// =====================================

export {

  MEMORY_EVENT_TYPES,

  subscribeMemoryEvent,

  onceMemoryEvent,

  unsubscribeMemoryEvent,

  emitMemoryEvent,

  hasEventListeners,

  clearMemoryEventListeners,

  clearMemoryEventHistory,

  resetMemoryEventDiagnostics,

  destroyMemoryEventBus,

  getMemoryEventDiagnostics,

  MemoryEvents

};



export default
MemoryEvents;
