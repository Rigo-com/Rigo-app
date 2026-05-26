// =====================================
// RIGO AI
// APP LIFECYCLE
// ENTERPRISE FINAL
// =====================================



// =====================================
// IMMUTABLE
// =====================================

function freezeLifecycleObject(
  value,
  visited = new WeakSet()
){

  if(

    !value ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  if(

    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Map ||
    value instanceof Set ||

    (
      typeof HTMLElement !==
      "undefined" &&

      value instanceof HTMLElement
    )

  ){

    return value;

  }

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    if(

      nestedValue &&

      typeof nestedValue ===
      "object"

    ){

      freezeLifecycleObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// DEPENDENCIES
// =====================================

function getLifecycleDependency(
  dependencyName
){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return null;

    }

    return window[
      dependencyName
    ] || null;

  }

  catch(error){

    return null;

  }

}



// =====================================
// STATUS
// =====================================

function getLifecycleStatus(){

  return freezeLifecycleObject({

    initialized:

      Boolean(
        appState
        ?.initialized
      ),

    started:

      Boolean(
        appState
        ?.started
      ),

    starting:

      Boolean(
        appState
        ?.starting
      ),

    crashed:

      Boolean(
        appState
        ?.crashed
      ),

    crashCount:

      Number(
        appState
        ?.crashCount || 0
      ),

    phase:

      String(
        appState
        ?.phase || ""
      ),

    timestamp:
    Date.now()

  });

}



// =====================================
// SNAPSHOT
// =====================================

async function createLifecycleSnapshot(){

  const appDiagnostics =
  getLifecycleDependency(
    "AppDiagnostics"
  );

  const healthDiagnostics =
  getLifecycleDependency(
    "HealthDiagnostics"
  );

  const appStartup =
  getLifecycleDependency(
    "AppStartup"
  );

  const appShutdown =
  getLifecycleDependency(
    "AppShutdown"
  );

  return freezeLifecycleObject({

    timestamp:
    Date.now(),

    phase:

      String(
        appState
        ?.phase || ""
      ),

    initialized:

      Boolean(
        appState
        ?.initialized
      ),

    started:

      Boolean(
        appState
        ?.started
      ),

    crashed:

      Boolean(
        appState
        ?.crashed
      ),

    crashCount:

      Number(
        appState
        ?.crashCount || 0
      ),

    diagnostics:

      appDiagnostics
      ?.get

      ? await appDiagnostics
        .get()

      : null,

    health:

      healthDiagnostics
      ?.get

      ? await healthDiagnostics
        .get()

      : null,

    startup:

      appStartup
      ?.snapshot

      ? await appStartup
        .snapshot()

      : null,

    shutdown:

      appShutdown
      ?.snapshot

      ? await appShutdown
        .snapshot()

      : null

  });

}



// =====================================
// HEALTH
// =====================================

async function getLifecycleHealth(){

  const healthRuntime =
  getLifecycleDependency(
    "HealthRuntime"
  );

  if(
    !healthRuntime
    ?.run
  ){

    return null;

  }

  return await healthRuntime
  .run();

}



// =====================================
// RECOVERY
// =====================================

async function recoverApplication(){

  const runtimeManager =
  getLifecycleDependency(
    "RuntimeManager"
  );

  if(

    runtimeManager
    ?.recover

  ){

    return await runtimeManager
    .recover();

  }

  return false;

}



// =====================================
// START
// =====================================

async function lifecycleStart(){

  const appStartup =
  getLifecycleDependency(
    "AppStartup"
  );

  if(
    !appStartup
    ?.start
  ){

    return false;

  }

  return await appStartup
  .start();

}



// =====================================
// SHUTDOWN
// =====================================

async function lifecycleShutdown(){

  const appShutdown =
  getLifecycleDependency(
    "AppShutdown"
  );

  if(
    !appShutdown
    ?.shutdown
  ){

    return false;

  }

  return await appShutdown
  .shutdown();

}



// =====================================
// INITIALIZE
// =====================================

async function lifecycleInitialize(){

  const appBootstrap =
  getLifecycleDependency(
    "AppBootstrap"
  );

  if(
    !appBootstrap
    ?.initialize
  ){

    return false;

  }

  return await appBootstrap
  .initialize();

}



// =====================================
// CLEANUP
// =====================================

async function lifecycleCleanup(){

  const appShutdown =
  getLifecycleDependency(
    "AppShutdown"
  );

  if(
    !appShutdown
    ?.cleanup
  ){

    return false;

  }

  return await appShutdown
  .cleanup();

}



// =====================================
// SEND MESSAGE
// =====================================

async function lifecycleSendMessage(
  ...args
){

  const messageRuntime =
  getLifecycleDependency(
    "MessageRuntime"
  );

  if(
    !messageRuntime
    ?.send
  ){

    return false;

  }

  return await messageRuntime
  .send(
    ...args
  );

}



// =====================================
// DIAGNOSTICS
// =====================================

async function getLifecycleDiagnostics(){

  return await createLifecycleSnapshot();

}



// =====================================
// PUBLIC API
// =====================================

const AppLifecycle =
Object.freeze({



  // ===================================
  // CORE
  // ===================================

  start:
  lifecycleStart,

  shutdown:
  lifecycleShutdown,

  initialize:
  lifecycleInitialize,

  cleanup:
  lifecycleCleanup,



  // ===================================
  // DIAGNOSTICS
  // ===================================

  diagnostics:
  getLifecycleDiagnostics,

  snapshot:
  createLifecycleSnapshot,

  health:
  getLifecycleHealth,

  status:
  getLifecycleStatus,



  // ===================================
  // RUNTIME
  // ===================================

  recover:
  recoverApplication,



  // ===================================
  // COMMUNICATION
  // ===================================

  sendMessage:
  lifecycleSendMessage

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "AppLifecycle",

    {

      value:
      AppLifecycle,

      writable:
      false,

      configurable:
      false

    }

  );

}
