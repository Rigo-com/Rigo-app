// =====================================
// RIGO AI
// RUNTIME STATE
// =====================================



// =====================================
// IMPORTS
// =====================================

import {

  RUNTIME_STATES

}
from "./runtime-config.js";



// =====================================
// INTERNAL STATE
// =====================================

const runtimeState =
Object.seal({

  state:
  RUNTIME_STATES
  .IDLE,

  initialized:
  false,

  booted:
  false,

  booting:
  false,

  shuttingDown:
  false,

  resetting:
  false,

  startedAt:
  null,

  stoppedAt:
  null,

  lastError:
  null

});



// =====================================
// STATE ACCESS
// =====================================

function getRuntimeState(){

  return runtimeState;

}



// =====================================
// STATE UPDATE
// =====================================

function updateRuntimeState(
  updates = {}
){

  Object.assign(

    runtimeState,
    updates

  );

  return true;

}



// =====================================
// STATE RESET
// =====================================

function resetRuntimeState(){

  runtimeState.state =
  RUNTIME_STATES.IDLE;

  runtimeState.initialized =
  false;

  runtimeState.booted =
  false;

  runtimeState.booting =
  false;

  runtimeState.shuttingDown =
  false;

  runtimeState.resetting =
  false;

  runtimeState.startedAt =
  null;

  runtimeState.stoppedAt =
  null;

  runtimeState.lastError =
  null;

  return true;

}



// =====================================
// STATE FLAGS
// =====================================

function isRuntimeInitialized(){

  return runtimeState
  .initialized;

}



function isRuntimeBooted(){

  return runtimeState
  .booted;

}



function isRuntimeBusy(){

  return (

    runtimeState
    .booting ||

    runtimeState
    .shuttingDown ||

    runtimeState
    .resetting

  );

}



// =====================================
// SNAPSHOT
// =====================================

function createRuntimeStateSnapshot(){

  return Object.freeze({

    state:
    runtimeState.state,

    initialized:
    runtimeState
    .initialized,

    booted:
    runtimeState
    .booted,

    booting:
    runtimeState
    .booting,

    shuttingDown:
    runtimeState
    .shuttingDown,

    resetting:
    runtimeState
    .resetting,

    startedAt:
    runtimeState
    .startedAt,

    stoppedAt:
    runtimeState
    .stoppedAt,

    lastError:
    runtimeState
    .lastError,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const RuntimeState =
Object.freeze({

  get:
  getRuntimeState,

  update:
  updateRuntimeState,

  reset:
  resetRuntimeState,

  isInitialized:
  isRuntimeInitialized,

  isBooted:
  isRuntimeBooted,

  isBusy:
  isRuntimeBusy,

  snapshot:
  createRuntimeStateSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  runtimeState,

  getRuntimeState,

  updateRuntimeState,

  resetRuntimeState,

  isRuntimeInitialized,

  isRuntimeBooted,

  isRuntimeBusy,

  createRuntimeStateSnapshot,

  RuntimeState

};

export default
RuntimeState;
