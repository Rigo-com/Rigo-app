// =====================================
// RIGO AI
// AI KERNEL LIFECYCLE
// =====================================

import {
  AI_KERNEL_STATES,
  AI_KERNEL_EVENTS
}
from "./kernel-constants.js";

import {
  aiKernelState
}
from "./kernel-state.js";

import {
  setKernelState
}
from "./kernel-request.js";

import {
  validateAISystems,
  synchronizeAISystems
}
from "./kernel-services.js";

import {
  emitKernelEvent,
  logKernelError
}
from "./kernel-events.js";

import {
  startKernelCleanupLoop,
  stopKernelCleanupLoop
}
from "./kernel-cleanup.js";

import {
  startKernelHealthLoop,
  stopKernelHealthLoop
}
from "./kernel-health.js";



// =====================================
// INITIALIZE
// =====================================

export async function
initializeAIKernel(){

  if(
    aiKernelState
    .initialized
  ){

    return true;

  }

  if(
    aiKernelState
    .initializing
  ){

    return aiKernelState
    .startupPromise;

  }

  aiKernelState
  .initializing =
  true;

  aiKernelState
  .startupPromise =

  (async () => {

    try{

      setKernelState(

        AI_KERNEL_STATES
        .INITIALIZING

      );

      if(
        !validateAISystems()
      ){

        throw new Error(
          "INVALID AI SYSTEMS"
        );

      }

      const synchronized =
      await synchronizeAISystems();

      if(
        !synchronized
      ){

        throw new Error(
          "AI SYSTEM SYNCHRONIZATION FAILED"
        );

      }

      startKernelCleanupLoop();

      startKernelHealthLoop();

      aiKernelState
      .initialized =
      true;

      aiKernelState
      .startedAt =
      Date.now();

      aiKernelState
      .diagnostics
      .initialized++;

      setKernelState(

        AI_KERNEL_STATES
        .READY

      );

      await emitKernelEvent(

        AI_KERNEL_EVENTS
        .INITIALIZED

      );

      return true;

    }

    catch(error){

      setKernelState(

        AI_KERNEL_STATES
        .FAILED

      );

      await logKernelError(

        "AI KERNEL INITIALIZATION FAILED",

        {
          error:
          String(error)
        }

      );

      throw error;

    }

    finally{

      aiKernelState
      .initializing =
      false;

      aiKernelState
      .startupPromise =
      null;

    }

  })();

  return aiKernelState
  .startupPromise;

}



// =====================================
// SHUTDOWN
// =====================================

export async function
shutdownAIKernel(){

  aiKernelState
  .shuttingDown =
  true;

  setKernelState(

    AI_KERNEL_STATES
    .SHUTDOWN

  );

  stopKernelCleanupLoop();

  stopKernelHealthLoop();

  for(
    const [,request]
    of
    aiKernelState
    .activeRequests
  ){

    request.runtime
    .controller
    ?.abort();

  }

  aiKernelState
  .activeRequests
  .clear();

  aiKernelState
  .requestQueue =
  [];

  await emitKernelEvent(

    AI_KERNEL_EVENTS
    .SHUTDOWN

  );

  return true;

}



// =====================================
// DESTROY
// =====================================

export async function
destroyAIKernel(){

  await shutdownAIKernel();

  aiKernelState
  .initialized =
  false;

  aiKernelState
  .initializing =
  false;

  aiKernelState
  .recovering =
  false;

  aiKernelState
  .shuttingDown =
  false;

  aiKernelState
  .startupPromise =
  null;

  aiKernelState
  .recoveryPromise =
  null;

  aiKernelState
  .state =
  AI_KERNEL_STATES
  .IDLE;

  aiKernelState
  .completedRequests =
  [];

  aiKernelState
  .failedRequests =
  [];

  aiKernelState
  .synchronizedSystems
  .clear();

  aiKernelState
  .failedSystems
  .clear();

  aiKernelState
  .recoveryAttempts =
  0;

  aiKernelState
  .lastRecoveryAt =
  null;

  aiKernelState
  .lastRequestAt =
  null;

  aiKernelState
  .startedAt =
  null;

  return true;

}
