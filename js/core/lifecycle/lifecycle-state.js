// =====================================
// RIGO AI
// LIFECYCLE STATE
// =====================================



// =====================================
// IMPORTS
// =====================================

import {

  LIFECYCLE_STATES

}
from "./lifecycle-config.js";



// =====================================
// INTERNAL STATE
// =====================================

const lifecycleState =
Object.seal({

  state:
  LIFECYCLE_STATES
  .CREATED,

  initialized:
  false,

  running:
  false,

  shuttingDown:
  false,

  startedAt:
  null,

  stoppedAt:
  null,

  lastError:
  null

});



// =====================================
// UPDATE
// =====================================

function updateLifecycleState(
  updates = {}
){

  Object.assign(

    lifecycleState,

    updates

  );

  return true;

}



// =====================================
// SET STATE
// =====================================

function setLifecycleState(
  state
){

  lifecycleState.state =
  state;

  return true;

}



// =====================================
// ERROR
// =====================================

function setLifecycleError(
  error
){

  lifecycleState.lastError =
  error;

  return true;

}



function clearLifecycleError(){

  lifecycleState.lastError =
  null;

  return true;

}



// =====================================
// STATUS
// =====================================

function isInitialized(){

  return lifecycleState
  .initialized;

}



function isRunning(){

  return lifecycleState
  .running;

}



function isShuttingDown(){

  return lifecycleState
  .shuttingDown;

}



function isBusy(){

  return (

    lifecycleState
    .shuttingDown

  );

}



// =====================================
// RESET
// =====================================

function resetLifecycleState(){

  lifecycleState.state =
  LIFECYCLE_STATES
  .CREATED;

  lifecycleState.initialized =
  false;

  lifecycleState.running =
  false;

  lifecycleState.shuttingDown =
  false;

  lifecycleState.startedAt =
  null;

  lifecycleState.stoppedAt =
  null;

  lifecycleState.lastError =
  null;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createLifecycleSnapshot(){

  return Object.freeze({

    state:
    lifecycleState.state,

    initialized:
    lifecycleState.initialized,

    running:
    lifecycleState.running,

    shuttingDown:
    lifecycleState.shuttingDown,

    startedAt:
    lifecycleState.startedAt,

    stoppedAt:
    lifecycleState.stoppedAt,

    lastError:
    lifecycleState.lastError

  });

}



// =====================================
// PUBLIC API
// =====================================

const LifecycleState =
Object.freeze({

  update:
  updateLifecycleState,

  setState:
  setLifecycleState,

  setError:
  setLifecycleError,

  clearError:
  clearLifecycleError,

  isInitialized,

  isRunning,

  isShuttingDown,

  isBusy,

  reset:
  resetLifecycleState,

  snapshot:
  createLifecycleSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  lifecycleState,

  updateLifecycleState,

  setLifecycleState,

  setLifecycleError,

  clearLifecycleError,

  resetLifecycleState,

  createLifecycleSnapshot,

  LifecycleState

};

export default
LifecycleState;
