// =====================================
// RIGO AI
// MEMORY EVENTS
// EVENT BUS LAYER
// =====================================

import {
  MEMORY_EVENTS
}
from "./memory-constants.js";

import ServiceManager
from "../services/service-manager.js";



// =====================================
// EVENT STORE
// =====================================

const listeners =
new Map();



// =====================================
// CORE EVENT BRIDGE
// =====================================

async function publishCoreMemoryEvent(
  eventName,
  payload
){

  try{
    const events =
    await ServiceManager.resolve(
      "events"
    );

    if(!events?.emit){
      return false;
    }

    return Boolean(
      await events.emit(
        eventName,
        Object.freeze({
          source:"memory-manager",
          timestamp:Date.now(),
          data:payload
        })
      )
    );
  }
  catch(error){
    return false;
  }

}



// =====================================
// HELPERS
// =====================================

function getListeners(
  eventName
){

  if(
    !listeners.has(
      eventName
    )
  ){

    listeners.set(

      eventName,

      new Set()

    );

  }

  return listeners.get(
    eventName
  );

}



// =====================================
// ON
// =====================================

function on(
  eventName,
  callback
){

  if(
    typeof callback !==
    "function"
  ){
    return false;
  }

  getListeners(
    eventName
  )
  .add(
    callback
  );

  return true;

}



// =====================================
// OFF
// =====================================

function off(
  eventName,
  callback
){

  return getListeners(
    eventName
  )
  .delete(
    callback
  );

}



// =====================================
// ONCE
// =====================================

function once(
  eventName,
  callback
){

  if(
    typeof callback !==
    "function"
  ){
    return false;
  }

  const wrapper =
  (...args) => {

    off(
      eventName,
      wrapper
    );

    callback(
      ...args
    );

  };

  return on(
    eventName,
    wrapper
  );

}



// =====================================
// EMIT
// =====================================

function emit(
  eventName,
  payload = null
){

  const handlers =

    Array.from(

      getListeners(
        eventName
      )

    );

  for(
    const handler
    of handlers
  ){

    try{

      handler(
        payload
      );

    }

    catch(error){

      console.error(

        "[MEMORY EVENTS]",

        error

      );

    }

  }

  publishCoreMemoryEvent(
    eventName,
    payload
  )
  .catch(() => {});

  return true;

}



// =====================================
// CLEAR
// =====================================

function clear(){

  listeners.clear();

  return true;

}



// =====================================
// LISTENER COUNT
// =====================================

function listenerCount(
  eventName
){

  return getListeners(
    eventName
  )
  .size;

}



// =====================================
// PUBLIC API
// =====================================

const MemoryEvents =
Object.freeze({

  on,

  off,

  once,

  emit,

  clear,

  listenerCount,

  EVENTS:
  MEMORY_EVENTS

});



// =====================================
// EXPORTS
// =====================================

export {

  on,

  off,

  once,

  emit,

  clear,

  listenerCount,

  MemoryEvents

};

export default
MemoryEvents;
