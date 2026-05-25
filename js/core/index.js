// =====================================
// RIGO AI
// CORE INDEX
// ENTERPRISE MASTER ORCHESTRATOR
// =====================================



// =====================================
// INTERNAL STATE
// =====================================

const coreRuntimeState =
Object.seal({

  initialized:
  false,

  booting:
  false,

  booted:
  false,

  shuttingDown:
  false,

  recovering:
  false,

  startupStartedAt:
  null,

  startupCompletedAt:
  null,

  lastHealthcheckAt:
  null,

  lastError:
  null,

  diagnostics:{

    boots:
    0,

    shutdowns:
    0,

    recoveries:
    0,

    healthchecks:
    0,

    runtimeErrors:
    0

  }

});



// =====================================
// HELPERS
// =====================================

function getCoreDependency(
  dependencyName
){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return null;

    }

    const dependency =
      window[dependencyName];

    if(
      typeof dependency ===
      "undefined"
    ){

      console.warn(
        `[RIGOCore] Missing dependency: ${dependencyName}`
      );

      return null;

    }

    return dependency;

  }

  catch(error){

    console.warn(
      `[RIGOCore] Failed resolving dependency: ${dependencyName}`,
      error
    );

    return null;

  }

}



function isFunction(value){

  return typeof value ===
  "function";

}



