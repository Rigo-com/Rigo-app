// =====================================
// RIGO AI
// APP BOOTSTRAP
// =====================================



// =====================================
// INITIALIZE APP
// =====================================

async function initializeApp(){

  updateAppPhase(
    APP_PHASES.INITIALIZING
  );

  await emitAppEvent(
    "app.initializing"
  );

  const validEnvironment =
  validateAppEnvironment();

  if(!validEnvironment){

    throw new Error(
      "INVALID ENVIRONMENT"
    );

  }

  const initializedDOM =
  initializeDOMElements();

  if(!initializedDOM){

    throw new Error(
      "DOM INITIALIZATION FAILED"
    );

  }

  registerAppModule(
    "dom"
  );

  const validDOM =
  validateDOMElements();

  if(!validDOM){

    markModuleFailed(
      "dom"
    );

    throw new Error(
      "DOM VALIDATION FAILED"
    );

  }



  // ===================================
  // DEPENDENCY REGISTRY
  // ===================================

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

  const validDependencies =
  await validateDependencyRegistry();

  if(!validDependencies){

    markModuleFailed(
      "dependencies"
    );

    throw new Error(
      "DEPENDENCY REGISTRY FAILED"
    );

  }

  registerAppModule(
    "dependencies"
  );



  const eventsReady =
  setupAppEvents();

  if(!eventsReady){

    markModuleFailed(
      "events"
    );

    throw new Error(
      "APP EVENTS FAILED"
    );

  }

  registerAppModule(
    "events"
  );

  return true;

}
