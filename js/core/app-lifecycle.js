// =====================================
// RIGO AI
// APP LIFECYCLE
// ENTERPRISE FINAL
// =====================================



// =====================================
// VALIDATE APP
// =====================================

function validateAppEnvironment(){

  if(
    typeof window ===
    "undefined"
  ){

    return false;

  }

  if(
    typeof document ===
    "undefined"
  ){

    return false;

  }

  return true;

}



// =====================================
// MESSAGE TIMEOUT
// =====================================

function createMessageTimeout(){

  const timeoutDuration =

    APP_CONFIG?.CHAT
    ?.MESSAGE_TIMEOUT

    ?? 30000;

  let timeoutId =
  null;

  const promise =
  new Promise(
    (_,reject) => {

      timeoutId =
      setTimeout(() => {

        reject(

          new Error(
            "MESSAGE TIMEOUT"
          )

        );

      },timeoutDuration);

    }
  );

  return {

    promise,

    clear(){

      if(timeoutId){

        clearTimeout(
          timeoutId
        );

      }

    }

  };

}



// =====================================
// HANDLE SEND MESSAGE
// =====================================

async function handleSendMessage(){

  if(
    sendingMessage
  ){

    return false;

  }

  if(
    typeof sendMessage !==
    "function"
  ){

    safeLogError(
      "sendMessage unavailable"
    );

    return false;

  }

  sendingMessage =
  true;

  updateMessageUIState(
    true
  );

  const timeoutController =
  createMessageTimeout();

  try{

    await Promise.race([

      sendMessage(),

      timeoutController
      .promise

    ]);

    await emitAppEvent(
      "chat.message.sent"
    );

    return true;

  }

  catch(error){

    setAppError(
      error
    );

    safeLogError(
      getSafeErrorMessage(
        error
      )
    );

    await emitAppEvent(

      "chat.message.failed",

      {

        error:
        getSafeErrorMessage(
          error
        )

      }

    );

    return false;

  }

  finally{

    timeoutController
    .clear();

    sendingMessage =
    false;

    updateMessageUIState(
      false
    );

  }

}



// =====================================
// CLEANUP APP
// =====================================

function cleanupApp(){

  sendingMessage =
  false;

  appState.ready =
  false;

  if(sendButton){

    sendButton.disabled =
    false;

  }

  if(messageInput){

    messageInput.disabled =
    false;

  }

  stopHealthchecks();

  updateAppPhase(
    APP_PHASES.IDLE
  );

  return true;

}



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



// =====================================
// START APP
// =====================================

async function startApp(){

  if(

    appState.started ||

    appState.starting

  ){

    return false;

  }

  appState.starting =
  true;

  appState.booting =
  true;

  appState.startupStartedAt =
  Date.now();

  updateAppPhase(
    APP_PHASES.PREINIT
  );

  await emitAppEvent(
    "app.preinit"
  );

  try{

    updateAppPhase(
      APP_PHASES.BOOTING
    );

    await emitAppEvent(
      "app.booting"
    );

    await Promise.race([

      initializeApp(),

      new Promise((_,reject) => {

        setTimeout(() => {

          reject(

            new Error(
              "APP STARTUP TIMEOUT"
            )

          );

        },

        APP_CORE_CONFIG
        .STARTUP_TIMEOUT);

      })

    ]);

    appState.started =
    true;

    appState.initialized =
    true;

    appState.crashed =
    false;

    appState.initializedAt =
    Date.now();

    appState.startupCompletedAt =
    Date.now();

    appState.startupDuration =

      appState
      .startupCompletedAt -

      appState
      .startupStartedAt;

    updateAppPhase(
      APP_PHASES.READY
    );

    startHealthchecks();

    hideLoadingScreen();

    await emitAppEvent(
      "app.ready"
    );

    safeLogInfo(
      "RIGO AI READY"
    );

    return true;

  }

  catch(error){

    appState.failedStarts++;

    setAppError(
      error
    );

    updateAppPhase(
      APP_PHASES.ERROR
    );

    cleanupApp();

    if(
      typeof document !==
      "undefined" &&

      document.body
    ){

      document.body.classList.add(
        "app-error"
      );

    }

    hideLoadingScreen();

    safeLogError(

      getSafeErrorMessage(
        error
      )

    );

    await emitAppEvent(

      "app.error",

      {

        error:
        getSafeErrorMessage(
          error
        )

      }

    );

    if(

      APP_CORE_CONFIG
      .ENABLE_RECOVERY

    ){

      await recoverApplication();

    }

    return false;

  }

  finally{

    appState.booting =
    false;

    appState.starting =
    false;

  }

}



// =====================================
// SHUTDOWN APP
// =====================================

async function shutdownApp(){

  if(
    appState.shuttingDown
  ){

    return false;

  }

  appState.shuttingDown =
  true;

  updateAppPhase(
    APP_PHASES.SHUTTING_DOWN
  );

  await emitAppEvent(
    "app.shutdown"
  );

  try{

    cleanupApp();

    stopHealthchecks();

    appState.started =
    false;

    appState.ready =
    false;

    appState.shutdownAt =
    Date.now();

    return true;

  }

  catch(error){

    setAppError(
      error
    );

    return false;

  }

  finally{

    appState.shuttingDown =
    false;

  }

}



// =====================================
// APP DIAGNOSTICS
// =====================================

function getAppDiagnostics(){

  return Object.freeze({

    initialized:
    appState.initialized,

    started:
    appState.started,

    phase:
    appState.phase,

    startupDuration:
    appState.startupDuration,

    crashCount:
    appState.crashCount,

    failedStarts:
    appState.failedStarts,

    recoveryAttempts:
    appState.recoveryAttempts,

    activeModules:[

      ...appState
      .activeModules

    ],

    failedModules:[

      ...appState
      .failedModules

    ],

    dependencyDiagnostics:
    getDependencyDiagnostics(),

    lastError:

      appState.lastError

      ? getSafeErrorMessage(
          appState.lastError
        )

      : null

  });

}
