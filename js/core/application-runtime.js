// =====================================
// RIGO AI
// APPLICATION RUNTIME
// ENTERPRISE ORCHESTRATION
// =====================================



// =====================================
// HELPERS
// =====================================

function isFunction(value){

  return typeof value === "function";

}



function getRuntimeDependency(name){

  if(typeof window === "undefined"){
    return null;
  }

  return window[name] || null;

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
    typeof value !== "object"
  ){
    return value;
  }

  if(visited.has(value)){
    return value;
  }

  if(

    value instanceof Map ||
    value instanceof Set ||
    value instanceof Date ||
    value instanceof RegExp

  ){
    return value;
  }

  visited.add(value);

  Object.freeze(value);

  Object.values(value).forEach((nestedValue) => {

    if(
      nestedValue &&
      typeof nestedValue === "object"
    ){

      safeFreeze(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// SAFE EXECUTION
// =====================================

async function safelyExecute(
  label,
  operation
){

  try{

    if(!isFunction(operation)){
      return false;
    }

    return await operation();

  }catch(error){

    emitApplicationRuntimeWarning(
      `${label} failed`,
      error
    );

    if(
      isFunction(logCriticalError)
    ){

      try{

        await logCriticalError(
          label.toUpperCase(),
          {

            error:
            String(error)

          }
        );

      }catch(loggingError){

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

      app:{

        initialized:
        Boolean(appState?.initialized),

        started:
        Boolean(appState?.started),

        phase:
        appState?.phase || null

      },

      startup:

      isFunction(startupSnapshot)
        ? startupSnapshot()
        : null,

      shutdown:

      isFunction(shutdownSnapshot)
        ? shutdownSnapshot()
        : null,

      messageRuntime:

      isFunction(messageRuntimeSnapshot)
        ? messageRuntimeSnapshot()
        : null,

      diagnostics:

      isFunction(diagnostics)
        ? diagnostics()
        : null

    });

  }catch(error){

    emitApplicationRuntimeWarning(
      "Snapshot creation failed",
      error
    );

    return null;

  }

}



// =====================================
// APPLICATION HEALTH
// =====================================

async function validateApplicationHealth(){

  try{

    const runHealthcheck =
      getRuntimeDependency(
        "runAppHealthcheck"
      );

    if(
      !isFunction(runHealthcheck)
    ){
      return false;
    }

    const report =
      await runHealthcheck();

    const runtimeReady =

      Boolean(appState?.initialized) &&
      Boolean(appState?.started);

    return Boolean(
      report?.healthy &&
      runtimeReady
    );

  }catch(error){

    emitApplicationRuntimeWarning(
      "Application healthcheck failed",
      error
    );

    return false;

  }

}



// =====================================
// INITIALIZATION
// =====================================

async function safelyInitializeApplication(){

  return await safelyExecute(

    "APPLICATION INITIALIZATION",

    async() => {

      const initialize =
        getRuntimeDependency(
          "initializeApp"
        );

      if(
        !isFunction(initialize)
      ){

        throw new Error(
          "initializeApp unavailable"
        );

      }

      return await initialize();

    }

  );

}



// =====================================
// START
// =====================================

async function safelyStartApplication(){

  return await safelyExecute(

    "APPLICATION START",

    async() => {

      const start =
        getRuntimeDependency(
          "startApp"
        );

      if(
        !isFunction(start)
      ){

        throw new Error(
          "startApp unavailable"
        );

      }

      return await start();

    }

  );

}



// =====================================
// SHUTDOWN
// =====================================

async function safelyShutdownApplication(){

  return await safelyExecute(

    "APPLICATION SHUTDOWN",

    async() => {

      const shutdown =
        getRuntimeDependency(
          "shutdownApp"
        );

      if(
        !isFunction(shutdown)
      ){

        throw new Error(
          "shutdownApp unavailable"
        );

      }

      return await shutdown();

    }

  );

}



// =====================================
// CLEANUP
// =====================================

async function safelyCleanupApplication(){

  return await safelyExecute(

    "APPLICATION CLEANUP",

    async() => {

      const cleanup =
        getRuntimeDependency(
          "cleanupApp"
        );

      if(
        !isFunction(cleanup)
      ){

        throw new Error(
          "cleanupApp unavailable"
        );

      }

      return await cleanup();

    }

  );

}



// =====================================
// MESSAGE RUNTIME
// =====================================

async function safelySendMessage(
  ...args
){

  return await safelyExecute(

    "MESSAGE RUNTIME",

    async() => {

      const sendMessage =
        getRuntimeDependency(
          "handleSendMessage"
        );

      if(
        !isFunction(sendMessage)
      ){

        throw new Error(
          "handleSendMessage unavailable"
        );

      }

      return await sendMessage(
        ...args
      );

    }

  );

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
      !isFunction(diagnostics)
    ){
      return null;
    }

    return safeFreeze(
      diagnostics()
    );

  }catch(error){

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

if(typeof window !== "undefined"){

  Object.defineProperty(
    window,
    "ApplicationRuntime",
    {

      value:
      ApplicationRuntime,

      writable:
      false,

      configurable:
      false

    }
  );

}
