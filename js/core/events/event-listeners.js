// =====================================
// RIGO AI
// EVENT LISTENERS
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
  isValidSystemListener
}
from "./event-utils.js";



// =====================================
// ON
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

    return null;

  }

  if(
    !isValidSystemListener(
      listener
    )
  ){

    return null;

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

    return null;

  }

  listeners.add(
    listener
  );

  return () => {

    offSystemEvent(
      normalizedEvent,
      listener
    );

  };

}



// =====================================
// ONCE
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

    return null;

  }

  if(
    !isValidSystemListener(
      listener
    )
  ){

    return null;

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

  const listeners =

    systemEventsState
    .onceListeners
    .get(
      normalizedEvent
    );

  if(

    listeners.size >=

    SYSTEM_EVENTS_CONFIG
    .MAX_LISTENERS

  ){

    return null;

  }

  listeners.add(
    listener
  );

  return () => {

    systemEventsState
    .onceListeners
    .get(
      normalizedEvent
    )
    ?.delete(
      listener
    );

  };

}



// =====================================
// ON ANY
// =====================================

function onAnySystemEvent(
  listener
){

  if(
    !isValidSystemListener(
      listener
    )
  ){

    return null;

  }

  systemEventsState
  .wildcardListeners
  .add(
    listener
  );

  return () => {

    offAnySystemEvent(
      listener
    );

  };

}



// =====================================
// OFF ANY
// =====================================

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
// OFF
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
// EXECUTE LISTENER
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

    console.warn(
      "[SystemEvents] Listener failed",
      error
    );

    return false;

  }

}



// =====================================
// SORT EXECUTIONS
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
// EXPORTS
// =====================================

export {

  onSystemEvent,

  onceSystemEvent,

  onAnySystemEvent,

  offAnySystemEvent,

  offSystemEvent,

  executeSystemListener,

  sortExecutionsByPriority

};
