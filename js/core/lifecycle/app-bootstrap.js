// =====================================
// RIGO AI
// APP BOOTSTRAP
// =====================================



// =====================================
// IMMUTABLE
// =====================================

function freezeBootstrapObject(
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

      freezeBootstrapObject(
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

function getBootstrapDependency(
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
// STATE
// =====================================

const bootstrapState =
Object.seal({

  bootstrapping:false,

  initialized:false,

  startedAt:null,

  completedAt:null,

  lastError:null

});



// =====================================
// HELPERS
// =====================================

function updateBootstrapState(
  updates = {}
){

  Object.assign(

    bootstrapState,

    updates

  );

  return true;

}



function normalizeBootstrapError(
  error
){

  const formatter =
  getBootstrapDependency(
    "getSafeErrorMessage"
  );

  if(
    typeof formatter ===
    "function"
  ){

    return formatter(
      error
    );

  }

  return String(
    error || "UNKNOWN ERROR"
  );

}



// =====================================
// SAFE MODULE REGISTER
// =====================================

function safeRegisterModule(
  moduleName
){

  try{

    const registerModule =
    getBootstrapDependency(
      "registerAppModule"
    );

    if(
      typeof registerModule !==
      "function"
    ){

      return false;

    }

    registerModule(
      moduleName
    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// SAFE MODULE FAIL
// =====================================

function safeFailModule(
  moduleName
){

  try{

    const failModule =
    getBootstrapDependency(
      "markModuleFailed"
    );

    if(
      typeof failModule !==
      "function"
    ){

      return false;

    }

    failModule(
      moduleName
    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// REGISTER DEPENDENCIES
// =====================================

function registerBootstrapDependencies(){

  const registerDependency =
  getBootstrapDependency(
    "registerDependency"
  );

  if(
    typeof registerDependency !==
    "function"
  ){

    return false;

  }

  registerDependency(
    "memory",
    () => {

      const initializer =
      getBootstrapDependency(
        "initializeMemorySystem"
      );

      return typeof
      initializer ===
      "function";

    }
  );

  registerDependency(
    "services",
    () => {

      const sender =
      getBootstrapDependency(
        "sendMessage"
      );

      return typeof
      sender ===
      "function";

    }
  );

  registerDependency(
    "events",
    () => {

      const emitter =
      getBootstrapDependency(
        "emitSystemEvent"
      );

      return typeof
      emitter ===
      "function";

    }
  );

  return true;

}



// =====================================
// VALIDATE ENVIRONMENT
// =====================================

function validateBootstrapEnvironment(){

  const environmentAPI =
  getBootstrapDependency(
    "AppEnvironment"
  );

  if(
    !environmentAPI ||
    typeof environmentAPI
    .validate !==
    "function"
  ){

    throw new Error(
      "ENVIRONMENT API UNAVAILABLE"
    );

  }

  const environment =
  environmentAPI
  .validate();

  if(
    !environment?.valid
  ){

    throw new Error(
      "INVALID ENVIRONMENT"
    );

  }

  safeRegisterModule(
    "environment"
  );

  return true;

}



// =====================================
// INITIALIZE DOM
// =====================================

async function initializeBootstrapDOM(){

  const initializeDOM =
  getBootstrapDependency(
    "initializeDOMElements"
  );

  const validateDOM =
  getBootstrapDependency(
    "validateDOMElements"
  );

  if(
    typeof initializeDOM !==
    "function"
  ){

    throw new Error(
      "DOM INITIALIZER UNAVAILABLE"
    );

  }

  const initializedDOM =
  await initializeDOM();

  if(!initializedDOM){

    throw new Error(
      "DOM INITIALIZATION FAILED"
    );

  }

  safeRegisterModule(
    "dom"
  );

  if(
    typeof validateDOM !==
    "function"
  ){

    throw new Error(
      "DOM VALIDATOR UNAVAILABLE"
    );

  }

  const validDOM =
  validateDOM();

  if(!validDOM){

    safeFailModule(
      "dom"
    );

    throw new Error(
      "DOM VALIDATION FAILED"
    );

  }

  return true;

}



// =====================================
// INITIALIZE DEPENDENCIES
// =====================================

async function initializeBootstrapDependencies(){

  registerBootstrapDependencies();

  const getContainerHealth =
  getBootstrapDependency(
    "getContainerHealthReport"
  );

  if(
    typeof getContainerHealth !==
    "function"
  ){

    throw new Error(
      "CONTAINER HEALTH UNAVAILABLE"
    );

  }

  const containerHealth =
  getContainerHealth();

  const validDependencies =
  containerHealth?.healthy ===
  true;

  if(!validDependencies){

    safeFailModule(
      "dependencies"
    );

    throw new Error(
      "CONTAINER HEALTH FAILED"
    );

  }

  safeRegisterModule(
    "dependencies"
  );

  return true;

}



// =====================================
// INITIALIZE EVENTS
// =====================================

function initializeBootstrapEvents(){

  const setupEvents =
  getBootstrapDependency(
    "setupAppEvents"
  );

  if(
    typeof setupEvents !==
    "function"
  ){

    throw new Error(
      "EVENT SETUP UNAVAILABLE"
    );

  }

  const eventsReady =
  setupEvents();

  if(!eventsReady){

    safeFailModule(
      "events"
    );

    throw new Error(
      "APP EVENTS FAILED"
    );

  }

  safeRegisterModule(
    "events"
  );

  return true;

}



// =====================================
// INITIALIZE APP
// =====================================

async function initializeApp(){

  if(
    bootstrapState
    .bootstrapping
  ){

    return false;

  }

  if(
    bootstrapState
    .initialized
  ){

    return true;

  }

  updateBootstrapState({

    bootstrapping:true,

    startedAt:
    Date.now(),

    lastError:null

  });

  try{

    const updatePhase =
    getBootstrapDependency(
      "updateAppPhase"
    );

    const phases =
    getBootstrapDependency(
      "APP_PHASES"
    );

    if(
      typeof updatePhase ===
      "function" &&
      phases
    ){

      updatePhase(
        phases
        .INITIALIZING
      );

    }

    const appEmitter =
    getBootstrapDependency(
      "emitAppEvent"
    );

    if(
      typeof appEmitter ===
      "function"
    ){

      await appEmitter(
        "app.initializing"
      );

    }



    // ===================================
    // ENVIRONMENT
    // ===================================

    validateBootstrapEnvironment();



    // ===================================
    // DOM
    // ===================================

    await initializeBootstrapDOM();



    // ===================================
    // DEPENDENCIES
    // ===================================

    await initializeBootstrapDependencies();



    // ===================================
    // EVENTS
    // ===================================

    initializeBootstrapEvents();



    // ===================================
    // COMPLETE
    // ===================================

    updateBootstrapState({

      initialized:true,

      completedAt:
      Date.now()

    });

    const diagnosticsInfo =
    getBootstrapDependency(
      "logDiagnosticInfo"
    );

    if(
      typeof diagnosticsInfo ===
      "function"
    ){

      await diagnosticsInfo(

        "APP BOOTSTRAP COMPLETED",

        {

          duration:

            bootstrapState
            .completedAt -

            bootstrapState
            .startedAt

        }

      );

    }

    return true;

  }

  catch(error){

    updateBootstrapState({

      lastError:error

    });

    const updatePhase =
    getBootstrapDependency(
      "updateAppPhase"
    );

    const phases =
    getBootstrapDependency(
      "APP_PHASES"
    );

    if(
      typeof updatePhase ===
      "function" &&
      phases
    ){

      updatePhase(
        phases
        .FAILED
      );

    }

    const criticalLogger =
    getBootstrapDependency(
      "logCriticalError"
    );

    if(
      typeof criticalLogger ===
      "function"
    ){

      await criticalLogger(

        "APP BOOTSTRAP FAILED",

        {

          error:
          normalizeBootstrapError(
            error
          )

        }

      );

    }

    return false;

  }

  finally{

    updateBootstrapState({

      bootstrapping:false

    });

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createBootstrapSnapshot(){

  return freezeBootstrapObject({

    initialized:
    bootstrapState
    .initialized,

    bootstrapping:
    bootstrapState
    .bootstrapping,

    startedAt:
    bootstrapState
    .startedAt,

    completedAt:
    bootstrapState
    .completedAt,

    duration:

      bootstrapState
      .startedAt &&

      bootstrapState
      .completedAt

      ?

      bootstrapState
      .completedAt -

      bootstrapState
      .startedAt

      :

      null,

    phase:

      appState
      ?.phase ||

      null,

    lastError:

      bootstrapState
      .lastError

      ? normalizeBootstrapError(
          bootstrapState
          .lastError
        )

      : null

  });

}



// =====================================
// PUBLIC API
// =====================================

const AppBootstrap =
Object.freeze({

  initialize:
  initializeApp,

  snapshot:
  createBootstrapSnapshot,

  diagnostics:
  createBootstrapSnapshot

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

    "AppBootstrap",

    {

      value:
      AppBootstrap,

      writable:
      false,

      configurable:
      false

    }

  );

}
