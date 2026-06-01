// =====================================
// RIGO AI
// AI KERNEL CLEANUP
// =====================================

import {
  AI_KERNEL_CONFIG
}
from "./kernel-config.js";

import {
  aiKernelState
}
from "./kernel-state.js";



// =====================================
// CLEANUP REQUESTS
// =====================================

export function
cleanupKernelRequests(){

  try{

    while(

      aiKernelState
      .completedRequests
      .length >

      AI_KERNEL_CONFIG
      .MAX_COMPLETED_REQUESTS

    ){

      aiKernelState
      .completedRequests
      .shift();

    }

    while(

      aiKernelState
      .failedRequests
      .length >

      AI_KERNEL_CONFIG
      .MAX_FAILED_REQUESTS

    ){

      aiKernelState
      .failedRequests
      .shift();

    }

    const now =
    Date.now();

    for(
      const [id, request]
      of
      aiKernelState
      .activeRequests
    ){

      if(

        now -

        request.runtime.startedAt >

        AI_KERNEL_CONFIG
        .STUCK_REQUEST_TIMEOUT

      ){

        request.runtime
        .controller
        ?.abort();

        aiKernelState
        .activeRequests
        .delete(id);

      }

    }

  }

  catch(error){}

}



// =====================================
// START LOOP
// =====================================

export function
startKernelCleanupLoop(){

  if(
    aiKernelState
    .cleanupInterval
  ){

    return;

  }

  aiKernelState
  .cleanupInterval =
  setInterval(() => {

    cleanupKernelRequests();

  },

  AI_KERNEL_CONFIG
  .CLEANUP_INTERVAL);

}



// =====================================
// STOP LOOP
// =====================================

export function
stopKernelCleanupLoop(){

  if(
    !aiKernelState
    .cleanupInterval
  ){

    return;

  }

  clearInterval(

    aiKernelState
    .cleanupInterval

  );

  aiKernelState
  .cleanupInterval =
  null;

}
