// =====================================
// RIGO AI
// AI KERNEL LIFECYCLE
// =====================================

import { AI_KERNEL_STATES, AI_KERNEL_EVENTS }
from "./kernel-constants.js";

import { aiKernelState }
from "./kernel-state.js";

import { setKernelState }
from "./kernel-request.js";

import { validateAISystems, synchronizeAISystems }
from "./kernel-services.js";

import { emitKernelEvent, logKernelError }
from "./kernel-events.js";

import { startKernelCleanupLoop, stopKernelCleanupLoop }
from "./kernel-cleanup.js";

import { startKernelHealthLoop, stopKernelHealthLoop }
from "./kernel-health.js";

import { incrementKernelMetric, resetKernelMetrics }
from "./kernel-metrics.js";



export async function initializeAIKernel(){
  if(aiKernelState.initialized && !aiKernelState.shuttingDown){
    return true;
  }

  if(aiKernelState.initializing){
    return aiKernelState.startupPromise;
  }

  aiKernelState.initializing = true;
  aiKernelState.shuttingDown = false;

  const startup = (async () => {
    try{
      setKernelState(AI_KERNEL_STATES.INITIALIZING);

      if(!await validateAISystems()){
        throw new Error("INVALID AI SYSTEMS");
      }

      if(!await synchronizeAISystems()){
        throw new Error("AI SYSTEM SYNCHRONIZATION FAILED");
      }

      startKernelCleanupLoop();
      startKernelHealthLoop();
      aiKernelState.initialized = true;
      aiKernelState.startedAt = Date.now();
      aiKernelState.recoveryAttempts = 0;
      incrementKernelMetric("initialized");
      setKernelState(AI_KERNEL_STATES.READY);
      await emitKernelEvent(AI_KERNEL_EVENTS.INITIALIZED);
      return true;
    }
    catch(error){
      aiKernelState.initialized = false;
      setKernelState(AI_KERNEL_STATES.FAILED);
      await logKernelError("AI KERNEL INITIALIZATION FAILED", {error:String(error)});
      throw error;
    }
    finally{
      aiKernelState.initializing = false;
      aiKernelState.startupPromise = null;
    }
  })();

  aiKernelState.startupPromise = startup;
  return startup;
}



export async function shutdownAIKernel(){
  if(aiKernelState.shutdownPromise){
    return aiKernelState.shutdownPromise;
  }

  const shutdown = (async () => {
    aiKernelState.shuttingDown = true;
    setKernelState(AI_KERNEL_STATES.SHUTDOWN);
    stopKernelCleanupLoop();
    stopKernelHealthLoop();

    const shutdownError = new Error("KERNEL SHUTDOWN ACTIVE");
    for(const entry of aiKernelState.requestQueue.splice(0)){
      entry.reject(shutdownError);
    }

    for(const request of aiKernelState.activeRequests.values()){
      request.runtime.controller?.abort();
    }

    await Promise.allSettled([
      ...aiKernelState.executionPromises.values()
    ]);

    aiKernelState.activeRequests.clear();
    aiKernelState.executionPromises.clear();
    aiKernelState.queueProcessing = false;
    aiKernelState.initialized = false;
    await emitKernelEvent(AI_KERNEL_EVENTS.SHUTDOWN);
    return true;
  })();

  aiKernelState.shutdownPromise = shutdown;

  try{
    return await shutdown;
  }
  finally{
    aiKernelState.shutdownPromise = null;
  }
}



export async function destroyAIKernel(){
  await shutdownAIKernel();

  aiKernelState.initialized = false;
  aiKernelState.initializing = false;
  aiKernelState.recovering = false;
  aiKernelState.shuttingDown = false;
  aiKernelState.startupPromise = null;
  aiKernelState.recoveryPromise = null;
  aiKernelState.state = AI_KERNEL_STATES.IDLE;
  aiKernelState.completedRequests = [];
  aiKernelState.failedRequests = [];
  aiKernelState.synchronizedSystems.clear();
  aiKernelState.failedSystems.clear();
  aiKernelState.recoveryAttempts = 0;
  aiKernelState.lastRecoveryAt = null;
  aiKernelState.lastRequestAt = null;
  aiKernelState.startedAt = null;
  resetKernelMetrics();
  return true;
}
