// =====================================
// RIGO AI
// EVENT MANAGER
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
  normalizeSystemEvent,
  createSystemEvent,
  cloneSystemPayload,
  safeFreeze
}
from "./event-utils.js";

import {
  getSystemEventHistory,
  clearSystemEventHistory
}
from "./event-history.js";

import {
  isEventThrottled,
  cleanupThrottledEvents,
  scheduleQueueProcessing
}
from "./event-queue.js";

import {
  onSystemEvent,
  onceSystemEvent,
  offSystemEvent,
  onAnySystemEvent,
  offAnySystemEvent
}
from "./event-listeners.js";

import {
  useSystemEventMiddleware,
  removeSystemEventMiddleware
}
from "./event-middleware.js";



// =====================================
// EMIT
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

  if(
    !normalizedEvent
  ){

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
  .push(
    event
  );

  systemEventsState
  .queuedEvents++;

  systemEventsState
  .diagnostics
  .emitted++;

  scheduleQueueProcessing();

  return true;

}



// =====================================
// REPLAY
// =====================================

async function replaySystemEvents(
  eventType = null
){

  const history =
  getSystemEventHistory(
    eventType
  );

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

        replay:
        true,

        priority:
        event.priority

      }

    );

  }

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

  systemEventsState
  .throttledEvents
  .clear();

  clearSystemEventHistory();

  systemEventsState
  .processingQueue =
  false;

  systemEventsState
  .scheduledQueue =
  false;

  systemEventsState
  .initialized =
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

  Object.assign(

    systemEventsState
    .diagnostics,

    {

      emitted:0,
      completed:0,
      failed:0,
      retries:0,
      cancelled:0,
      queueProcessed:0

    }

  );

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getSystemEventDiagnostics(){

  return safeFreeze({

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
safeFreeze({

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

  initialize:
  initializeSystemEvents,

  reset:
  resetSystemEvents

});



// =====================================
// EXPORTS
// =====================================

export {

  emitSystemEvent,

  replaySystemEvents,

  initializeSystemEvents,

  resetSystemEvents,

  getSystemEventDiagnostics,

  SystemEvents

};

export default
SystemEvents;
