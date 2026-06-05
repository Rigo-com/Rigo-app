// =====================================
// RIGO AI
// UI EVENTS
// UI EVENT MANAGEMENT
// =====================================

import {
  uiState
}
from "./ui-state.js";



// =====================================
// EVENT STORE
// =====================================

const eventListeners =
new Map();



// =====================================
// HELPERS
// =====================================

function createEventKey(
  event,
  handler
){

  return (

    event +

    ":" +

    String(
      handler
    )

  );

}



// =====================================
// ADD LISTENER
// =====================================

function addListener(

  element,

  event,

  handler,

  options

){

  if(
    !element
    ||
    typeof handler !==
    "function"
  ){

    return false;

  }

  element
  .addEventListener(

    event,

    handler,

    options

  );

  const key =

    createEventKey(

      event,

      handler

    );

  eventListeners
  .set(

    key,

    {

      element,

      event,

      handler,

      options

    }

  );

  uiState
  .listeners
  .add(key);

  return true;

}



// =====================================
// REMOVE LISTENER
// =====================================

function removeListener(

  event,

  handler

){

  const key =

    createEventKey(

      event,

      handler

    );

  const listener =

    eventListeners
    .get(key);

  if(
    !listener
  ){

    return false;

  }

  listener.element
  .removeEventListener(

    listener.event,

    listener.handler,

    listener.options

  );

  eventListeners
  .delete(key);

  uiState
  .listeners
  .delete(key);

  return true;

}



// =====================================
// REMOVE ALL
// =====================================

function removeAllListeners(){

  for(
    const listener
    of eventListeners
    .values()
  ){

    listener.element
    .removeEventListener(

      listener.event,

      listener.handler,

      listener.options

    );

  }

  eventListeners.clear();

  uiState
  .listeners
  .clear();

  return true;

}



// =====================================
// EMIT CUSTOM EVENT
// =====================================

function emitEvent(

  name,

  detail = {}

){

  document
  .dispatchEvent(

    new CustomEvent(

      name,

      {

        detail

      }

    )

  );

  return true;

}



// =====================================
// ON CUSTOM EVENT
// =====================================

function onEvent(

  name,

  handler

){

  return addListener(

    document,

    name,

    handler

  );

}



// =====================================
// EVENT COUNT
// =====================================

function getListenerCount(){

  return uiState
  .listeners
  .size;

}



// =====================================
// PUBLIC API
// =====================================

const UiEvents =
Object.freeze({

  addListener,

  removeListener,

  removeAllListeners,

  emitEvent,

  onEvent,

  getListenerCount

});



// =====================================
// EXPORTS
// =====================================

export {

  addListener,

  removeListener,

  removeAllListeners,

  emitEvent,

  onEvent,

  getListenerCount,

  UiEvents

};

export default
UiEvents;
