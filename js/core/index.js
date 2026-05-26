// =====================================
// RIGO AI
// ROOT CORE INDEX
// ENTERPRISE MASTER ORCHESTRATOR
// FINAL ARCHITECTURE
// =====================================



// =====================================
// INTERNAL STATE
// =====================================

const coreRuntimeState =
Object.seal({

  initialized:false,

  booting:false,

  booted:false,

  shuttingDown:false,

  recovering:false,

  lifecycleBound:false,

  startupStartedAt:null,

  startupCompletedAt:null,

  lastHealthcheckAt:null,

  lastError:null,

  diagnostics:{

    boots:0,

    shutdowns:0,

    recoveries:0,

    healthchecks:0,

    runtimeErrors:0

  }

});



// =====================================
// HELPERS
// =====================================

function isFunction(
  value
){

  return typeof value ===
  "function";

}



function isPlainObject(
  value
){

  if(
    !value ||
    typeof value !==
    "object"
  ){

    return false;

  }

  const prototype =
  Object.getPrototypeOf(
    value
  );

  return (

    prototype ===
    Object.prototype ||

    prototype ===
    null

  );

}



function normalizeCoreError(
  error
){

  if(
    typeof getSafeErrorMessage ===
    "function"
  ){

    return getSafeErrorMessage(
      error
    );

  }

  return String(
    error || "UNKNOWN ERROR"
  );

}



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

    return (
      window[dependencyName] ||
      null
    );

  }

  catch(error){

    return null;

  }

}



function emitCoreWarning(
  message,
  error = null
){

  console.warn(

    `[RIGOCore] ${message}`,

    error || ""

  );

}



// =====================================
// SAFE FREEZE
// =====================================

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

    value instanceof Promise ||

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

  if(

    !Array.isArray(value) &&

    !isPlainObject(value)

  ){

    return value;

  }

  visited.add(value);

  Object.freeze(value);

  Object.values(value)
  .forEach((nestedValue) => {

    safeFreeze(
      nestedValue,
      visited
    );

  });

  return value;

}



// =====================================
// SAFE EXECUTION
// =====================================

async function safelyExecuteCoreOperation(
  label,
  operation,
  fallback = null
){

  try{

    if(
      !isFunction(
        operation
      )
    ){

      return fallback;

    }

    return await operation();

  }

  catch(error){

    coreRuntimeState
    .lastError =
    normalizeCoreError(
      error
    );

    coreRuntimeState
    .diagnostics
    .runtimeErrors++;

    emitCoreWarning(

      `${label} failed`,

      error

    );

    if(
      typeof logCriticalError ===
      "function"
    ){

      try{

        await logCriticalError(

          label.toUpperCase(),

          {

            error:

            normalizeCoreError(
              error
            )

          }

        );

      }

      catch(loggingError){

        emitCoreWarning(

          "Critical logging failed",

          loggingError

        );

      }

    }

    return fallback;

  }

}



// =====================================
// REQUIRED SYSTEMS
// =====================================

const REQUIRED_SYSTEMS =
Object.freeze([

  "ConstantsAPI",
  "StateAPI",
  "RigoModules",
  "ApplicationRuntime",
  "AppRecovery",
  "RIGOApplication"

]);



// =====================================
// VALIDATION
// =====================================

