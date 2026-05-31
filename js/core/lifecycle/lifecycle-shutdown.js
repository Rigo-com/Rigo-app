// =====================================
// RIGO AI
// LIFECYCLE SHUTDOWN
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



// =====================================
// HELPERS
// =====================================

function getTimestamp(){

  return Date.now();

}



async function safeExecute(
  operation
){

  if(
    typeof operation !==
    "function"
  ){

    return true;

  }

  return await operation();

}



// =====================================
// SHUTDOWN MODULES
// =====================================

async function shutdownModules(){

  try{

    const modulesModule =
    await import(
      "../modules/index.js"
    );

    const modules =

      modulesModule.default ||
      modulesModule.Modules;

    if(
      !modules
    ){

      return false;

    }

    return await modules
    .shutdown();

  }

  catch{

    return false;

  }

}



// =====================================
// SHUTDOWN RUNTIME
// =====================================

async function shutdownRuntime(){

  try{

    const runtimeModule =
    await import(
      "../runtime/index.js"
    );

    const runtime =

      runtimeModule.default ||
      runtimeModule.Runtime;

    if(
      !runtime
    ){

      return false;

    }

    return await runtime
    .shutdown();

  }

  catch{

    return false;

  }

}



// =====================================
// CLEANUP
// =====================================

async function executeCleanup(){

  return true;

}



// =====================================
// SHUTDOWN PIPELINE
// =====================================

async function executeShutdownSequence(){

  if(
    LifecycleState
    .isShuttingDown()
  ){

    return false;

  }

  LifecycleState
  .update({

    shuttingDown:true,

    state:
    LIFECYCLE_STATES
    .SHUTTING_DOWN

  });

  try{

    const modulesStopped =
    await safeExecute(
      shutdownModules
    );

    if(
      !modulesStopped
    ){

      throw new Error(
        "MODULE SHUTDOWN FAILED"
      );

    }

    const runtimeStopped =
    await safeExecute(
      shutdownRuntime
    );

    if(
      !runtimeStopped
    ){

      throw new Error(
        "RUNTIME SHUTDOWN FAILED"
      );

    }

    await safeExecute(
      executeCleanup
    );

    LifecycleState
    .update({

      running:false,

      shuttingDown:false,

      state:
      LIFECYCLE_STATES
      .STOPPED,

      stoppedAt:
      getTimestamp()

    });

    return true;

  }

  catch(error){

    LifecycleState
    .update({

      shuttingDown:false,

      state:
      LIFECYCLE_STATES
      .FAILED,

      lastError:
      String(error)

    });

    return false;

  }

}



// =====================================
// PUBLIC API
// =====================================

const LifecycleShutdown =
Object.freeze({

  execute:
  executeShutdownSequence

});



// =====================================
// EXPORTS
// =====================================

export {

  shutdownModules,

  shutdownRuntime,

  executeCleanup,

  executeShutdownSequence,

  LifecycleShutdown

};

export default
LifecycleShutdown;
