// =====================================
// RIGO AI
// CHAT EVENTS
// EVENT BUS SERVICE
// =====================================

import {
  CHAT_EVENTS
}
from "../chat-config.js";



// =====================================
// EVENT STATE
// =====================================

const eventState =
Object.seal({

  initialized:false,

  listeners:
  new Map()

});



// =====================================
// INITIALIZE
// =====================================

function initializeChatEvents(){

  if(
    eventState.initialized
  ){
    return true;
  }

  eventState.initialized =
  true;

  return true;

}



// =====================================
// DESTROY
// =====================================

function destroyChatEvents(){

  eventState.listeners
  .clear();

  eventState.initialized =
  false;

  return true;

}



// =====================================
// SUBSCRIBE
// =====================================

function on(
  eventName,
  listener
){

  if(
    typeof listener !==
    "function"
  ){
    return false;
  }

  if(
    !eventState.listeners.has(
      eventName
    )
  ){

    eventState.listeners.set(
      eventName,
      new Set()
    );

  }

  eventState.listeners
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
  eventState.listeners.get(
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

  return true;

}



// =====================================
// ONCE
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
  eventState.listeners.get(
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
        "[CHAT EVENT]",
        error
      );

    }

  }

  return true;

}



// =====================================
// CLEAR
// =====================================

function clearEvent(
  eventName
){

  eventState.listeners
  .delete(eventName);

  return true;

}



// =====================================
// CLEAR ALL
// =====================================

function clearAllEvents(){

  eventState.listeners
  .clear();

  return true;

}



// =====================================
// STATS
// =====================================

function getEventStats(){

  let listenerCount = 0;

  for(
    const listeners
    of eventState.listeners.values()
  ){

    listenerCount +=
    listeners.size;

  }

  return Object.freeze({

    initialized:
    eventState.initialized,

    events:
    eventState.listeners.size,

    listeners:
    listenerCount

  });

}



// =====================================
// PUBLIC API
// =====================================

const ChatEvents =
Object.freeze({

  initialize:
  initializeChatEvents,

  destroy:
  destroyChatEvents,

  on,

  off,

  once,

  emit,

  clear:
  clearEvent,

  clearAll:
  clearAllEvents,

  stats:
  getEventStats,

  events:
  CHAT_EVENTS

});



// =====================================
// EXPORTS
// =====================================

export {

  initializeChatEvents,

  destroyChatEvents,

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
