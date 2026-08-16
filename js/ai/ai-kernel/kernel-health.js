// =====================================
// RIGO AI
// AI KERNEL HEALTH
// =====================================

import {
  AI_KERNEL_CONFIG
}
from "./kernel-config.js";

import {
  AI_KERNEL_EVENTS
}
from "./kernel-constants.js";

import {
  aiKernelState
}
from "./kernel-state.js";

import {
  emitKernelEvent
}
from "./kernel-events.js";



// =====================================
// HEALTH CHECK
// =====================================

export async function
performKernelHealthCheck(){

  const report = {

    timestamp:
    Date.now(),

    activeRequests:

      aiKernelState
      .activeRequests
      .size,

    queuedRequests:

      aiKernelState
      .requestQueue
      .length,

    failedSystems:[

      ...aiKernelState
      .failedSystems

    ],

    synchronizedSystems:[

      ...aiKernelState
      .synchronizedSystems

    ]

  };

  await emitKernelEvent(

    AI_KERNEL_EVENTS
    .HEALTH_CHECK,

    report

  );

  return report;

}



// =====================================
// START LOOP
// =====================================

export function
startKernelHealthLoop(){

  if(
    !AI_KERNEL_CONFIG
    .ENABLE_HEALTH_MONITORING
  ){
    return false;
  }

  if(
    aiKernelState
    .healthInterval
  ){

    return false;

  }

  aiKernelState
  .healthInterval =
  setInterval(() => {

    performKernelHealthCheck()
    .catch(() => {});

  },

  AI_KERNEL_CONFIG
  .HEALTH_CHECK_INTERVAL);

  return true;

}



// =====================================
// STOP LOOP
// =====================================

export function
stopKernelHealthLoop(){

  if(
    !aiKernelState
    .healthInterval
  ){

    return false;

  }

  clearInterval(

    aiKernelState
    .healthInterval

  );

  aiKernelState
  .healthInterval =
  null;

  return true;

}
