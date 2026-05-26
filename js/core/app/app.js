// =====================================
// RIGO AI
// APPLICATION ORCHESTRATOR
// ENTERPRISE FINAL
// =====================================



// =====================================
// APPLICATION STATE
// =====================================

const applicationState =
Object.seal({

  bootstrapping:false,

  bootstrapped:false,

  registered:false,

  initialized:false,

  starting:false,

  shuttingDown:false,

  startedAt:null,

  completedAt:null,

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



function normalizeApplicationError(
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



function emitApplicationWarning(
  message,
  error = null
){

  console.warn(

    `[RIGOApplication] ${message}`,

    error || ""

  );

}



// =====================================
// EVENTS
// =====================================

const APPLICATION_EVENTS =
Object.freeze({

  BOOTSTRAP_STARTED:
  "application.bootstrap.started",

  BOOTSTRAP_COMPLETED:
  "application.bootstrap.completed",

  BOOTSTRAP_FAILED:
  "application.bootstrap.failed",

  HEALTHCHECK:
  "application.healthcheck"

});



// =====================================
// EVENT EMITTER
// =====================================

async function emitApplicationEvent(
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
        "application-orchestrator",

        timestamp:
        Date.now(),

        ...payload

      }

    );

    return true;

  }

  catch(error){

    emitApplicationWarning(

      `Event failed: ${event}`,

      error

    );

    return false;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createApplicationSnapshot(){

  return safeFreeze({

    bootstrapping:
    applicationState
    .bootstrapping,

    bootstrapped:
    applicationState
    .bootstrapped,

    registered:
    applicationState
    .registered,

    initialized:
    applicationState
    .initialized,

    starting:
    applicationState
    .starting,

    shuttingDown:
    applicationState
    .shuttingDown,

    startedAt:
    applicationState
    .startedAt,

    completedAt:
    applicationState
    .completedAt,

    lastHealthcheckAt:

      applicationState
      .lastHealthcheckAt,

    lastError:

      applicationState
      .lastError,

    timestamp:
    Date.now()

  });

}



// =====================================
// STARTUP VALIDATION
// =====================================

async function validateStartupSystems(){

  try{

    const checks = [

      typeof initializeChatSystem ===
      "function",

      typeof initializeVoiceRuntime ===
      "function"

    ];

    return checks.every(Boolean);

  }

  catch(error){

    emitApplicationWarning(
      "Startup validation failed",
      error
    );

    return false;

  }

}



// =====================================
// INTERFACE SYSTEMS
// =====================================

async function startInterfaceSystems(){

  if(
    isFunction(
      initializeChatSystem
    )
  ){

    await initializeChatSystem();

  }

  if(
    isFunction(
      initializeVoiceRuntime
    )
  ){

    await initializeVoiceRuntime();

  }

  return true;

}



// =====================================
// FINALIZE STARTUP
// =====================================

async function finalizeApplicationStartup(){

  applicationState
  .bootstrapped =
  true;

  applicationState
  .initialized =
  true;

  applicationState
  .completedAt =
  Date.now();

  await emitApplicationEvent(

    APPLICATION_EVENTS
    .BOOTSTRAP_COMPLETED,

    {

      duration:

      applicationState
      .completedAt -

      applicationState
      .startedAt

    }

  );

  return true;

}



// =====================================
// HEALTHCHECK
// =====================================

async function validateApplicationHealth(){

  try{

    applicationState
    .lastHealthcheckAt =
    Date.now();

    const healthy =

      applicationState
      .bootstrapped &&

      applicationState
      .initialized;

    await emitApplicationEvent(

      APPLICATION_EVENTS
      .HEALTHCHECK,

      {

        healthy

      }

    );

    return healthy;

  }

  catch(error){

    emitApplicationWarning(
      "Healthcheck failed",
      error
    );

    return false;

  }

}



// =====================================
// BOOTSTRAP
// =====================================

async function bootstrapApplication(){

  if(

    applicationState
    .bootstrapping ||

    applicationState
    .bootstrapped

  ){

    return false;

  }

  applicationState
  .bootstrapping =
  true;

  applicationState
  .starting =
  true;

  applicationState
  .startedAt =
  Date.now();

  applicationState
  .lastError =
  null;

  try{

    await emitApplicationEvent(
      APPLICATION_EVENTS
      .BOOTSTRAP_STARTED
    );

    const validStartup =
    await validateStartupSystems();

    if(
      !validStartup
    ){

      throw new Error(
        "INVALID STARTUP SYSTEMS"
      );

    }

    // =============================
    // START RUNTIMES
    // =============================

    await startInterfaceSystems();

    // =============================
    // COMPLETE STARTUP
    // =============================

    await finalizeApplicationStartup();

    // =============================
    // HEALTH VALIDATION
    // =============================

    const healthy =
    await validateApplicationHealth();

    if(
      !healthy
    ){

      throw new Error(
        "APPLICATION HEALTHCHECK FAILED"
      );

    }

    console.info(
      "RIGO APPLICATION READY"
    );

    return true;

  }

  catch(error){

    applicationState
    .lastError =
    normalizeApplicationError(
      error
    );

    await emitApplicationEvent(

      APPLICATION_EVENTS
      .BOOTSTRAP_FAILED,

      {

        error:

        normalizeApplicationError(
          error
        )

      }

    );

    if(
      isFunction(
        safeLogError
      )
    ){

      safeLogError(

        "APPLICATION BOOTSTRAP ERROR",

        error

      );

    }

    emitApplicationWarning(
      "Bootstrap failed",
      error
    );

    return false;

  }

  finally{

    applicationState
    .bootstrapping =
    false;

    applicationState
    .starting =
    false;

  }

}



// =====================================
// START REGISTRATION
// =====================================

function registerApplicationStartup(){

  if(
    typeof document ===
    "undefined"
  ){

    return false;

  }

  if(
    applicationState
    .registered
  ){

    return true;

  }

  applicationState
  .registered =
  true;

  const startApplication =
  () => {

    Promise.resolve(
      bootstrapApplication()
    )

    .catch((error) => {

      applicationState
      .lastError =
      normalizeApplicationError(
        error
      );

      if(
        isFunction(
          safeLogError
        )
      ){

        safeLogError(

          "APPLICATION START ERROR",

          error

        );

      }

    });

  };

  if(
    document.readyState ===
    "loading"
  ){

    document.addEventListener(

      "DOMContentLoaded",

      startApplication,

      {

        once:true

      }

    );

  }

  else{

    startApplication();

  }

  return true;

}



// =====================================
// AUTO START
// =====================================

registerApplicationStartup();



// =====================================
// PUBLIC API
// =====================================

const RIGOApplication =
Object.freeze({

  bootstrap:
  bootstrapApplication,

  health:
  validateApplicationHealth,

  snapshot:
  createApplicationSnapshot,

  register:
  registerApplicationStartup

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

    "RIGOApplication",

    {

      value:
      RIGOApplication,

      writable:false,

      configurable:false

    }

  );

}