async function validateCoreSystems(){

  return safelyExecuteCoreOperation(

    "Core validation",

    async() => {

      return REQUIRED_SYSTEMS
      .every((systemName) => {

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

      const modules =
      getCoreDependency(
        "RigoModules"
      );

      const runtime =
      getCoreDependency(
        "ApplicationRuntime"
      );

      // =============================
      // MODULES
      // =============================

      if(

        modules &&

        isFunction(
          modules.initialize
        )

      ){

        await modules
        .initialize();

      }

      // =============================
      // APPLICATION RUNTIME
      // =============================

      if(

        runtime &&

        isFunction(
          runtime.initialize
        )

      ){

        await runtime
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
// BOOT
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

      // =============================
      // VALIDATION
      // =============================

      const validCore =
      await validateCoreSystems();

      if(
        !validCore
      ){

        throw new Error(
          "CORE VALIDATION FAILED"
        );

      }

      // =============================
      // INITIALIZATION
      // =============================

      const initialized =
      await initializeCoreSystems();

      if(
        !initialized
      ){

        throw new Error(
          "CORE INITIALIZATION FAILED"
        );

      }

      // =============================
      // MODULE BOOT
      // =============================

      const modules =
      getCoreDependency(
        "RigoModules"
      );

      if(

        modules &&

        isFunction(
          modules.boot
        )

      ){

        await modules
        .boot();

      }

      // =============================
      // APPLICATION
      // =============================

      const application =
      getCoreDependency(
        "RIGOApplication"
      );

      if(

        application &&

        isFunction(
          application.bootstrap
        )

      ){

        await application
        .bootstrap();

      }

      // =============================
      // HEALTHCHECK
      // =============================

      const healthy =
      await isCoreReady();

      if(
        !healthy
      ){

        throw new Error(
          "CORE HEALTHCHECK FAILED"
        );

      }

      coreRuntimeState
      .booted =
      true;

      coreRuntimeState
      .startupCompletedAt =
      Date.now();

      console.info(
        "[RIGOCore] Core boot completed"
      );

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
        "ApplicationRuntime"
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

      const recovery =
      getCoreDependency(
        "AppRecovery"
      );

      if(

        recovery &&

        isFunction(
          recovery.recover
        )

      ){

        return await recovery
        .recover();

      }

      return false;

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
// HEALTHCHECK
// =====================================

async function isCoreReady(){

  return safelyExecuteCoreOperation(

    "Core readiness",

    async() => {

      if(
        !coreRuntimeState
        .initialized
      ){

        return false;

      }

      const runtime =
      getCoreDependency(
        "ApplicationRuntime"
      );

      if(
        !runtime
      ){

        return false;

      }

      if(
        !isFunction(
          runtime.health
        )
      ){

        return false;

      }

      const healthy =
      await runtime
      .health();

      coreRuntimeState
      .lastHealthcheckAt =
      Date.now();

      coreRuntimeState
      .diagnostics
      .healthchecks++;

      return Boolean(
        healthy
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

  if(
    coreRuntimeState
    .lifecycleBound
  ){

    return true;

  }

  try{

    window.addEventListener(

      "beforeunload",

      () => {

        shutdownCore();

      }

    );

    window.addEventListener(

      "unhandledrejection",

      (event) => {

        emitCoreWarning(

          "Unhandled rejection",

          event?.reason

        );

      }

    );

    window.addEventListener(

      "error",

      (event) => {

        emitCoreWarning(

          "Runtime error",

          event?.error

        );

      }

    );

    coreRuntimeState
    .lifecycleBound =
    true;

    return true;

  }

  catch(error){

    emitCoreWarning(
      "Lifecycle binding failed",
      error
    );

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
        "ApplicationRuntime"
      );

      const modules =
      getCoreDependency(
        "RigoModules"
      );

      const recovery =
      getCoreDependency(
        "AppRecovery"
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
            runtime.snapshot
          )

          ?

          runtime.snapshot()

          :

          null,

        modules:

          modules &&

          isFunction(
            modules.snapshot
          )

          ?

          modules.snapshot()

          :

          null,

        recovery:

          recovery &&

          isFunction(
            recovery.snapshot
          )

          ?

          recovery.snapshot()

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
// PUBLIC API
// =====================================

const RIGOCore =
safeFreeze({

  // =============================
  // SYSTEM ACCESS
  // =============================

  constants:
  () => getCoreDependency(
    "ConstantsAPI"
  ),

  state:
  () => getCoreDependency(
    "StateAPI"
  ),

  modules:
  () => getCoreDependency(
    "RigoModules"
  ),

  runtime:
  () => getCoreDependency(
    "ApplicationRuntime"
  ),

  recovery:
  () => getCoreDependency(
    "AppRecovery"
  ),

  application:
  () => getCoreDependency(
    "RIGOApplication"
  ),

  // =============================
  // ORCHESTRATION
  // =============================

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

  // =============================
  // DIAGNOSTICS
  // =============================

  snapshot:
  createCoreSnapshot

});



// =====================================
// AUTO LIFECYCLE
// =====================================

bindBrowserLifecycle();



// =====================================
// GLOBAL EXPORT
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

      writable:false,

      configurable:false

    }

  );

}
