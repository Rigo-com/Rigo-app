// =====================================
// RIGO AI
// STATE SNAPSHOTS
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
// CREATE
// =====================================

function createStateSnapshot(
  stateManagerState
){

  const snapshot =
  createImmutableState({

    version:
    stateManagerState
    .version,

    state:
    stateManagerState
    .currentState,

    timestamp:
    Date.now()

  });

  stateManagerState
  .snapshots
  .push(
    snapshot
  );

  if(

    stateManagerState
    .snapshots
    .length >

    STATE_MANAGER_CONFIG
    .MAX_SNAPSHOTS

  ){

    stateManagerState
    .snapshots
    .shift();

  }

  stateManagerState
  .diagnostics
  .snapshots++;

  return snapshot;

}



// =====================================
// GET
// =====================================

function getStateSnapshots(
  stateManagerState
){

  return createImmutableState(
    stateManagerState
    .snapshots
  );

}



// =====================================
// CLEAR
// =====================================

function clearStateSnapshots(
  stateManagerState
){

  stateManagerState
  .snapshots =
  [];

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  createStateSnapshot,

  getStateSnapshots,

  clearStateSnapshots

};
