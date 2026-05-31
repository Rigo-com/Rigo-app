// =====================================
// RIGO AI
// LIFECYCLE MANAGER
// =====================================



// =====================================
// IMPORTS
// =====================================

import {

  LIFECYCLE_STATES

}
from "./lifecycle-config.js";

import LifecycleState
from "./lifecycle-state.js";

import LifecycleStartup
from "./lifecycle-startup.js";

import LifecycleShutdown
from "./lifecycle-shutdown.js";



// =====================================
// INITIALIZE
// =====================================

async function initializeLifecycle(){

  if(
    LifecycleState
    .isInitialized()
  ){

    return true;

  }

  LifecycleState
  .update({

    initialized:true,

    state:
    LIFECYCLE_STATES
    .INITIALIZED

  });

  return true;

}



// =====================================
// START
// =====================================

async function startLifecycle(){

  await initializeLifecycle();

  return LifecycleStartup
  .execute();

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownLifecycle(){

  return LifecycleShutdown
  .execute();

}



// =====================================
// RESTART
// =====================================

async function restartLifecycle(){

  const stopped =
  await shutdownLifecycle();

  if(
    !stopped
  ){

    return false;

  }

  return startLifecycle();

}



// =====================================
// RESET
// =====================================

async function resetLifecycle(){

  await shutdownLifecycle();

  LifecycleState
  .reset();

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createLifecycleSnapshot(){

  return Object.freeze({

    lifecycle:
    LifecycleState
    .snapshot(),

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const LifecycleManager =
Object.freeze({

  initialize:
  initializeLifecycle,

  start:
  startLifecycle,

  shutdown:
  shutdownLifecycle,

  restart:
  restartLifecycle,

  reset:
  resetLifecycle,

  snapshot:
  createLifecycleSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initializeLifecycle,

  startLifecycle,

  shutdownLifecycle,

  restartLifecycle,

  resetLifecycle,

  createLifecycleSnapshot,

  LifecycleManager

};

export default
LifecycleManager;
