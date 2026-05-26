// =====================================
// RIGO AI
// APPLICATION RUNTIME
// ENTERPRISE ORCHESTRATION
// ENTERPRISE FINAL
// =====================================



// =====================================
// INTERNAL STATE
// =====================================

const applicationRuntimeState =
Object.seal({

  initialized:false,

  started:false,

  starting:false,

  shuttingDown:false,

  cleaning:false,

  sending:false,

  lastInitializedAt:null,

  lastStartedAt:null,

  lastShutdownAt:null,

  lastCleanupAt:null,

  lastMessageAt:null,

  lastHealthcheckAt:null,

  lastError:null

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



function getRuntimeDependency(
  name
){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return null;

    }

    return (
      window[name] ||
      null
    );

  }

  catch(error){

    return null;

  }

}



function normalizeRuntimeError(
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



function emitApplicationRuntimeWarning(
  message,
  error = null
){

  console.warn(

    `[ApplicationRuntime] ${message}`,

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

    value instanceof Map ||

    value instanceof Set ||

    value instanceof Date ||

    value instanceof RegExp ||

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
// EVENTS
// =====================================

const APPLICATION_RUNTIME_EVENTS =
Object.freeze({

  INITIALIZED:
  "application.runtime.initialized",

  STARTED:
  "application.runtime.started",

  SHUTDOWN:
  "application.runtime.shutdown",

  CLEANUP:
  "application.runtime.cleanup",

  MESSAGE:
  "application.runtime.message",

  HEALTHCHECK:
  "application.runtime.healthcheck"

});



// =====================================
// EVENT EMITTER
// =====================================

async function emitRuntimeEvent(
  event,
  payload = {}
){

  try{

    if(
      !isFunction(
        emitSystemEvent
      )
    ){

      return false;

    }

    await emitSystemEvent(

      event,

      {

        source:
        "application-runtime",

        timestamp:
        Date.now(),

        ...payload

      }

    );

    return true;

  }

  catch(error){

    emitApplicationRuntimeWarning(

      `Event failed: ${event}`,

      error

    );

    return false;

  }

}



// =====================================
// SAFE EXECUTION
// =====================================

async function safelyExecute(
  label,
  operation
){

  try{

    if(
      !isFunction(
        operation
      )
    ){

      return false;

    }

    return await operation();

  }

  catch(error){

    applicationRuntimeState
    .lastError =
    normalizeRuntimeError(
      error
    );

    emitApplicationRuntimeWarning(

      `${label} failed`,

      error

    );

    if(
      isFunction(
        logCriticalError
      )
    ){

      try{

        await logCriticalError(

          label.toUpperCase(),

          {

            error:

            normalizeRuntimeError(
              error
            )

          }

        );

      }

      catch(loggingError){

        emitApplicationRuntimeWarning(

          "Critical logging failed",

          loggingError

        );

      }

    }

    return false;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createApplicationRuntimeSnapshot(){

  try{

    const startupSnapshot =
    getRuntimeDependency(
      "createStartupSnapshot"
    );

    const shutdownSnapshot =
    getRuntimeDependency(
      "createShutdownSnapshot"
    );

    const messageRuntimeSnapshot =
    getRuntimeDependency(
      "createMessageRuntimeSnapshot"
    );

    const diagnostics =
    getRuntimeDependency(
      "getAppDiagnostics"
    );

    return safeFreeze({

      timestamp:
      Date.now(),

      runtime:{

        initialized:
        applicationRuntimeState
        .initialized,

        started:
        applicationRuntimeState
        .started,

        starting:
        applicationRuntimeState
        .starting,

        shuttingDown:
        applicationRuntimeState
        .shuttingDown,

        cleaning:
        applicationRuntimeState
        .cleaning,

        sending:
        applicationRuntimeState
        .sending,

        lastInitializedAt:

          applicationRuntimeState
          .lastInitializedAt,

        lastStartedAt:

          applicationRuntimeState
          .lastStartedAt,

        lastShutdownAt:

          applicationRuntimeState
          .lastShutdownAt,

        lastCleanupAt:

          applicationRuntimeState
          .lastCleanupAt,

        lastMessageAt:

          applicationRuntimeState
          .lastMessageAt,

        lastHealthcheckAt:

          applicationRuntimeState
          .lastHealthcheckAt,

        lastError:

          applicationRuntimeState
          .lastError

      },

      app:{

        initialized:
        Boolean(
          appState?.initialized
        ),

        started:
        Boolean(
          appState?.started
        ),

        phase:
        appState?.phase || null

      },

      startup:

        isFunction(
          startupSnapshot
        )

        ?

        startupSnapshot()

        :

        null,

      shutdown:

        isFunction(
          shutdownSnapshot
        )

        ?

        shutdownSnapshot()

        :

        null,

      messageRuntime:

        isFunction(
          messageRuntimeSnapshot
        )

        ?

        messageRuntimeSnapshot()

        :

        null,

      diagnostics:

        isFunction(
          diagnostics
        )

        ?

        diagnostics()

        :

        null

    });

  }

  catch(error){

    emitApplicationRuntimeWarning(
      "Snapshot creation failed",
      error
    );

    return null;

  }

}



// =====================================
// HEALTHCHECK
// =====================================

async function validateApplicationHealth(){

  try{

    const runHealthcheck =
    getRuntimeDependency(
      "runAppHealthcheck"
    );

    if(
      !isFunction(
        runHealthcheck
      )
    ){

      return false;

    }

    const report =
    await runHealthcheck();

    applicationRuntimeState
    .lastHealthcheckAt =
    Date.now();

    const runtimeReady =

      Boolean(
        appState?.initialized
      ) &&

      Boolean(
        appState?.started
      );

    const healthy =
    Boolean(

      report?.healthy &&

      runtimeReady

    );

    await emitRuntimeEvent(

      APPLICATION_RUNTIME_EVENTS
      .HEALTHCHECK,

      {

        healthy

      }

    );

    return healthy;

  }

  catch(error){

    applicationRuntimeState
    .lastError =
    normalizeRuntimeError(
      error
    );

    emitApplicationRuntimeWarning(

      "Application healthcheck failed",

      error

    );

    return false;

  }

}



// =====================================
// INITIALIZE
// =====================================

async function safelyInitializeApplication(){

  if(
    applicationRuntimeState
    .initialized
  ){

    return true;

  }

  return await safelyExecute(

    "APPLICATION INITIALIZATION",

    async() => {

      const initialize =
      getRuntimeDependency(
        "initializeApp"
      );

      if(
        !isFunction(
          initialize
        )
      ){

        throw new Error(
          "initializeApp unavailable"
        );

      }

      const initialized =
      await initialize();

      if(
        initialized
      ){

        applicationRuntimeState
        .initialized =
        true;

        applicationRuntimeState
        .lastInitializedAt =
        Date.now();

        await emitRuntimeEvent(
          APPLICATION_RUNTIME_EVENTS
          .INITIALIZED
        );

      }

      return initialized;

    }

  );

}



// =====================================
// START
// =====================================

async function safelyStartApplication(){

  if(
    applicationRuntimeState
    .started
  ){

    return true;

  }

  if(
    applicationRuntimeState
    .starting
  ){

    return false;

  }

  applicationRuntimeState
  .starting =
  true;

  return await safelyExecute(

    "APPLICATION START",

    async() => {

      const start =
      getRuntimeDependency(
        "startApp"
      );

      if(
        !isFunction(
          start
        )
      ){

        throw new Error(
          "startApp unavailable"
        );

      }

      const started =
      await start();

      if(
        started
      ){

        applicationRuntimeState
        .started =
        true;

        applicationRuntimeState
        .lastStartedAt =
        Date.now();

        await emitRuntimeEvent(
          APPLICATION_RUNTIME_EVENTS
          .STARTED
        );

      }

      return started;

    }

  )

  .finally(() => {

    applicationRuntimeState
    .starting =
    false;

  });

}



// =====================================
// SHUTDOWN
// =====================================

async function safelyShutdownApplication(){

  if(
    applicationRuntimeState
    .shuttingDown
  ){

    return false;

  }

  applicationRuntimeState
  .shuttingDown =
  true;

  return await safelyExecute(

    "APPLICATION SHUTDOWN",

    async() => {

      const shutdown =
      getRuntimeDependency(
        "shutdownApp"
      );

      if(
        !isFunction(
          shutdown
        )
      ){

        throw new Error(
          "shutdownApp unavailable"
        );

      }

      const shutdownResult =
      await shutdown();

      applicationRuntimeState
      .started =
      false;

      applicationRuntimeState
      .lastShutdownAt =
      Date.now();

      await emitRuntimeEvent(
        APPLICATION_RUNTIME_EVENTS
        .SHUTDOWN
      );

      return shutdownResult;

    }

  )

  .finally(() => {

    applicationRuntimeState
    .shuttingDown =
    false;

  });

}



// =====================================
// CLEANUP
// =====================================

async function safelyCleanupApplication(){

  if(
    applicationRuntimeState
    .cleaning
  ){

    return false;

  }

  applicationRuntimeState
  .cleaning =
  true;

  return await safelyExecute(

    "APPLICATION CLEANUP",

    async() => {

      const cleanup =
      getRuntimeDependency(
        "cleanupApp"
      );

      if(
        !isFunction(
          cleanup
        )
      ){

        throw new Error(
          "cleanupApp unavailable"
        );

      }

      const cleaned =
      await cleanup();

      applicationRuntimeState
      .lastCleanupAt =
      Date.now();

      await emitRuntimeEvent(
        APPLICATION_RUNTIME_EVENTS
        .CLEANUP
      );

      return cleaned;

    }

  )

  .finally(() => {

    applicationRuntimeState
    .cleaning =
    false;

  });

}



// =====================================
// MESSAGE RUNTIME
// =====================================

async function safelySendMessage(
  ...args
){

  if(
    applicationRuntimeState
    .sending
  ){

    return false;

  }

  applicationRuntimeState
  .sending =
  true;

  return await safelyExecute(

    "MESSAGE RUNTIME",

    async() => {

      const sendMessage =
      getRuntimeDependency(
        "handleSendMessage"
      );

      if(
        !isFunction(
          sendMessage
        )
      ){

        throw new Error(
          "handleSendMessage unavailable"
        );

      }

      const result =
      await sendMessage(
        ...args
      );

      applicationRuntimeState
      .lastMessageAt =
      Date.now();

      await emitRuntimeEvent(
        APPLICATION_RUNTIME_EVENTS
        .MESSAGE
      );

      return result;

    }

  )

  .finally(() => {

    applicationRuntimeState
    .sending =
    false;

  });

}



// =====================================
// DIAGNOSTICS
// =====================================

function safelyGetDiagnostics(){

  try{

    const diagnostics =
    getRuntimeDependency(
      "getAppDiagnostics"
    );

    if(
      !isFunction(
        diagnostics
      )
    ){

      return null;

    }

    return safeFreeze(
      diagnostics()
    );

  }

  catch(error){

    emitApplicationRuntimeWarning(
      "Diagnostics failed",
      error
    );

    return null;

  }

}



// =====================================
// PUBLIC API
// =====================================

const ApplicationRuntime =
Object.freeze({

  initialize:
  safelyInitializeApplication,

  start:
  safelyStartApplication,

  shutdown:
  safelyShutdownApplication,

  cleanup:
  safelyCleanupApplication,

  sendMessage:
  safelySendMessage,

  health:
  validateApplicationHealth,

  diagnostics:
  safelyGetDiagnostics,

  snapshot:
  createApplicationRuntimeSnapshot

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "ApplicationRuntime",

    {

      value:
      ApplicationRuntime,

      writable:false,

      configurable:false

    }

  );

}
