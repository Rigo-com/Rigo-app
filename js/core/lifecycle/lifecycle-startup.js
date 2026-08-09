// =====================================
// RIGO AI
// LIFECYCLE STARTUP
// =====================================

import {
  LIFECYCLE_STATES
}
from "./lifecycle-config.js";

import LifecycleState
from "./lifecycle-state.js";


function getTimestamp(){
  return Date.now();
}


async function initializeRuntime(){

  try{
    const runtimeModule =
    await import(
      "../runtime/index.js"
    );

    const runtime =
    runtimeModule.default ||
    runtimeModule.Runtime;

    if(!runtime){
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

    if(!runtime){
      return false;
    }

    return await runtime
    .boot();
  }
  catch{
    return false;
  }
}


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
    LIFECYCLE_STATES.STARTING
  });

  try{
    const runtimeInitialized =
    await initializeRuntime();

    if(!runtimeInitialized){
      throw new Error(
        "RUNTIME INITIALIZATION FAILED"
      );
    }

    const runtimeBooted =
    await bootRuntime();

    if(!runtimeBooted){
      throw new Error(
        "RUNTIME BOOT FAILED"
      );
    }

    LifecycleState
    .update({
      initialized:true,
      running:true,
      state:
      LIFECYCLE_STATES.RUNNING,
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
      LIFECYCLE_STATES.FAILED,
      lastError:
      String(error)
    });

    return false;
  }
}


const LifecycleStartup =
Object.freeze({
  execute:
  executeStartupSequence
});


export {
  initializeRuntime,
  bootRuntime,
  executeStartupSequence,
  LifecycleStartup
};

export default
LifecycleStartup;
