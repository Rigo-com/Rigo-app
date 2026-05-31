// =====================================
// RIGO AI
// TOOL LIFECYCLE
// ENTERPRISE TOOL RUNTIME LIFECYCLE
// =====================================

import {
  toolExecutorState
}
from "./tool-state.js";

import {
  processExecutionQueue
}
from "./tool-queue.js";

import {
  resetToolExecutor
}
from "./tool-reset.js"



// =====================================
// INITIALIZE
// =====================================

export async function
initializeToolExecutor(){

  if(
    toolExecutorState
    .initialized
  ){

    return true;

  }

  if(
    toolExecutorState
    .startupPromise
  ){

    return toolExecutorState
    .startupPromise;

  }

  toolExecutorState
  .startupPromise =

  (async() => {

    if(
      toolExecutorState
      .initializing
    ){

      return false;

    }

    toolExecutorState
    .initializing =
    true;

    try{

      toolExecutorState
      .initialized =
      true;

      toolExecutorState
      .shuttingDown =
      false;

      toolExecutorState
      .queueProcessorPromise =
      processExecutionQueue();

      if(
        typeof registerModule ===
        "function"
      ){

        await registerModule(

          "tool-executor",

          async () => true

        );

      }

      return true;

    }

    finally{

      toolExecutorState
      .initializing =
      false;

      toolExecutorState
      .startupPromise =
      null;

    }

  })();

  return toolExecutorState
  .startupPromise;

}



// =====================================
// SHUTDOWN
// =====================================

export async function
shutdownToolExecutor(){

  toolExecutorState
  .shuttingDown =
  true;

  await resetToolExecutor();

  toolExecutorState
  .initialized =
  false;

  return true;

}



// =====================================
// RESET
// =====================================

export async function
resetToolRuntime(){

  return resetToolExecutor();

}
