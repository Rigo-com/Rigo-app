// =====================================
// RIGO AI
// AI KERNEL HEALTH
// =====================================

import { AI_KERNEL_CONFIG }
from "./kernel-config.js";

import { AI_KERNEL_STATES, AI_KERNEL_EVENTS }
from "./kernel-constants.js";

import { aiKernelState }
from "./kernel-state.js";

import { emitKernelEvent }
from "./kernel-events.js";



export async function performKernelHealthCheck(){
  const withinLimits =
    aiKernelState.activeRequests.size <= AI_KERNEL_CONFIG.MAX_CONCURRENT_REQUESTS &&
    aiKernelState.requestQueue.length <= AI_KERNEL_CONFIG.MAX_QUEUE_SIZE;

  const report = {
    timestamp:Date.now(),
    healthy:Boolean(
      aiKernelState.initialized &&
      !aiKernelState.initializing &&
      !aiKernelState.recovering &&
      !aiKernelState.shuttingDown &&
      aiKernelState.state !== AI_KERNEL_STATES.FAILED &&
      aiKernelState.failedSystems.size <= 0 &&
      withinLimits
    ),
    initialized:aiKernelState.initialized,
    initializing:aiKernelState.initializing,
    recovering:aiKernelState.recovering,
    shuttingDown:aiKernelState.shuttingDown,
    state:aiKernelState.state,
    activeRequests:aiKernelState.activeRequests.size,
    executions:aiKernelState.executionPromises.size,
    queuedRequests:aiKernelState.requestQueue.length,
    failedSystems:[...aiKernelState.failedSystems],
    synchronizedSystems:[...aiKernelState.synchronizedSystems]
  };

  if(AI_KERNEL_CONFIG.ENABLE_HEALTH_MONITORING){
    await emitKernelEvent(AI_KERNEL_EVENTS.HEALTH_CHECK, report);
  }

  return report;
}



export function startKernelHealthLoop(){
  if(!AI_KERNEL_CONFIG.ENABLE_HEALTH_MONITORING || aiKernelState.healthInterval){
    return false;
  }

  aiKernelState.healthInterval = setInterval(() => {
    performKernelHealthCheck().catch(() => {});
  }, AI_KERNEL_CONFIG.HEALTH_CHECK_INTERVAL);
  return true;
}



export function stopKernelHealthLoop(){
  if(!aiKernelState.healthInterval){
    return false;
  }

  clearInterval(aiKernelState.healthInterval);
  aiKernelState.healthInterval = null;
  return true;
}
