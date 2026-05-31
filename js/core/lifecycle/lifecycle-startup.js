// =====================================
// RIGO AI
// LIFECYCLE STARTUP
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
// STARTUP STEPS
// =====================================

async function initializeRuntime(){

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
    .initialize();

  }

  catch{

    return false;

  }

}



async function bootRuntime(){

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
    .boot();

  }

  catch{

    return false;

  }

}



async function initializeModules(){

  try{

    const modulesModule =
    await import(
      "../modules/index.js"
    );

    const modules =

      modulesModule.default ||
      modulesModule.RIGOModulesRuntime;

    if(
      !modules
    ){

      return false;

    }

    return await modules
    .initialize();

  }

  catch{

    return false;

  }

}



async function bootModules(){

  try{

    const modulesModule =
    await import(
      "../modules/index.js"
    );

    const modules =

      modulesModule.default ||
      modulesModule.RIGOModulesRuntime;

    if(
      !modules
    ){

      return false;

    }

    return await modules
    .boot();

  }

  catch{

    return false;

  }

}



// =====================================
// STARTUP PIPELINE
// =====================================

async function executeStartupSequence(){

  if(
    LifecycleState
    .isRunning()
  ){

    return true;

  }

  LifecycleState
  .update({

    state:
    LIFECYCLE_STATES
    .STARTING

  });

  try{

    const runtimeInitialized =
    await safeExecute(
      initializeRuntime
    );

    if(
      !runtimeInitialized
    ){

      throw new Error(
        "RUNTIME INITIALIZATION FAILED"
      );

    }

    const runtimeBooted =
    await safeExecute(
      bootRuntime
    );

    if(
      !runtimeBooted
    ){

      throw new Error(
        "RUNTIME BOOT FAILED"
      );

    }

    const modulesInitialized =
    await safeExecute(
      initializeModules
    );

    if(
      !modulesInitialized
    ){

      throw new Error(
        "MODULES INITIALIZATION FAILED"
      );

    }

    const modulesBooted =
    await safeExecute(
      bootModules
    );

    if(
      !modulesBooted
    ){

      throw new Error(
        "MODULES BOOT FAILED"
      );

    }

    LifecycleState
    .update({

      initialized:true,

      running:true,

      state:
      LIFECYCLE_STATES
      .RUNNING,

      startedAt:
      getTimestamp(),

      lastError:null

    });

    return true;

  }

  catch(error){

    LifecycleState
    .update({

      running:false,

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

const LifecycleStartup =
Object.freeze({

  execute:
  executeStartupSequence

});



// =====================================
// EXPORTS
// =====================================

export {

  initializeRuntime,

  bootRuntime,

  initializeModules,

  bootModules,

  executeStartupSequence,

  LifecycleStartup

};

export default
LifecycleStartup;
