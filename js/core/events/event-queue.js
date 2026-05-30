// =====================================
// RIGO AI
// EVENT QUEUE
// =====================================



// =====================================
// IMPORTS
// =====================================

import {
  SYSTEM_EVENTS_CONFIG,
  SYSTEM_EVENT_PRIORITIES
}
from "./event-types.js";

import {
  systemEventsState
}
from "./event-state.js";

import {
  createRetriedEvent
}
from "./event-utils.js";

import {
  executeSystemListener,
  sortExecutionsByPriority
}
from "./event-listeners.js";

import {
  executeEventMiddleware
}
from "./event-middleware.js";

import {
  storeSystemEventHistory
}
from "./event-history.js";



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
// EXECUTE EVENT
// =====================================

async function executeSystemEvent(
  originalEvent
){

  systemEventsState
  .activeEvents++;

  try{

    let attempts = 0;

    let currentEvent =
    originalEvent;

    while(

      attempts <=
      SYSTEM_EVENTS_CONFIG
      .MAX_RETRIES

    ){

      try{

        const middlewareSuccess =
        await executeEventMiddleware(
          currentEvent
        );

        if(
          !middlewareSuccess
        ){

          return false;

        }

        const listeners = [

          ...(systemEventsState
          .listeners
          .get(
            currentEvent.type
          ) ||

          new Set())

        ];

        const onceListeners = [

          ...(systemEventsState
          .onceListeners
          .get(
            currentEvent.type
          ) ||

          new Set())

        ];

        const executions = [];

        listeners.forEach((listener) => {

          executions.push({

            priority:
            currentEvent.priority,

            execute(){

              return executeSystemListener(
                listener,
                currentEvent
              );

            }

          });

        });

        onceListeners.forEach((listener) => {

          executions.push({

            priority:
            currentEvent.priority,

            execute(){

              return executeSystemListener(
                listener,
                currentEvent
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
                currentEvent
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
            currentEvent.type
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
          currentEvent
        );

        return true;

      }

      catch(error){

        attempts++;

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

        currentEvent =
        createRetriedEvent(
          currentEvent,
          attempts
        );

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

    console.warn(
      "[SystemEvents] Event execution failed",
      error
    );

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
// PROCESS QUEUE
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

      if(
        !queueItem
      ){

        continue;

      }

      await executeSystemEvent(
        queueItem
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
// SCHEDULER
// =====================================

function scheduleQueueProcessing(){

  if(
    systemEventsState
    .scheduledQueue
  ){

    return;
  }

  systemEventsState
  .scheduledQueue =
  true;

  queueMicrotask(async() => {

    systemEventsState
    .scheduledQueue =
    false;

    await processSystemEventQueue();

  });

}



// =====================================
// EXPORTS
// =====================================

export {

  isEventThrottled,

  cleanupThrottledEvents,

  executeSystemEvent,

  processSystemEventQueue,

  scheduleQueueProcessing

};
