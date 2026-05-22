// =====================================
// RIGO AI
// APP CORE
// ENTERPRISE INFINITY GOD FINAL
// =====================================



// =====================================
// APP CONFIG
// =====================================

const APP_CORE_CONFIG =
Object.freeze({

  STARTUP_TIMEOUT:
  30000,

  MAX_RECOVERY_ATTEMPTS:
  3,

  ENABLE_DIAGNOSTICS:true,

  ENABLE_HEALTHCHECKS:true,

  ENABLE_RECOVERY:true,

  ENABLE_SYSTEM_EVENTS:true,

  HEALTHCHECK_INTERVAL:
  60000,

  DEPENDENCY_TIMEOUT:
  15000

});



// =====================================
// APP PHASES
// =====================================

const APP_PHASES =
Object.freeze({

  IDLE:"idle",

  PREINIT:"preinit",

  INITIALIZING:"initializing",

  BOOTING:"booting",

  READY:"ready",

  RECOVERING:"recovering",

  SHUTTING_DOWN:"shutting_down",

  ERROR:"error"

});



// =====================================
// APP STATE
// =====================================

const appState =
Object.seal({

  initialized:false,

  started:false,

  starting:false,

  shuttingDown:false,

  recovering:false,

  crashed:false,

  phase:
  APP_PHASES.IDLE,

  initializedAt:null,

  startupStartedAt:null,

  startupCompletedAt:null,

  shutdownAt:null,

  lastError:null,

  recoveryAttempts:0,

  failedStarts:0,

  crashCount:0,

  startupDuration:0,

  activeModules:
  new Set(),

  failedModules:
  new Set(),

  healthcheckTimer:null

});



// =====================================
// DEPENDENCY REGISTRY
// =====================================

const appDependencyRegistry =
Object.seal({

  dependencies:
  new Map(),

  resolved:
  new Set(),

  failed:
  new Set(),

  waiting:
  new Map()

});



// =====================================
// REGISTER DEPENDENCY
// =====================================

function registerDependency(
  dependencyName,
  resolver = null
){

  const normalizedName =
  String(
    dependencyName || ""
  )
  .trim()
  .toLowerCase();

  if(!normalizedName){

    return false;

  }

  appDependencyRegistry
  .dependencies
  .set(

    normalizedName,

    {

      name:
      normalizedName,

      resolver,

      registeredAt:
      Date.now()

    }

  );

  return true;

}



// =====================================
// RESOLVE DEPENDENCY
// =====================================

function resolveDependency(
  dependencyName
){

  const normalizedName =
  String(
    dependencyName || ""
  )
  .trim()
  .toLowerCase();

  if(!normalizedName){

    return false;

  }

  appDependencyRegistry
  .resolved
  .add(
    normalizedName
  );

  const waitingResolvers =

    appDependencyRegistry
    .waiting
    .get(
      normalizedName
    );

  if(
    waitingResolvers
  ){

    waitingResolvers
    .forEach((resolve) => {

      try{

        resolve(true);

      }

      catch(error){}

    });

    appDependencyRegistry
    .waiting
    .delete(
      normalizedName
    );

  }

  return true;

}



// =====================================
// FAIL DEPENDENCY
// =====================================

function failDependency(
  dependencyName
){

  const normalizedName =
  String(
    dependencyName || ""
  )
  .trim()
  .toLowerCase();

  if(!normalizedName){

    return false;

  }

  appDependencyRegistry
  .failed
  .add(
    normalizedName
  );

  return true;

}



// =====================================
// CHECK DEPENDENCY
// =====================================

function isDependencyResolved(
  dependencyName
){

  return appDependencyRegistry
  .resolved
  .has(

    String(
      dependencyName || ""
    )
    .trim()
    .toLowerCase()

  );

}



// =====================================
// WAIT FOR DEPENDENCY
// =====================================

async function waitForDependency(
  dependencyName,
  timeout =
  APP_CORE_CONFIG
  .DEPENDENCY_TIMEOUT
){

  const normalizedName =
  String(
    dependencyName || ""
  )
  .trim()
  .toLowerCase();

  if(!normalizedName){

    return false;

  }

  if(

    isDependencyResolved(
      normalizedName
    )

  ){

    return true;

  }

  return new Promise((resolve) => {

    if(

      !appDependencyRegistry
      .waiting
      .has(
        normalizedName
      )

    ){

      appDependencyRegistry
      .waiting
      .set(

        normalizedName,

        new Set()

      );

    }

    appDependencyRegistry
    .waiting
    .get(
      normalizedName
    )
    .add(
      resolve
    );

    setTimeout(() => {

      resolve(false);

    },

    timeout);

  });

}



// =====================================
// VALIDATE DEPENDENCIES
// =====================================

async function validateDependencyRegistry(){

  const dependencies = [

    ...appDependencyRegistry
    .dependencies
    .values()

  ];

  for(
    const dependency
    of dependencies
  ){

    try{

      if(

        typeof dependency
        .resolver ===
        "function"

      ){

        const resolved =
        await dependency
        .resolver();

        if(resolved){

          resolveDependency(
            dependency.name
          );

        }

        else{

          failDependency(
            dependency.name
          );

          return false;

        }

      }

    }

    catch(error){

      failDependency(
        dependency.name
      );

      return false;

    }

  }

  return true;

}



// =====================================
// DEPENDENCY DIAGNOSTICS
// =====================================