function safeFreeze(
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
    value instanceof HTMLElement

  ){

    return value;

  }

  visited.add(value);

  Object.freeze(value);

  Object.values(value).forEach((nestedValue) => {

    if(
      nestedValue &&
      typeof nestedValue ===
      "object"
    ){

      safeFreeze(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



async function safelyExecuteCoreOperation(
  label,
  operation,
  fallback = null
){

  try{

    if(
      !isFunction(operation)
    ){

      return fallback;

    }

    return await operation();

  }

  catch(error){

    coreRuntimeState
    .lastError =
    error;

    coreRuntimeState
    .diagnostics
    .runtimeErrors++;

    console.error(
      `[RIGOCore] ${label} failed`,
      error
    );

    return fallback;

  }

}



// =====================================
// CORE VALIDATION
// =====================================

async function validateCoreSystems(){

  return safelyExecuteCoreOperation(

    "Core validation",

    async() => {

      const requiredSystems = [

        "ConfigAPI",
        "ConstantsAPI",
        "StateAPI",
        "EventsAPI",
        "DependenciesAPI",
        "ContainerAPI",
        "RuntimeAPI",
        "LifecycleIndex",
        "HealthAPI"

      ];

      return requiredSystems.every((systemName) => {

        return Boolean(
          getCoreDependency(
            systemName
          )
        );

      });

    },

    false

  );

}



// =====================================
// INITIALIZATION
// =====================================

async function initializeCoreSystems(){

  return safelyExecuteCoreOperation(

    "Core initialization",

    async() => {

      if(
        coreRuntimeState
        .initialized
      ){

        return true;

      }

      const eventsAPI =
        getCoreDependency(
          "EventsAPI"
        );

      if(
        eventsAPI &&
        isFunction(
          eventsAPI.initialize
        )
      ){

        await eventsAPI
        .initialize();

      }

      const healthAPI =
        getCoreDependency(
          "HealthAPI"
        );

      if(
        healthAPI &&
        isFunction(
          healthAPI.initialize
        )
      ){

        await healthAPI
        .initialize();

      }

      coreRuntimeState
      .initialized =
      true;

      return true;

    },

    false

  );

}



// =====================================
// STARTUP PIPELINE
// =====================================

async function bootCore(){

  return safelyExecuteCoreOperation(

    "Core boot",

    async() => {

      if(

        coreRuntimeState
        .booting ||

        coreRuntimeState
        .booted

      ){

        return false;

      }

      coreRuntimeState
      .booting =
      true;

      coreRuntimeState
      .startupStartedAt =
      Date.now();

      coreRuntimeState
      .diagnostics
      .boots++;

      const validCore =
        await validateCoreSystems();

      if(!validCore){

        throw new Error(
          "CORE VALIDATION FAILED"
        );

      }

      const initialized =
        await initializeCoreSystems();

      if(!initialized){

        throw new Error(
          "CORE INITIALIZATION FAILED"
        );

      }



      // =================================
      // LIFECYCLE
      // =================================

      const lifecycle =
        getCoreDependency(
          "LifecycleIndex"
        );

      if(
        lifecycle &&
        isFunction(
          lifecycle.bootstrapApplication
        )
      ){

        await lifecycle
        .bootstrapApplication();

      }

      if(
        lifecycle &&
        isFunction(
          lifecycle.boot
        )
      ){

        await lifecycle
        .boot();

      }



      // =================================
      // RUNTIME
      // =================================

      const runtime =
        getCoreDependency(
          "RuntimeAPI"
        );

      if(
        runtime &&
        isFunction(
          runtime.boot
        )
      ){

        await runtime
        .boot();

      }



      // =================================
      // HEALTH
      // =================================

      const health =
        getCoreDependency(
          "HealthAPI"
        );

      if(
        health &&
        isFunction(
          health.run
        )
      ){

        await health
        .run();

      }

      coreRuntimeState
      .booted =
      true;

      coreRuntimeState
      .startupCompletedAt =
      Date.now();

      return true;

    },

    false

  )

  .finally(() => {

    coreRuntimeState
    .booting =
    false;

  });

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownCore(){

  return safelyExecuteCoreOperation(

    "Core shutdown",

    async() => {

      if(
        coreRuntimeState
        .shuttingDown
      ){

        return false;

      }

      coreRuntimeState
      .shuttingDown =
      true;

      coreRuntimeState
      .diagnostics
      .shutdowns++;

      const runtime =
        getCoreDependency(
          "RuntimeAPI"
        );

      if(
        runtime &&
        isFunction(
          runtime.shutdown
        )
      ){

        await runtime
        .shutdown();

      }

      const lifecycle =
        getCoreDependency(
          "LifecycleIndex"
        );

      if(
        lifecycle &&
        isFunction(
          lifecycle.shutdownApplication
        )
      ){

        await lifecycle
        .shutdownApplication();

      }

      coreRuntimeState
      .booted =
      false;

      return true;

    },

    false

  )

  .finally(() => {

    coreRuntimeState
    .shuttingDown =
    false;

  });

}



// =====================================
// RECOVERY
// =====================================

async function recoverCore(){

  return safelyExecuteCoreOperation(

    "Core recovery",

    async() => {

      if(
        coreRuntimeState
        .recovering
      ){

        return false;

      }

      coreRuntimeState
      .recovering =
      true;

      coreRuntimeState
      .diagnostics
      .recoveries++;

      const runtime =
        getCoreDependency(
          "RuntimeAPI"
        );

      if(
        runtime &&
        isFunction(
          runtime.recover
        )
      ){

        await runtime
        .recover();

      }

      return await bootCore();

    },

    false

  )

  .finally(() => {

    coreRuntimeState
    .recovering =
    false;

  });

}



// =====================================
// HEALTH
// =====================================

async function isCoreReady(){

  return safelyExecuteCoreOperation(

    "Core readiness",

    async() => {

      if(
        !coreRuntimeState
        .booted
      ){

        return false;

      }

      const healthAPI =
        getCoreDependency(
          "HealthAPI"
        );

      if(
        !healthAPI
      ){

        return false;

      }

      if(
        !isFunction(
          healthAPI.diagnostics
        )
      ){

        return false;

      }

      const health =
        await healthAPI
        .diagnostics();

      coreRuntimeState
      .lastHealthcheckAt =
      Date.now();

      coreRuntimeState
      .diagnostics
      .healthchecks++;

      return Boolean(
        health
      );

    },

    false

  );

}



// =====================================
// BROWSER LIFECYCLE
// =====================================

function bindBrowserLifecycle(){

  if(
    typeof window ===
    "undefined"
  ){

    return false;

  }

  try{

    window.addEventListener(

      "beforeunload",

      async() => {

        await shutdownCore();

      }

    );

    window.addEventListener(

      "unhandledrejection",

      async(event) => {

        console.error(
          "[RIGOCore] Unhandled rejection",
          event?.reason
        );

      }

    );

    window.addEventListener(

      "error",

      async(event) => {

        console.error(
          "[RIGOCore] Runtime error",
          event?.error
        );

      }

    );

    document.addEventListener(

      "visibilitychange",

      () => {

        if(
          document.hidden
        ){

          return;
        }

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// SNAPSHOT
// =====================================

async function createCoreSnapshot(){

  return safelyExecuteCoreOperation(

    "Core snapshot",

    async() => {

      const runtime =
        getCoreDependency(
          "RuntimeAPI");

      const lifecycle =
        getCoreDependency(
          "LifecycleIndex"
        );

      const health =
        getCoreDependency(
          "HealthAPI"
        );

      const events =
        getCoreDependency(
          "EventsAPI"
        );

      return safeFreeze({

        timestamp:
        Date.now(),

        coreState:{

          initialized:
          coreRuntimeState
          .initialized,

          booted:
          coreRuntimeState
          .booted,

          booting:
          coreRuntimeState
          .booting,

          shuttingDown:
          coreRuntimeState
          .shuttingDown,

          recovering:
          coreRuntimeState
          .recovering

        },

        runtime:

          runtime &&
          isFunction(
            runtime.diagnostics
          )

          ?

          await runtime
          .diagnostics()

          :

          null,

        lifecycle:

          lifecycle &&
          isFunction(
            lifecycle.diagnostics
          )

          ?

          await lifecycle
          .diagnostics()

          :

          null,

        health:

          health &&
          isFunction(
            health.diagnostics
          )

          ?

          await health
          .diagnostics()

          :

          null,

        events:

          events &&
          isFunction(
            events.diagnostics
          )

          ?

          await events
          .diagnostics()

          :

          null,

        diagnostics:{

          ...coreRuntimeState
          .diagnostics

        }

      });

    },

    null

  );

}



// =====================================
// CORE API
// =====================================

const RIGOCore =
safeFreeze({



  // ===================================
  // SYSTEMS
  // ===================================

  config:
  () => getCoreDependency(
    "ConfigAPI"
  ),

  constants:
  () => getCoreDependency(
    "ConstantsAPI"
  ),

  state:
  () => getCoreDependency(
    "StateAPI"
  ),

  events:
  () => getCoreDependency(
    "EventsAPI"
  ),

  dependencies:
  () => getCoreDependency(
    "DependenciesAPI"
  ),

  container:
  () => getCoreDependency(
    "ContainerAPI"
  ),

  runtime:
  () => getCoreDependency(
    "RuntimeAPI"
  ),

  lifecycle:
  () => getCoreDependency(
    "LifecycleIndex"
  ),

  health:
  () => getCoreDependency(
    "HealthAPI"
  ),



  // ===================================
  // ORCHESTRATION
  // ===================================

  initialize:
  initializeCoreSystems,

  boot:
  bootCore,

  shutdown:
  shutdownCore,

  recover:
  recoverCore,

  ready:
  isCoreReady,



  // ===================================
  // DIAGNOSTICS
  // ===================================

  snapshot:
  createCoreSnapshot,



  // ===================================
  // STATE
  // ===================================

  state:
  safeFreeze(
    coreRuntimeState
  )

});



// =====================================
// AUTO LIFECYCLE
// =====================================

bindBrowserLifecycle();



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "RIGOCore",

    {

      value:
      RIGOCore,

      writable:
      false,

      configurable:
      false

    }

  );

}
