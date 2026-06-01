// =====================================
// RIGO AI
// AI KERNEL STATE
// =====================================

import {
  AI_KERNEL_STATES
}
from "./kernel-constants.js";



export const aiKernelState =
Object.seal({

  initialized:false,

  initializing:false,

  recovering:false,

  shuttingDown:false,

  startupPromise:null,

  recoveryPromise:null,

  cleanupInterval:null,

  healthInterval:null,

  state:
  AI_KERNEL_STATES
  .IDLE,

  activeRequests:
  new Map(),

  requestQueue:[],

  completedRequests:[],

  failedRequests:[],

  synchronizedSystems:
  new Set(),

  failedSystems:
  new Set(),

  diagnostics:
  Object.seal({

    initialized:0,

    requests:0,

    completed:0,

    failed:0,

    recoveries:0,

    queued:0,

    aborted:0,

    routedToPlanner:0,

    routedToWorkflow:0,

    routedToTools:0,

    routedToAgents:0

  }),

  recoveryAttempts:0,

  lastRecoveryAt:null,

  lastRequestAt:null,

  startedAt:null

});
