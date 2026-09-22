// =====================================
// RIGO AI
// SETTINGS EVENTS
// EVENT BUS LAYER
// =====================================



// =====================================
// SETTINGS EVENTS
// =====================================

const SETTINGS_EVENTS =
Object.freeze({

  INITIALIZED:
  "settings.initialized",

  DESTROYED:
  "settings.destroyed",

  LOADED:
  "settings.loaded",

  SAVED:
  "settings.saved",

  UPDATED:
  "settings.updated",

  RESET:
  "settings.reset",

  SYNC_STARTED:
  "settings.sync.started",

  SYNC_COMPLETED:
  "settings.sync.completed",

  SYNC_FAILED:
  "settings.sync.failed",

  VALIDATION_FAILED:
  "settings.validation.failed",

  SECURITY_VIOLATION:
  "settings.security.violation"

});



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

  const handlers = listeners.get(eventName);
  if(!handlers) return false;
  const removed = handlers.delete(callback);
  if(handlers.size===0) listeners.delete(eventName);
  return removed;

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
        "[SETTINGS EVENTS]",
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

  return listeners.get(eventName)?.size || 0;

}



// =====================================
// PUBLIC API
// =====================================

const SettingsEvents =
Object.freeze({

  on,

  off,

  once,

  emit,

  clear,

  listenerCount,

  EVENTS:
  SETTINGS_EVENTS

});



// =====================================
// EXPORTS
// =====================================

export {

  SETTINGS_EVENTS,

  on,

  off,

  once,

  emit,

  clear,

  listenerCount,

  SettingsEvents

};

export default
SettingsEvents;
