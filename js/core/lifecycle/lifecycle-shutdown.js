// =====================================
// RIGO AI
// LIFECYCLE SHUTDOWN
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


async function shutdownRuntime(){

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
    .shutdown();
  }
  catch{
    return false;
  }
}


async function executeCleanup(){
  return true;
}


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
    LIFECYCLE_STATES.SHUTTING_DOWN
  });

  try{
    const runtimeStopped =
    await shutdownRuntime();

    if(!runtimeStopped){
      throw new Error(
        "RUNTIME SHUTDOWN FAILED"
      );
    }

    await executeCleanup();

    LifecycleState
    .update({
      running:false,
      shuttingDown:false,
      state:
      LIFECYCLE_STATES.STOPPED,
      stoppedAt:
      getTimestamp(),
      lastError:null
    });

    return true;
  }
  catch(error){
    LifecycleState
    .update({
      shuttingDown:false,
      state:
      LIFECYCLE_STATES.FAILED,
      lastError:
      String(error)
    });

    return false;
  }
}


const LifecycleShutdown =
Object.freeze({
  execute:
  executeShutdownSequence
});


export {
  shutdownRuntime,
  executeCleanup,
  executeShutdownSequence,
  LifecycleShutdown
};

export default
LifecycleShutdown;