function getDependencyDiagnostics(){

  return {

    registered:

      appDependencyRegistry
      .dependencies
      .size,

    resolved:[

      ...appDependencyRegistry
      .resolved

    ],

    failed:[

      ...appDependencyRegistry
      .failed

    ],

    waiting:

      appDependencyRegistry
      .waiting
      .size

  };

}



// =====================================
// SAFE LOGGER
// =====================================

function safeLogInfo(
  ...args
){

  try{

    console.log(
      "[RIGO AI]:",
      ...args
    );

  }

  catch(error){

    console.log(error);

  }

}



function safeLogError(
  ...args
){

  try{

    console.error(
      "[RIGO AI]:",
      ...args
    );

  }

  catch(error){

    console.error(error);

  }

}



// =====================================
// APP STATUS
// =====================================

function updateAppPhase(
  phase
){

  appState.phase =
  phase;

  return true;

}



// =====================================
// SYSTEM EVENTS
// =====================================

async function emitAppEvent(
  eventName,
  payload = {}
){

  if(

    typeof emitSystemEvent !==
    "function"

  ){

    return false;

  }

  try{

    await emitSystemEvent(

      eventName,

      {

        source:"app",

        phase:
        appState.phase,

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// DOM INITIALIZATION
// =====================================

function initializeDOMElements(){

  if(
    typeof document ===
    "undefined"
  ){

    return false;

  }

  messageInput =
  document.getElementById(
    "messageInput"
  );

  sendButton =
  document.getElementById(
    "sendButton"
  );

  chatContainer =
  document.getElementById(
    "chatContainer"
  );

  return (

    Boolean(messageInput) &&

    Boolean(sendButton) &&

    Boolean(chatContainer)

  );

}



// =====================================
// MODULE REGISTRY
// =====================================

function registerAppModule(
  moduleName
){

  const normalizedName =
  String(
    moduleName || ""
  )
  .trim();

  if(!normalizedName){

    return false;

  }

  appState.activeModules
  .add(
    normalizedName
  );

  return true;

}



function markModuleFailed(
  moduleName
){

  const normalizedName =
  String(
    moduleName || ""
  )
  .trim();

  if(!normalizedName){

    return false;

  }

  appState.failedModules
  .add(
    normalizedName
  );

  return true;

}



// =====================================
// HEALTH CHECK
// =====================================

function runAppHealthcheck(){

  try{

    const domHealthy =

      typeof document !==
      "undefined";

    const modulesHealthy =

      appState.failedModules
      .size <= 0;

    const appHealthy =

      domHealthy &&

      modulesHealthy &&

      appState.started;

    if(!appHealthy){

      appState.crashed =
      true;

      appState.crashCount++;

    }

    return {

      healthy:
      appHealthy,

      domHealthy,

      modulesHealthy,

      activeModules:

        appState.activeModules
        .size,

      failedModules:

        appState.failedModules
        .size

    };

  }

  catch(error){

    appState.lastError =
    error;

    return {

      healthy:false

    };

  }

}



// =====================================
// START HEALTHCHECK
// =====================================

function startHealthchecks(){

  if(

    !APP_CORE_CONFIG
    .ENABLE_HEALTHCHECKS

  ){

    return false;

  }

  if(
    appState.healthcheckTimer
  ){

    clearInterval(

      appState
      .healthcheckTimer

    );

  }

  appState.healthcheckTimer =
  setInterval(() => {

    runAppHealthcheck();

  },

  APP_CORE_CONFIG
  .HEALTHCHECK_INTERVAL);

  return true;

}



// =====================================
// STOP HEALTHCHECKS
// =====================================

function stopHealthchecks(){

  if(
    appState.healthcheckTimer
  ){

    clearInterval(

      appState
      .healthcheckTimer

    );

    appState.healthcheckTimer =
    null;

  }

  return true;

}



// =====================================
// APP RECOVERY
// =====================================

async function recoverApplication(){

  if(

    !APP_CORE_CONFIG
    .ENABLE_RECOVERY

  ){

    return false;

  }

  if(
    appState.recovering
  ){

    return false;

  }

  if(

    appState.recoveryAttempts >=

    APP_CORE_CONFIG
    .MAX_RECOVERY_ATTEMPTS

  ){

    return false;

  }

  appState.recovering =
  true;

  appState.recoveryAttempts++;

  updateAppPhase(
    APP_PHASES.RECOVERING
  );

  await emitAppEvent(
    "app.recovering"
  );

  try{

    cleanupApp();

    const restarted =
    await startApp();

    if(!restarted){

      return false;

    }

    appState.crashed =
    false;

    return true;

  }

  catch(error){

    appState.lastError =
    error;

    return false;

  }

  finally{

    appState.recovering =
    false;

  }

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

    appState.lastError =
    error;

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

    appState.lastError =
    error;

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

    appState.shutdownAt =
    Date.now();

    return true;

  }

  catch(error){

    appState.lastError =
    error;

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

  return {

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

  };

}



// =====================================
// APP INIT
// =====================================

if(
  typeof document !==
  "undefined"
){

  if(
    document.readyState ===
    "loading"
  ){

    document.addEventListener(

      "DOMContentLoaded",

      () => {

        startApp()
        .catch((error) => {

          safeLogError(error);

        });

      },

      { once:true }

    );

  }

  else{

    startApp()
    .catch((error) => {

      safeLogError(error);

    });

  }

}
