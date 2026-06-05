// =====================================
// RIGO AI
// SIDEBAR EVENTS
// EVENT BUS LAYER
// =====================================



// =====================================
// SIDEBAR EVENTS
// =====================================

const SIDEBAR_EVENTS =
Object.freeze({

  INITIALIZED:
  "sidebar.initialized",

  OPENED:
  "sidebar.opened",

  CLOSED:
  "sidebar.closed",

  TOGGLED:
  "sidebar.toggled",

  COLLAPSED:
  "sidebar.collapsed",

  EXPANDED:
  "sidebar.expanded",

  ITEM_SELECTED:
  "sidebar.item.selected",

  DESTROYED:
  "sidebar.destroyed"

});



// =====================================
// LISTENERS
// =====================================

const sidebarListeners =
new Map();



// =====================================
// SUBSCRIBE
// =====================================

function on(
  event,
  callback
){

  if(
    typeof callback !==
    "function"
  ){

    return false;

  }

  if(
    !sidebarListeners.has(
      event
    )
  ){

    sidebarListeners.set(
      event,
      new Set()
    );

  }

  sidebarListeners
  .get(event)
  .add(callback);

  return true;

}



// =====================================
// UNSUBSCRIBE
// =====================================

function off(
  event,
  callback
){

  const listeners =

    sidebarListeners
    .get(event);

  if(
    !listeners
  ){

    return false;

  }

  return listeners
  .delete(
    callback
  );

}



// =====================================
// EMIT
// =====================================

function emit(
  event,
  payload = {}
){

  const listeners =

    sidebarListeners
    .get(event);

  if(
    !listeners
  ){

    return false;

  }

  listeners.forEach(
    callback => {

      try{

        callback(
          payload
        );

      }

      catch(error){

        console.error(
          error
        );

      }

    }
  );

  return true;

}



// =====================================
// ONCE
// =====================================

function once(
  event,
  callback
){

  function handler(
    payload
  ){

    off(
      event,
      handler
    );

    callback(
      payload
    );

  }

  return on(
    event,
    handler
  );

}



// =====================================
// RESET
// =====================================

function resetEvents(){

  sidebarListeners
  .clear();

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const SidebarEvents =
Object.freeze({

  on,

  off,

  once,

  emit,

  reset:
  resetEvents

});



// =====================================
// EXPORTS
// =====================================

export {

  SIDEBAR_EVENTS,

  sidebarListeners,

  on,

  off,

  once,

  emit,

  SidebarEvents

};

export default
SidebarEvents;
