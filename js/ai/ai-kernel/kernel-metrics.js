// =====================================
// RIGO AI
// AI KERNEL METRICS
// =====================================

import { AI_KERNEL_CONFIG }
from "./kernel-config.js";

import { aiKernelState }
from "./kernel-state.js";

export function incrementKernelMetric(metric, amount = 1){
  if(!AI_KERNEL_CONFIG.ENABLE_DIAGNOSTICS){
    return false;
  }

  if(!Object.prototype.hasOwnProperty.call(aiKernelState.diagnostics, metric)){
    return false;
  }

  aiKernelState.diagnostics[metric] += amount;
  return true;
}

export function resetKernelMetrics(){
  for(const metric of Object.keys(aiKernelState.diagnostics)){
    aiKernelState.diagnostics[metric] = 0;
  }

  return true;
}
