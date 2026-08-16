// =====================================
// RIGO AI
// APP RECOVERY
// =====================================

import AppState from "./app-state.js";
import RuntimeManager from "../runtime/runtime-manager.js";
import ModuleRuntime from "../modules/module-runtime.js";

const recoveryState = Object.seal({
  promise:null,
  attempts:0,
  maxAttempts:3
});

function normalizeError(error){
  return String(error?.message || error || "UNKNOWN ERROR");
}

async function recoverApplication(error = null){
  if(recoveryState.promise){
    return recoveryState.promise;
  }

  if(recoveryState.attempts >= recoveryState.maxAttempts){
    return false;
  }

  AppState.setRecovering(true);
  AppState.setLastError(normalizeError(error));
  recoveryState.attempts++;

  const recovery = (async () => {
    try{
      const runtimeReset = await RuntimeManager.reset();
      const modulesReset = await ModuleRuntime.reset();

      if(!runtimeReset || !modulesReset){
        return false;
      }

      const recovered = await RuntimeManager.boot();
      if(!recovered){
        return false;
      }

      AppState.setLastRecoveryAt(Date.now());
      recoveryState.attempts = 0;
      return true;
    }
    catch(recoveryError){
      AppState.setLastError(normalizeError(recoveryError));
      return false;
    }
    finally{
      AppState.setRecovering(false);
      recoveryState.promise = null;
    }
  })();

  recoveryState.promise = recovery;
  return recovery;
}

async function executeWithRecovery(operation){
  try{
    return await operation();
  }
  catch(error){
    await recoverApplication(error);
    throw error;
  }
}

function resetApplicationRecovery(){
  recoveryState.promise = null;
  recoveryState.attempts = 0;
  return true;
}

function createRecoverySnapshot(){
  const state = AppState.snapshot();
  return Object.freeze({
    recovering:state.recovering,
    recoveryAttempts:recoveryState.attempts,
    maxRecoveryAttempts:recoveryState.maxAttempts,
    lastRecoveryAt:state.lastRecoveryAt,
    lastError:state.lastError,
    timestamp:Date.now()
  });
}

const AppRecovery = Object.freeze({
  recover:recoverApplication,
  execute:executeWithRecovery,
  reset:resetApplicationRecovery,
  snapshot:createRecoverySnapshot
});

export {
  recoverApplication,
  executeWithRecovery,
  resetApplicationRecovery,
  createRecoverySnapshot,
  AppRecovery
};

export default AppRecovery;
