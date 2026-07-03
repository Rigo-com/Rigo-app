// =====================================
// RIGO AI
// ADMIN RUNTIME
// =====================================

import AdminRuntimeState
from "./admin-runtime-state.js";

import AdminRuntimeRegistry
from "./admin-runtime-registry.js";

import {

  bootRuntimeModules,

  shutdownRuntimeModules,

  resetRuntimeModules,

  recoverRuntimeModules

}
from "./admin-runtime-lifecycle.js";



// =====================================
// INITIALIZE
// =====================================

async function initialize(){

  try{

    if(
      AdminRuntimeState
      .state
      .initialized
    ){

      return true;

    }

    AdminRuntimeState
    .log(
      "runtime",
      "ADMIN RUNTIME INITIALIZED"
    );

    return true;

  }
  catch(error){

    AdminRuntimeState
    .setError(
      error
    );

    return false;

  }

}



// =====================================
// BOOT
// =====================================

async function boot(){

  if(
    !AdminRuntimeState
    .state
    .initialized
  ){

    await initialize();

  }

  return
  bootRuntimeModules();

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdown(){

  return
  shutdownRuntimeModules();

}



// =====================================
// RESET
// =====================================

async function reset(){

  return
  resetRuntimeModules();

}



// =====================================
// RECOVER
// =====================================

async function recover(){

  return
  recoverRuntimeModules();

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    state:
    AdminRuntimeState
    .snapshot(),

    registry:
    AdminRuntimeRegistry
    .snapshot()

  };

}



// =====================================
// API
// =====================================

const AdminRuntime =
Object.freeze({

  id:
  "admin-runtime",

  priority:
  0,

  initialize,

  boot,

  shutdown,

  recover,

  reset,

  snapshot,

  registry:
  AdminRuntimeRegistry

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  boot,

  shutdown,

  recover,

  reset,

  snapshot,

  AdminRuntime

};

export default
AdminRuntime;
