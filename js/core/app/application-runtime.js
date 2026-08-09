// =====================================
// RIGO AI
// APPLICATION RUNTIME
// =====================================

import AppState
from "./app-state.js";

import AppDOM
from "./app-dom.js";

import AppRecovery
from "./app-recovery.js";

import Lifecycle
from "../lifecycle/index.js";

import Health
from "../health/index.js";


async function initializeApplication(){

  try{
    await AppDOM
    .waitForDOMReady();

    await Lifecycle
    .initialize();

    await Health
    .initialize();

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

    if(!initialized){
      throw new Error(
        "APPLICATION INITIALIZATION FAILED"
      );
    }

    const lifecycleStarted =
    await Lifecycle
    .start();

    if(!lifecycleStarted){
      throw new Error(
        "APPLICATION LIFECYCLE START FAILED"
      );
    }

    await Health
    .start();

    AppDOM
    .showApp();

    AppState
    .setBooted(
      true
    );

    AppState
    .setReady(
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

    await Health
    .stop();

    const lifecycleStopped =
    await Lifecycle
    .shutdown();

    if(!lifecycleStopped){
      throw new Error(
        "APPLICATION LIFECYCLE SHUTDOWN FAILED"
      );
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


async function resetApplication(){

  await shutdownApplication();

  await Health
  .reset();

  await Lifecycle
  .reset();

  AppState
  .reset();

  return true;
}


function createApplicationSnapshot(){

  return Object.freeze({
    app:
    AppState.snapshot(),

    dom:
    AppDOM.snapshot(),

    recovery:
    AppRecovery.snapshot(),

    lifecycle:
    Lifecycle.snapshot(),

    health:
    Health.snapshot(),

    timestamp:
    Date.now()
  });
}


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
