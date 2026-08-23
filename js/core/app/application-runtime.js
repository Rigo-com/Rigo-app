// =====================================
// RIGO AI
// APPLICATION RUNTIME
// =====================================

import AppState from "./app-state.js";
import AppDOM from "./app-dom.js";
import AppRecovery from "./app-recovery.js";
import Config from "../config/index.js";
import Events from "../events/index.js";
import State from "../state/index.js";
import Lifecycle from "../lifecycle/index.js";
import Health from "../health/index.js";

const runtimeOperations = Object.seal({
  initialize:null,
  boot:null,
  shutdown:null,
  reset:null
});

async function initializeApplication(){
  if(AppState.state.initialized){
    return true;
  }
  if(runtimeOperations.initialize){
    return runtimeOperations.initialize;
  }

  const initialization = Promise.resolve().then(async () => {
    try{
      await AppDOM.waitForDOMReady();

      if(!await Config.initialize()){
        throw new Error("CONFIG INITIALIZATION FAILED");
      }
      if(!await Events.initialize()){
        throw new Error("EVENTS INITIALIZATION FAILED");
      }
      if(!await State.initialize()){
        throw new Error("STATE INITIALIZATION FAILED");
      }
      if(!await Lifecycle.initialize()){
        throw new Error("LIFECYCLE INITIALIZATION FAILED");
      }
      if(!await Health.initialize()){
        throw new Error("HEALTH INITIALIZATION FAILED");
      }

      AppState.setInitialized(true);
      AppState.setLastError(null);
      return true;
    }
    catch(error){
      AppState.setInitialized(false);
      AppState.setLastError(error?.message || String(error));
      return false;
    }
    finally{
      runtimeOperations.initialize = null;
    }
  });

  runtimeOperations.initialize = initialization;
  return initialization;
}

async function bootApplication(){
  if(AppState.state.booted && AppState.state.ready){
    return true;
  }
  if(runtimeOperations.boot){
    return runtimeOperations.boot;
  }
  if(runtimeOperations.shutdown){
    await runtimeOperations.shutdown;
  }

  AppState.setBooting(true);

  const boot = (async () => {
    try{
      if(!await initializeApplication()){
        throw new Error("APPLICATION INITIALIZATION FAILED");
      }
      if(!await Lifecycle.start()){
        throw new Error("APPLICATION LIFECYCLE START FAILED");
      }
      if(!await Health.start()){
        throw new Error("APPLICATION HEALTH START FAILED");
      }

      AppDOM.showApp();
      AppState.setBooted(true);
      AppState.setReady(true);
      AppState.setLastBootAt(Date.now());
      AppState.setLastError(null);
      return true;
    }
    catch(error){
      AppState.setBooted(false);
      AppState.setReady(false);
      AppState.setLastError(error?.message || String(error));
      await Health.stop();
      await Lifecycle.shutdown();
      await AppRecovery.recover(error);
      return false;
    }
    finally{
      AppState.setBooting(false);
      runtimeOperations.boot = null;
    }
  })();

  runtimeOperations.boot = boot;
  return boot;
}

async function shutdownApplication(){
  if(runtimeOperations.shutdown){
    return runtimeOperations.shutdown;
  }
  if(runtimeOperations.boot){
    await runtimeOperations.boot;
  }

  AppState.setShuttingDown(true);

  const shutdown = (async () => {
    try{
      AppDOM.hideApp();
      const healthStopped = await Health.stop();
      const lifecycleStopped = await Lifecycle.shutdown();
      const stateStopped = await State.shutdown();
      const eventsStopped = await Events.shutdown();
      const configStopped = await Config.shutdown();

      if(
        !healthStopped ||
        !lifecycleStopped ||
        !stateStopped ||
        !eventsStopped ||
        !configStopped
      ){
        throw new Error("APPLICATION SHUTDOWN FAILED");
      }

      AppState.setBooted(false);
      AppState.setReady(false);
      AppState.setInitialized(false);
      AppState.setLastShutdownAt(Date.now());
      return true;
    }
    catch(error){
      AppState.setLastError(error?.message || String(error));
      return false;
    }
    finally{
      AppState.setShuttingDown(false);
      runtimeOperations.shutdown = null;
    }
  })();

  runtimeOperations.shutdown = shutdown;
  return shutdown;
}

async function resetApplication(){
  if(runtimeOperations.reset){
    return runtimeOperations.reset;
  }

  const reset = (async () => {
    try{
      if(!await shutdownApplication()){
        return false;
      }

      await Health.reset();
      await Lifecycle.reset();
      await State.reset();
      await Events.reset();
      await Config.reset();
      AppRecovery.reset();
      AppState.reset();
      return true;
    }
    finally{
      runtimeOperations.reset = null;
    }
  })();

  runtimeOperations.reset = reset;
  return reset;
}

function createApplicationSnapshot(){
  return Object.freeze({
    app:AppState.snapshot(),
    operations:{
      initializing:Boolean(runtimeOperations.initialize),
      booting:Boolean(runtimeOperations.boot),
      shuttingDown:Boolean(runtimeOperations.shutdown),
      resetting:Boolean(runtimeOperations.reset)
    },
    config:Config.snapshot(),
    events:Events.snapshot(),
    state:State.snapshot(),
    dom:AppDOM.snapshot(),
    recovery:AppRecovery.snapshot(),
    lifecycle:Lifecycle.snapshot(),
    health:Health.snapshot(),
    timestamp:Date.now()
  });
}

const ApplicationRuntime = Object.freeze({
  initialize:initializeApplication,
  boot:bootApplication,
  shutdown:shutdownApplication,
  reset:resetApplication,
  snapshot:createApplicationSnapshot
});

export {
  initializeApplication,
  bootApplication,
  shutdownApplication,
  resetApplication,
  createApplicationSnapshot,
  ApplicationRuntime
};

export default ApplicationRuntime;
