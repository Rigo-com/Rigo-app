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

  bootstrapState
  .bootstrapping =
  true;

  bootstrapState
  .startedAt =
  Date.now();

  bootstrapState
  .lastError =
  null;

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

    const environment =
    validateAppEnvironment();

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



    // ===================================
    // DOM
    // ===================================

    const initializedDOM =
    initializeDOMElements();

    if(!initializedDOM){

      throw new Error(
        "DOM INITIALIZATION FAILED"
      );

    }

    safeRegisterModule(
      "dom");

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



    // ===================================
    // DEPENDENCIES
    // ===================================

    registerBootstrapDependencies();

    const validDependencies =
    await validateDependencyRegistry();

    if(!validDependencies){

      safeFailModule(
        "dependencies"
      );

      throw new Error(
        "DEPENDENCY REGISTRY FAILED"
      );

    }

    safeRegisterModule(
      "dependencies"
    );



    // ===================================
    // EVENTS
    // ===================================

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



    // ===================================
    // COMPLETE
    // ===================================

    bootstrapState
    .initialized =
    true;

    bootstrapState
    .completedAt =
    Date.now();

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

    bootstrapState
    .lastError =
    error;

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
          String(error)

        }

      );

    }

    return false;

  }

  finally{

    bootstrapState
    .bootstrapping =
    false;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createBootstrapSnapshot(){

  return Object.freeze({

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

      ? String(
          bootstrapState
          .lastError
        )

      : null

  });

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.initializeApp =
  initializeApp;

  window.createBootstrapSnapshot =
  createBootstrapSnapshot;

}
