// =====================================
// RIGO AI
// AI KERNEL DIAGNOSTICS
// =====================================

import { aiKernelState }
from "./kernel-state.js";

import { freezeKernelObject, cloneKernelObject }
from "./kernel-utils.js";

function createKernelSnapshot(){
  return {
    initialized:aiKernelState.initialized,
    initializing:aiKernelState.initializing,
    recovering:aiKernelState.recovering,
    shuttingDown:aiKernelState.shuttingDown,
    state:aiKernelState.state,
    activeRequests:aiKernelState.activeRequests.size,
    executions:aiKernelState.executionPromises.size,
    queuedRequests:aiKernelState.requestQueue.length,
    completedRequests:aiKernelState.completedRequests.length,
    failedRequests:aiKernelState.failedRequests.length,
    synchronizedSystems:[...aiKernelState.synchronizedSystems],
    failedSystems:[...aiKernelState.failedSystems],
    recoveryAttempts:aiKernelState.recoveryAttempts,
    lastRecoveryAt:aiKernelState.lastRecoveryAt,
    lastRequestAt:aiKernelState.lastRequestAt,
    startedAt:aiKernelState.startedAt,
    diagnostics:cloneKernelObject(aiKernelState.diagnostics)
  };
}

export function getAIKernelState(){
  return freezeKernelObject(createKernelSnapshot());
}

export function getAIKernelDiagnostics(){
  return freezeKernelObject({
    uptime:aiKernelState.startedAt ? Date.now() - aiKernelState.startedAt : 0,
    ...createKernelSnapshot()
  });
}
