// =====================================
// RIGO AI
// APP RECOVERY
// =====================================



// =====================================
// IMPORTS
// =====================================

import AppState
from "./app-state.js";



// =====================================
// HELPERS
// =====================================

function normalizeError(
  error
){

  if(
    typeof error ===
    "string"
  ){

    return error;

  }

  return String(
    error?.message ||
    error ||
    "UNKNOWN ERROR"
  );

}



// =====================================
// RECOVERY
// =====================================

async function recoverApplication(
  error = null
){

  AppState
  .setRecovering(
    true
  );

  try{

    AppState
    .setLastError(

      normalizeError(
        error
      )

    );

    if(

      typeof RuntimeManager !==
      "undefined" &&

      typeof RuntimeManager
      .recover ===
      "function"

    ){

      await RuntimeManager
      .recover();

    }

    if(

      typeof ModuleRuntime !==
      "undefined" &&

      typeof ModuleRuntime
      .recover ===
      "function"

    ){

      await ModuleRuntime
      .recover();

    }

    AppState
    .setLastRecoveryAt(
      Date.now()
    );

    return true;

  }

  catch(recoveryError){

    AppState
    .setLastError(

      normalizeError(
        recoveryError
      )

    );

    return false;

  }

  finally{

    AppState
    .setRecovering(
      false
    );

  }

}



// =====================================
// SAFE EXECUTOR
// =====================================

async function executeWithRecovery(
  operation
){

  try{

    return await operation();

  }

  catch(error){

    await recoverApplication(
      error
    );

    throw error;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createRecoverySnapshot(){

  const state =
  AppState
  .snapshot();

  return Object.freeze({

    recovering:
    state.recovering,

    lastRecoveryAt:
    state.lastRecoveryAt,

    lastError:
    state.lastError,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const AppRecovery =
Object.freeze({

  recover:
  recoverApplication,

  execute:
  executeWithRecovery,

  snapshot:
  createRecoverySnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  recoverApplication,

  executeWithRecovery,

  createRecoverySnapshot,

  AppRecovery

};

export default
AppRecovery;
