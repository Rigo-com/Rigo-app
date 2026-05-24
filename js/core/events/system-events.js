// =====================================
// RIGO AI
// SYSTEM EVENTS
// ENTERPRISE EVENT BUS
// =====================================



// =====================================
// SYSTEM EVENT STATE
// =====================================

const systemEventsState =
Object.seal({

  initialized:false,

  processingQueue:false,

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

  eventHistory:
  new Map(),

  throttledEvents:
  new Map(),

  eventQueue:[],

  diagnostics:{

    emitted:0,

    completed:0,

    failed:0,

    retries:0,

    cancelled:0,

    queueProcessed:0

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
// SAFE CLONE
// =====================================

function cloneSystemPayload(
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
    cloneSystemPayload(

      value[key],
      visited

    );

  });

  return clone;

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
    cloneSystemPayload(
      payload
    ),

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

    replay:
    Boolean(
      options.replay
    ),

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
// WILDCARD
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



function offAnySystemEvent(
  listener
){

  return systemEventsState
  .wildcardListeners
  .delete(
    listener
  );

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

  const removed =
  listeners.delete(
    listener
  );

  if(
    listeners.size <= 0
  ){

    systemEventsState
    .listeners
    .delete(
      normalizedEvent
    );

  }

  return removed;

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



function removeSystemEventMiddleware(
  middleware
){

  return systemEventsState
  .middleware
  .delete(
    middleware
  );

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

        systemEventsState
        .diagnostics
        .cancelled++;

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



function cleanupThrottledEvents(){

  const now =
  Date.now();

  systemEventsState
  .throttledEvents
  .forEach((timestamp,key) => {

    if(
      (now - timestamp) >
      SYSTEM_EVENTS_CONFIG
      .THROTTLE_CLEANUP_INTERVAL
    ){

      systemEventsState
      .throttledEvents
      .delete(key);

    }

  });

  if(

    systemEventsState
    .throttledEvents
    .size >

    SYSTEM_EVENTS_CONFIG
    .MAX_THROTTLED_EVENTS

  ){

    systemEventsState
    .throttledEvents
    .clear();

  }

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
// SORT LISTENERS
// =====================================

function sortExecutionsByPriority(
  executions = []
){

  return executions.sort(
    (a,b) => {

      return (
        b.priority -
        a.priority
      );

    }
  );

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
  .set(

    event.id,

    {

      id:event.id,

      type:event.type,

      payload:
      cloneSystemPayload(
        event.payload
      ),

      timestamp:event.timestamp,

      priority:event.priority

    }

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
// QUEUE PROCESSOR
// =====================================

async function processSystemEventQueue(){

  if(
    systemEventsState
    .processingQueue
  ){

    return false;

  }

  systemEventsState
  .processingQueue =
  true;

  try{

    while(

      systemEventsState
      .eventQueue
      .length > 0

    ){

      const queueItem =

        systemEventsState
        .eventQueue
        .shift();

      systemEventsState
      .queuedEvents =

      Math.max(

        0,

        systemEventsState
        .queuedEvents - 1

      );

      if(!queueItem){

        continue;

      }

      await executeSystemEvent(
        queueItem.event
      );

      systemEventsState
      .diagnostics
      .queueProcessed++;

    }

    return true;

  }

  finally{

    systemEventsState
    .processingQueue =
    false;

  }

}



// =====================================
// EXECUTE EVENT
// =====================================

async function executeSystemEvent(
  event
){

  systemEventsState
  .activeEvents++;

  try{

    let attempts = 0;

    while(

      attempts <=
      SYSTEM_EVENTS_CONFIG
      .MAX_RETRIES

    ){

      try{

        const middlewareSuccess =
        await executeEventMiddleware(
          event
        );

        if(!middlewareSuccess){

          return false;

        }

        const listeners = [

          ...(systemEventsState
          .listeners
          .get(
            event.type
          )

          ||

          new Set())

        ];

        const onceListeners = [

          ...(systemEventsState
          .onceListeners
          .get(
            event.type
          )

          ||

          new Set())

        ];

        const executions = [];

        listeners.forEach((listener) => {

          executions.push({

            priority:
            event.priority,

            execute(){

              return executeSystemListener(
                listener,
                event
              );

            }

          });

        });

        onceListeners.forEach((listener) => {

          executions.push({

            priority:
            event.priority,

            execute(){

              return executeSystemListener(
                listener,
                event
              );

            }

          });

        });

        systemEventsState
        .wildcardListeners
        .forEach((listener) => {

          executions.push({

            priority:
            SYSTEM_EVENT_PRIORITIES
            .LOW,

            execute(){

              return executeSystemListener(
                listener,
                event
              );

            }

          });

        });

        const sortedExecutions =
        sortExecutionsByPriority(
          executions
        );

        for(
          const execution
          of sortedExecutions
        ){

          await execution.execute();

        }

        if(
          onceListeners.length > 0
        ){

          systemEventsState
          .onceListeners
          .delete(
            event.type
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

        attempts++;

        event.retries =
        attempts;

        systemEventsState
        .diagnostics
        .retries++;

        if(

          !SYSTEM_EVENTS_CONFIG
          .ENABLE_RETRIES ||

          attempts >

          SYSTEM_EVENTS_CONFIG
          .MAX_RETRIES

        ){

          throw error;

        }

      }

    }

    return false;

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

  cleanupThrottledEvents();

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

  if(

    systemEventsState
    .eventQueue
    .length >=

    SYSTEM_EVENTS_CONFIG
    .MAX_EVENT_QUEUE

  ){

    return false;

  }

  const event =
  createSystemEvent(

    normalizedEvent,
    payload,
    options

  );

  systemEventsState
  .eventQueue
  .push({

    event

  });

  systemEventsState
  .queuedEvents++;

  systemEventsState
  .diagnostics
  .emitted++;

  await processSystemEventQueue();

  return true;

}



// =====================================
// EVENT REPLAY
// =====================================

async function replaySystemEvents(
  eventType = null
){

  const history = [

    ...systemEventsState
    .eventHistory
    .values()

  ]

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

      cloneSystemPayload(
        event.payload
      ),

      {

        replay:true,

        priority:
        event.priority

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
  .eventHistory
  .clear();

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
  .eventQueue =
  [];

  systemEventsState
  .throttledEvents
  .clear();

  clearSystemEventHistory();

  systemEventsState
  .processingQueue =
  false;

  systemEventsState
  .totalEvents =
  0;

  systemEventsState
  .failedEvents =
  0;

  systemEventsState
  .activeEvents =
  0;

  systemEventsState
  .queuedEvents =
  0;

  systemEventsState
  .lastEventAt =
  null;

  systemEventsState
  .diagnostics = {

    emitted:0,

    completed:0,

    failed:0,

    retries:0,

    cancelled:0,

    queueProcessed:0

  };

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getSystemEventDiagnostics(){

  return Object.freeze({

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

    queuedEvents:
    systemEventsState
    .queuedEvents,

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
      .size,

    diagnostics:{

      ...systemEventsState
      .diagnostics

    },

    lastEventAt:

      systemEventsState
      .lastEventAt

  });

}



// =====================================
// INITIALIZE
// =====================================

function initializeSystemEvents(){

  if(
    systemEventsState
    .initialized
  ){

    return true;

  }

  systemEventsState
  .initialized =
  true;

  return true;

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

  onAny:
  onAnySystemEvent,

  offAny:
  offAnySystemEvent,

  emit:
  emitSystemEvent,

  replay:
  replaySystemEvents,

  use:
  useSystemEventMiddleware,

  removeMiddleware:
  removeSystemEventMiddleware,

  diagnostics:
  getSystemEventDiagnostics,

  reset:
  resetSystemEvents

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.SystemEvents =
  SystemEvents;

  window.emitSystemEvent =
  emitSystemEvent;

  window.initializeSystemEvents =
  initializeSystemEvents;

}
