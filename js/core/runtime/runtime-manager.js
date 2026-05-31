// =====================================
// RIGO AI
// RUNTIME MANAGER
// =====================================



// =====================================
// IMPORTS
// =====================================

import {

  RUNTIME_STATES

}
from "./runtime-config.js";

import RuntimeState
from "./runtime-state.js";

import {

  normalizeRuntimeError,

  safeFreeze,

  getCurrentTimestamp

}
from "./runtime-helpers.js";

import RuntimeBootSequence
from "./runtime-boot-sequence.js";



// =====================================
// INITIALIZE
// =====================================

async function initializeRuntime(){

  if(
    RuntimeState
    .isInitialized()
  ){

    return true;

  }

  RuntimeState
  .update({

    initialized:true,

    state:
    RUNTIME_STATES
    .INITIALIZED

  });

  return true;

}



// =====================================
// BOOT
// =====================================

async function bootRuntime(){

  if(
    RuntimeState
    .isBusy()
  ){

    return false;

  }

  if(
    RuntimeState
    .isBooted()
  ){

    return true;

  }

  try{

    RuntimeState
    .update({

      booting:true,

      state:
      RUNTIME_STATES
      .BOOTING,

      lastError:null

    });

    await initializeRuntime();

    await RuntimeBootSequence
    .executeBootSequence();

    RuntimeState
    .update({

      booting:false,

      booted:true,

      state:
      RUNTIME_STATES
      .RUNNING,

      startedAt:
      getCurrentTimestamp()

    });

    return true;

  }

  catch(error){

    RuntimeState
    .update({

      booting:false,

      booted:false,

      state:
      RUNTIME_STATES
      .FAILED,

      lastError:
      normalizeRuntimeError(
        error
      )

    });

    return false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownRuntime(){

  if(
    RuntimeState
    .isBusy()
  ){

    return false;

  }

  if(
    !RuntimeState
    .isBooted()
  ){

    return true;

  }

  try{

    RuntimeState
    .update({

      shuttingDown:true,

      state:
      RUNTIME_STATES
      .SHUTTING_DOWN

    });

    await RuntimeBootSequence
    .executeShutdownSequence();

    RuntimeState
    .update({

      shuttingDown:false,

      booted:false,

      state:
      RUNTIME_STATES
      .STOPPED,

      stoppedAt:
      getCurrentTimestamp()

    });

    return true;

  }

  catch(error){

    RuntimeState
    .update({

      shuttingDown:false,

      state:
      RUNTIME_STATES
      .FAILED,

      lastError:
      normalizeRuntimeError(
        error
      )

    });

    return false;

  }

}



// =====================================
// RESET
// =====================================

async function resetRuntime(){

  if(
    RuntimeState
    .isBusy()
  ){

    return false;

  }

  try{

    RuntimeState
    .update({

      resetting:true,

      state:
      RUNTIME_STATES
      .RESETTING

    });

    await shutdownRuntime();

    RuntimeState
    .reset();

    return true;

  }

  catch(error){

    RuntimeState
    .update({

      resetting:false,

      state:
      RUNTIME_STATES
      .FAILED,

      lastError:
      normalizeRuntimeError(
        error
      )

    });

    return false;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createRuntimeSnapshot(){

  return safeFreeze({

    runtime:
    RuntimeState
    .snapshot(),

    bootSequence:
    RuntimeBootSequence
    .snapshot(),

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const RuntimeManager =
Object.freeze({

  initialize:
  initializeRuntime,

  boot:
  bootRuntime,

  shutdown:
  shutdownRuntime,

  reset:
  resetRuntime,

  snapshot:
  createRuntimeSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initializeRuntime,

  bootRuntime,

  shutdownRuntime,

  resetRuntime,

  createRuntimeSnapshot,

  RuntimeManager

};

export default
RuntimeManager;
