// =====================================
// RIGO AI
// AI KERNEL RECOVERY
// =====================================

import {
  AI_KERNEL_CONFIG
}
from "./kernel-config.js";

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
  emitKernelEvent,
  logKernelError
}
from "./kernel-events.js";

import {
  synchronizeAISystems
}
from "./kernel-services.js";

import {
  setKernelState
}
from "./kernel-request.js";



// =====================================
// SHOULD RECOVER
// =====================================

export function
shouldRecoverKernel(
  error
){

  const message =
  String(
    error || ""
  );

  const recoverableErrors = [

    "NO AVAILABLE REQUEST ROUTER",

    "AI SYSTEM SYNCHRONIZATION FAILED",

    "SYSTEM INITIALIZATION TIMEOUT"

  ];

  return recoverableErrors
  .some((entry) => {

    return message.includes(
      entry
    );

  });

}



// =====================================
// RECOVER KERNEL
// =====================================

export async function
recoverAIKernel(){

  if(
    aiKernelState
    .recovering
  ){

    return aiKernelState
    .recoveryPromise;

  }

  aiKernelState
  .recovering =
  true;

  aiKernelState
  .recoveryPromise =

  (async () => {

    try{

      setKernelState(

        AI_KERNEL_STATES
        .RECOVERING

      );

      aiKernelState
      .diagnostics
      .recoveries++;

      aiKernelState
      .recoveryAttempts++;

      aiKernelState
      .lastRecoveryAt =
      Date.now();

      await emitKernelEvent(

        AI_KERNEL_EVENTS
        .RECOVERY_STARTED

      );

      await synchronizeAISystems();

      setKernelState(

        AI_KERNEL_STATES
        .READY

      );

      await emitKernelEvent(

        AI_KERNEL_EVENTS
        .RECOVERY_COMPLETED

      );

      return true;

    }

    catch(error){

      setKernelState(

        AI_KERNEL_STATES
        .FAILED

      );

      await logKernelError(

        "KERNEL RECOVERY FAILED",

        {
          error:
          String(error)
        }

      );

      return false;

    }

    finally{

      aiKernelState
      .recovering =
      false;

      aiKernelState
      .recoveryPromise =
      null;

    }

  })();

  return aiKernelState
  .recoveryPromise;

}
