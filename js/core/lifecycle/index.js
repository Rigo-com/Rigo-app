// =====================================
// RIGO AI
// LIFECYCLE INDEX
// ENTRY POINT
// =====================================



// =====================================
// IMPORTS
// =====================================

import LifecycleConfig
from "./lifecycle-config.js";

import LifecycleState
from "./lifecycle-state.js";

import LifecycleStartup
from "./lifecycle-startup.js";

import LifecycleShutdown
from "./lifecycle-shutdown.js";

import LifecycleManager
from "./lifecycle-manager.js";



// =====================================
// SHORTCUTS
// =====================================

async function initializeLifecycle(){

  return LifecycleManager
  .initialize();

}



async function startLifecycle(){

  return LifecycleManager
  .start();

}



async function shutdownLifecycle(){

  return LifecycleManager
  .shutdown();

}



async function restartLifecycle(){

  return LifecycleManager
  .restart();

}



async function resetLifecycle(){

  return LifecycleManager
  .reset();

}



// =====================================
// SNAPSHOT
// =====================================

function createLifecycleSystemSnapshot(){

  return Object.freeze({

    lifecycle:
    LifecycleManager
    .snapshot(),

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const Lifecycle =
Object.freeze({

  config:
  LifecycleConfig,

  state:
  LifecycleState,

  startup:
  LifecycleStartup,

  shutdown:
  LifecycleShutdown,

  manager:
  LifecycleManager,

  initialize:
  initializeLifecycle,

  start:
  startLifecycle,

  shutdownApp:
  shutdownLifecycle,

  restart:
  restartLifecycle,

  reset:
  resetLifecycle,

  snapshot:
  createLifecycleSystemSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  LifecycleConfig,

  LifecycleState,

  LifecycleStartup,

  LifecycleShutdown,

  LifecycleManager,

  initializeLifecycle,

  startLifecycle,

  shutdownLifecycle,

  restartLifecycle,

  resetLifecycle,

  createLifecycleSystemSnapshot,

  Lifecycle

};

export default
Lifecycle;
