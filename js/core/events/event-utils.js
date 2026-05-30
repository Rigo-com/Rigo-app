// =====================================
// RIGO AI
// EVENT UTILS
// =====================================



// =====================================
// IMPORTS
// =====================================

import {
  SYSTEM_EVENT_PRIORITIES
}
from "./event-types.js";



// =====================================
// NORMALIZE EVENT
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



// =====================================
// EVENT ID
// =====================================

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



// =====================================
// VALID LISTENER
// =====================================

function isValidSystemListener(
  listener
){

  return (
    typeof listener ===
    "function"
  );

}



// =====================================
// SAFE FREEZE
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

    (
      typeof HTMLElement !==
      "undefined" &&

      value instanceof HTMLElement
    )

  ){

    return value;

  }

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

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



// =====================================
// SAFE PAYLOAD CLONE
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

  if(
    value instanceof Date
  ){

    return new Date(
      value.getTime()
    );

  }

  if(
    value instanceof RegExp
  ){

    return new RegExp(
      value
    );

  }

  if(
    value instanceof Map
  ){

    return new Map(
      [...value.entries()]
    );

  }

  if(
    value instanceof Set
  ){

    return new Set(
      [...value.values()]
    );

  }

  if(

    typeof HTMLElement !==
    "undefined" &&

    value instanceof HTMLElement

  ){

    return null;

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

    const nestedValue =
      value[key];

    if(
      typeof nestedValue ===
      "function"
    ){

      return;

    }

    clone[key] =
      cloneSystemPayload(

        nestedValue,

        visited

      );

  });

  return clone;

}



// =====================================
// CREATE EVENT
// =====================================

function createSystemEvent(
  type,
  payload = {},
  options = {}
){

  return safeFreeze({

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

    retries:

      Number(
        options.retries
      )

      ||

      0,

    replay:
    Boolean(
      options.replay
    ),

    cancelled:
    false

  });

}



// =====================================
// RETRY EVENT
// =====================================

function createRetriedEvent(
  event,
  retries
){

  return createSystemEvent(

    event.type,

    event.payload,

    {

      replay:
      event.replay,

      priority:
      event.priority,

      retries

    }

  );

}



// =====================================
// EXPORTS
// =====================================

export {

  normalizeSystemEvent,

  createSystemEventId,

  isValidSystemListener,

  safeFreeze,

  cloneSystemPayload,

  createSystemEvent,

  createRetriedEvent

};
