// =====================================
// RIGO AI
// APPLICATION RUNTIME
// =====================================



// =====================================
// IMPORTS
// =====================================

import AppState
from "./app-state.js";

import AppDOM
from "./app-dom.js";

import AppRecovery
from "./app-recovery.js";



// =====================================
// INITIALIZE
// =====================================

async function initializeApplication(){

  try{

    await AppDOM
    .waitForDOMReady();

    AppState
    .setInitialized(
      true
    );

    return true;

  }

  catch(error){

    AppState
    .setLastError(
      error?.message ||
      String(error)
    );

    return false;

  }

}



// =====================================
// BOOT
// =====================================

async function bootApplication(){

  if(
    AppState
    .state
    .booted
  ){

    return true;

  }

  AppState
  .setBooting(
    true
  );

  try{

    const initialized =
    await initializeApplication();

    if(
      !initialized
    ){

      throw new Error(
        "APPLICATION INITIALIZATION FAILED"
      );

    }

    if(

      typeof Runtime !==
      "undefined" &&

      typeof Runtime
      .boot ===
      "function"

    ){

      await Runtime
      .boot();

    }

    if(

      typeof Modules !==
      "undefined" &&

      typeof Modules
      .boot ===
      "function"

    ){

      await Modules
      .boot();

    }

    AppDOM
    .showApp();

    AppState
    .setBooted(
      true
    );

    AppState
    .setLastBootAt(
      Date.now()
    );

    return true;

  }

  catch(error){

    AppState
    .setLastError(
      error?.message ||
      String(error)
    );

    await AppRecovery
    .recover(
      error
    );

    return false;

  }

  finally{

    AppState
    .setBooting(
      false
    );

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownApplication(){

  if(
    !AppState
    .state
    .booted
  ){

    return true;

  }

  AppState
  .setShuttingDown(
    true
  );

  try{

    AppDOM
    .hideApp();

    if(

      typeof Modules !==
      "undefined" &&

      typeof Modules
      .shutdown ===
      "function"

    ){

      await Modules
      .shutdown();

    }

    AppState
    .setBooted(
      false
    );

    AppState
    .setReady(
      false
    );

    AppState
    .setLastShutdownAt(
      Date.now()
    );

    return true;

  }

  catch(error){

    AppState
    .setLastError(
      error?.message ||
      String(error)
    );

    return false;

  }

  finally{

    AppState
    .setShuttingDown(
      false
    );

  }

}



// =====================================
// RESET
// =====================================

async function resetApplication(){

  await shutdownApplication();

  AppState
  .reset();

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createApplicationSnapshot(){

  return Object.freeze({

    app:
    AppState
    .snapshot(),

    dom:
    AppDOM
    .snapshot(),

    recovery:
    AppRecovery
    .snapshot(),

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const ApplicationRuntime =
Object.freeze({

  initialize:
  initializeApplication,

  boot:
  bootApplication,

  shutdown:
  shutdownApplication,

  reset:
  resetApplication,

  snapshot:
  createApplicationSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initializeApplication,

  bootApplication,

  shutdownApplication,

  resetApplication,

  createApplicationSnapshot,

  ApplicationRuntime

};

export default
ApplicationRuntime;
