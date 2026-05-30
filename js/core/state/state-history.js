// =====================================
// RIGO AI
// STATE HISTORY
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
// STORE
// =====================================

function storeStateHistory(
  stateManagerState,
  stateSnapshot
){

  if(

    !STATE_MANAGER_CONFIG
    .ENABLE_HISTORY

  ){

    return false;

  }

  stateManagerState
  .history
  .push({

    version:
    stateManagerState
    .version,

    state:
    createImmutableState(
      stateSnapshot
    ),

    timestamp:
    Date.now()

  });

  if(

    stateManagerState
    .history
    .length >

    STATE_MANAGER_CONFIG
    .MAX_HISTORY

  ){

    stateManagerState
    .history
    .shift();

  }

  return true;

}



// =====================================
// GET
// =====================================

function getStateHistory(
  stateManagerState
){

  return createImmutableState(
    stateManagerState
    .history
  );

}



// =====================================
// CLEAR
// =====================================

function clearStateHistory(
  stateManagerState
){

  stateManagerState
  .history =
  [];

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  storeStateHistory,

  getStateHistory,

  clearStateHistory

};
