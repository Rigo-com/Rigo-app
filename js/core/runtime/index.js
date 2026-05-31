// =====================================
// RIGO AI
// RUNTIME INDEX
// ENTRY POINT
// =====================================



// =====================================
// IMPORTS
// =====================================

import RuntimeConfig
from "./runtime-config.js";

import RuntimeState
from "./runtime-state.js";

import RuntimeHelpers
from "./runtime-helpers.js";

import RuntimeBootSequence
from "./runtime-boot-sequence.js";

import RuntimeManager
from "./runtime-manager.js";



// =====================================
// SHORTCUTS
// =====================================

async function initializeRuntime(){

  return RuntimeManager
  .initialize();

}



async function bootRuntime(){

  return RuntimeManager
  .boot();

}



async function shutdownRuntime(){

  return RuntimeManager
  .shutdown();

}



async function resetRuntime(){

  return RuntimeManager
  .reset();

}



// =====================================
// SNAPSHOT
// =====================================

function createRuntimeSystemSnapshot(){

  return Object.freeze({

    runtime:
    RuntimeManager
    .snapshot(),

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const Runtime =
Object.freeze({

  config:
  RuntimeConfig,

  state:
  RuntimeState,

  helpers:
  RuntimeHelpers,

  bootSequence:
  RuntimeBootSequence,

  manager:
  RuntimeManager,

  initialize:
  initializeRuntime,

  boot:
  bootRuntime,

  shutdown:
  shutdownRuntime,

  reset:
  resetRuntime,

  snapshot:
  createRuntimeSystemSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  RuntimeConfig,

  RuntimeState,

  RuntimeHelpers,

  RuntimeBootSequence,

  RuntimeManager,

  initializeRuntime,

  bootRuntime,

  shutdownRuntime,

  resetRuntime,

  createRuntimeSystemSnapshot,

  Runtime

};

export default
Runtime;
