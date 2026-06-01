// =====================================
// RIGO AI
// AI KERNEL
// PUBLIC EXPORTS
// =====================================

import {

  initializeAIKernel,
  shutdownAIKernel,
  destroyAIKernel

}
from "./kernel-lifecycle.js";

import {

  processKernelRequest

}
from "./kernel-router.js";

import {

  recoverAIKernel

}
from "./kernel-recovery.js";

import {

  getAIKernelDiagnostics,
  getAIKernelState

}
from "./kernel-diagnostics.js";

import {

  AI_KERNEL_CONFIG

}
from "./kernel-config.js";

import {

  AI_KERNEL_STATES,
  AI_KERNEL_EVENTS

}
from "./kernel-constants.js";



// =====================================
// AI KERNEL API
// =====================================

export const AIKernel =
Object.freeze({

  config:
  AI_KERNEL_CONFIG,

  states:
  AI_KERNEL_STATES,

  events:
  AI_KERNEL_EVENTS,

  initialize:
  initializeAIKernel,

  shutdown:
  shutdownAIKernel,

  destroy:
  destroyAIKernel,

  process:
  processKernelRequest,

  recover:
  recoverAIKernel,

  diagnostics:
  getAIKernelDiagnostics,

  state:
  getAIKernelState

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.AIKernel =
  AIKernel;

}

if(
  typeof globalThis !==
  "undefined"
){

  globalThis.AIKernel =
  AIKernel;

}



export default
AIKernel;
