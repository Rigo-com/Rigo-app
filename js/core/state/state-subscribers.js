// =====================================
// RIGO AI
// STATE SUBSCRIBERS
// =====================================



// =====================================
// IMPORTS
// =====================================

import STATE_MANAGER_CONFIG
from "./state-config.js";

import {
  createImmutableState
}
from "./state-utils.js";



// =====================================
// SUBSCRIBE
// =====================================

function subscribeToState(
  stateManagerState,
  subscriber
){

  if(
    typeof subscriber !==
    "function"
  ){

    return false;

  }

  if(

    stateManagerState
    .subscribers
    .size >=

    STATE_MANAGER_CONFIG
    .MAX_SUBSCRIBERS

  ){

    return false;

  }

  stateManagerState
  .subscribers
  .add(
    subscriber
  );

  stateManagerState
  .diagnostics
  .subscribers =

    stateManagerState
    .subscribers
    .size;

  return true;

}



// =====================================
// UNSUBSCRIBE
// =====================================

function unsubscribeFromState(
  stateManagerState,
  subscriber
){

  const removed =

    stateManagerState
    .subscribers
    .delete(
      subscriber
    );

  stateManagerState
  .diagnostics
  .subscribers =

    stateManagerState
    .subscribers
    .size;

  return removed;

}



// =====================================
// NOTIFY
// =====================================

async function notifyStateSubscribers(
  stateManagerState,
  context
){

  const immutableContext =
  createImmutableState(
    context
  );

  for(

    const subscriber

    of

    [
      ...stateManagerState
      .subscribers
    ]

  ){

    try{

      await subscriber(
        immutableContext
      );

    }

    catch(error){}

  }

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  subscribeToState,

  unsubscribeFromState,

  notifyStateSubscribers

};
