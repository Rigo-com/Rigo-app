// =====================================
// RIGO AI
// CHAT EVENTS
// EVENT BUS LAYER
// =====================================

import {
  CHAT_EVENTS
}
from "../chat-config.js";



// =====================================
// EVENT LISTENERS
// =====================================

const eventListeners =
new Map();



// =====================================
// VALIDATION
// =====================================

function isValidEvent(
  eventName
){

  return (
    typeof eventName ===
    "string"
    &&
    eventName.length > 0
  );

}



// =====================================
// SUBSCRIBE
// =====================================

function on(
  eventName,
  listener
){

  if(
    !isValidEvent(eventName)
  ){
    return false;
  }

  if(
    typeof listener !==
    "function"
  ){
    return false;
  }

  if(
    !eventListeners.has(
      eventName
    )
  ){

    eventListeners.set(
      eventName,
      new Set()
    );

  }

  eventListeners
  .get(eventName)
  .add(listener);

  return true;

}



// =====================================
// UNSUBSCRIBE
// =====================================

function off(
  eventName,
  listener
){

  const listeners =
  eventListeners.get(
    eventName
  );

  if(
    !listeners
  ){
    return false;
  }

  listeners.delete(
    listener
  );

  if(
    listeners.size <= 0
  ){

    eventListeners.delete(
      eventName
    );

  }

  return true;

}



// =====================================
// SUBSCRIBE ONCE
// =====================================

function once(
  eventName,
  listener
){

  function wrapper(
    payload
  ){

    off(
      eventName,
      wrapper
    );

    listener(
      payload
    );

  }

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

  const listeners =
  eventListeners.get(
    eventName
  );

  if(
    !listeners
  ){
    return true;
  }

  for(
    const listener
    of listeners
  ){

    try{

      listener(
        payload
      );

    }

    catch(error){

      console.error(
        "[RIGO CHAT EVENT]",
        error
      );

    }

  }

  return true;

}



// =====================================
// CLEAR EVENT
// =====================================

function clearEvent(
  eventName
){

  eventListeners.delete(
    eventName
  );

  return true;

}



// =====================================
// CLEAR ALL EVENTS
// =====================================

function clearAllEvents(){

  eventListeners.clear();

  return true;

}



// =====================================
// EVENT STATS
// =====================================

function getEventStats(){

  let listenerCount = 0;

  for(
    const listeners
    of eventListeners.values()
  ){

    listenerCount +=
    listeners.size;

  }

  return Object.freeze({

    events:
    eventListeners.size,

    listeners:
    listenerCount

  });

}



// =====================================
// PUBLIC API
// =====================================

const ChatEvents =
Object.freeze({

  events:
  CHAT_EVENTS,

  on,

  off,

  once,

  emit,

  clear:
  clearEvent,

  clearAll:
  clearAllEvents,

  stats:
  getEventStats

});



// =====================================
// EXPORTS
// =====================================

export {

  on,

  off,

  once,

  emit,

  clearEvent,

  clearAllEvents,

  getEventStats,

  ChatEvents

};

export default
ChatEvents;
