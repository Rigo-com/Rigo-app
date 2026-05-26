// =====================================
// RIGO AI
// APP BOOTSTRAP
// =====================================



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

    registerAppModule(
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

    markModuleFailed(
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

  registerDependency(
    "memory",
    () => {

      return typeof
      initializeMemorySystem ===
      "function";

    }
  );

  registerDependency(
    "services",
    () => {

      return typeof
      sendMessage ===
      "function";

    }
  );

  registerDependency(
    "events",
    () => {

      return typeof
      emitSystemEvent ===
      "function";

    }
  );

  return true;

}



// =====================================
// VALIDATE ENVIRONMENT
// =====================================

function validateBootstrapEnvironment(){

  const environment =
  AppEnvironment
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

function initializeBootstrapDOM(){

  const initializedDOM =
  initializeDOMElements();

  if(!initializedDOM){

    throw new Error(
      "DOM INITIALIZATION FAILED"
    );

  }

  safeRegisterModule(
    "dom"
  );

  const validDOM =
  validateDOMElements();

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



  // ===================================
  // CONTAINER HEALTH
  // ===================================

  const containerHealth =
  getContainerHealthReport();

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

  const eventsReady =
  setupAppEvents();

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

    updateAppPhase(
      APP_PHASES
      .INITIALIZING
    );

    await emitAppEvent(
      "app.initializing"
    );



    // ===================================
    // ENVIRONMENT
    // ===================================

    validateBootstrapEnvironment();



    // ===================================
    // DOM
    // ===================================

    initializeBootstrapDOM();



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

    if(
      typeof logDiagnosticInfo ===
      "function"
    ){

      await logDiagnosticInfo(

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

    updateAppPhase(
      APP_PHASES
      .FAILED
    );

    if(
      typeof logCriticalError ===
      "function"
    ){

      await logCriticalError(

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

  return freezeEnvironmentObject({

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
  createBootstrapSnapshot

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.AppBootstrap =
  AppBootstrap;

}
