// =====================================
// RIGO AI
// SEARCH EVENTS
// EVENT BUS LAYER
// =====================================

import {
  SEARCH_EVENTS
}
from "./search-config.js";



// =====================================
// EVENT STORE
// =====================================

const listeners =
new Map();



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
        "[SEARCH EVENTS]",
        error
      );

    }

  }

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

const SearchEvents =
Object.freeze({

  on,

  off,

  once,

  emit,

  clear,

  listenerCount,

  EVENTS:
  SEARCH_EVENTS

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

  SearchEvents

};

export default
SearchEvents;
