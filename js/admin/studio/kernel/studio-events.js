// =====================================
// RIGO AI
// RIGO STUDIO EVENT BUS
// =====================================

import StudioState
from "./studio-state.js";

const studioEventBus =
Object.seal({

  listeners:
  new Map()

});

function on(
  eventName,
  handler
){

  if(
    !eventName ||
    typeof handler !== "function"
  ){

    return false;

  }

  const name =
  String(eventName);

  if(
    !studioEventBus
    .listeners
    .has(name)
  ){

    studioEventBus
    .listeners
    .set(
      name,
      new Set()
    );

  }

  studioEventBus
  .listeners
  .get(name)
  .add(handler);

  return true;

}

function off(
  eventName,
  handler
){

  const name =
  String(eventName || "");

  if(
    !studioEventBus
    .listeners
    .has(name)
  ){

    return false;

  }

  return studioEventBus
  .listeners
  .get(name)
  .delete(handler);

}

async function emit(
  eventName,
  payload = null
){

  const name =
  String(eventName || "");

  const event = {

    name,
    payload,
    timestamp:
    Date.now()

  };

  StudioState
  .addEvent(event);

  const listeners =
  studioEventBus
  .listeners
  .get(name);

  if(
    !listeners
  ){

    return {
      ok:
      true,

      handled:
      0,

      event
    };

  }

  let handled =
  0;

  for(
    const handler
    of listeners
  ){

    await handler(
      payload,
      event
    );

    handled +=
    1;

  }

  return {
    ok:
    true,

    handled,

    event
  };

}

function clear(){

  studioEventBus
  .listeners
  .clear();

  return true;

}

function snapshot(){

  return {

    listeners:
    [
      ...studioEventBus
      .listeners
      .entries()
    ]
    .map(
      ([name, handlers]) => ({
        name,
        handlers:
        handlers.size
      })
    )

  };

}

const StudioEvents =
Object.freeze({

  on,

  off,

  emit,

  clear,

  snapshot

});

export {

  on,

  off,

  emit,

  clear,

  snapshot,

  StudioEvents

};

export default
StudioEvents;
