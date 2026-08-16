// =====================================
// RIGO AI
// AI KERNEL RECOVERY
// =====================================

import { AI_KERNEL_CONFIG }
from "./kernel-config.js";

import { AI_KERNEL_STATES, AI_KERNEL_EVENTS }
from "./kernel-constants.js";

import { aiKernelState }
from "./kernel-state.js";

import { emitKernelEvent, logKernelError }
from "./kernel-events.js";

import { synchronizeAISystems }
from "./kernel-services.js";

import { setKernelState }
from "./kernel-request.js";

import { incrementKernelMetric }
from "./kernel-metrics.js";



export function shouldRecoverKernel(error){
  if(!AI_KERNEL_CONFIG.ENABLE_RECOVERY || aiKernelState.shuttingDown){
    return false;
  }

  const message = String(error || "");
  return [
    "NO AVAILABLE REQUEST ROUTER",
    "AI SYSTEM SYNCHRONIZATION FAILED",
    "SYSTEM INITIALIZATION TIMEOUT"
  ].some((entry) => message.includes(entry));
}



export async function recoverAIKernel(){
  if(aiKernelState.recovering){
    return aiKernelState.recoveryPromise;
  }

  if(!AI_KERNEL_CONFIG.ENABLE_RECOVERY || aiKernelState.shuttingDown){
    return false;
  }

  if(aiKernelState.recoveryAttempts >= AI_KERNEL_CONFIG.MAX_RECOVERY_ATTEMPTS){
    return false;
  }

  const elapsed = Date.now() - (aiKernelState.lastRecoveryAt || 0);
  if(aiKernelState.lastRecoveryAt && elapsed < AI_KERNEL_CONFIG.RECOVERY_COOLDOWN){
    return false;
  }

  aiKernelState.recovering = true;

  const recovery = (async () => {
    try{
      setKernelState(AI_KERNEL_STATES.RECOVERING);
      incrementKernelMetric("recoveries");
      aiKernelState.recoveryAttempts++;
      aiKernelState.lastRecoveryAt = Date.now();
      await emitKernelEvent(AI_KERNEL_EVENTS.RECOVERY_STARTED);

      if(!await synchronizeAISystems()){
        throw new Error("AI SYSTEM SYNCHRONIZATION FAILED");
      }

      if(aiKernelState.shuttingDown){
        return false;
      }

      setKernelState(
        aiKernelState.activeRequests.size > 0
          ? AI_KERNEL_STATES.PROCESSING
          : AI_KERNEL_STATES.READY
      );
      await emitKernelEvent(AI_KERNEL_EVENTS.RECOVERY_COMPLETED);
      return true;
    }
    catch(error){
      if(!aiKernelState.shuttingDown){
        setKernelState(AI_KERNEL_STATES.FAILED);
      }
      await logKernelError("KERNEL RECOVERY FAILED", {error:String(error)});
      return false;
    }
    finally{
      aiKernelState.recovering = false;
      aiKernelState.recoveryPromise = null;
    }
  })();

  aiKernelState.recoveryPromise = recovery;
  return recovery;
}
