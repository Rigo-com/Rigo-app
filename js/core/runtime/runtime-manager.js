// =====================================
// RIGO AI
// RUNTIME MANAGER
// ENTERPRISE PLATFORM FINAL
// =====================================



// =====================================
// RUNTIME CONFIG
// =====================================

const RUNTIME_MANAGER_CONFIG =
Object.freeze({

  ENABLE_HEALTH_SYNC:true,

  ENABLE_RECOVERY:true,

  ENABLE_STARTUP_QUEUE:true,

  ENABLE_SHUTDOWN_COORDINATION:true,

  ENABLE_DIAGNOSTICS:true,

  ENABLE_BOOT_PROTECTION:true,

  MAX_BOOT_RETRIES:
  3,

  MAX_RUNTIME_ERRORS:
  20,

  STARTUP_TIMEOUT:
  30000,

  SHUTDOWN_TIMEOUT:
  15000

});



// =====================================
// EXECUTE BOOT STEP
// =====================================

async function executeBootStep(
  step
){

  if(
    !step ||
    typeof step.initialize !==
    "function"
  ){

    return false;

  }

  try{

    const result =
    await Promise.race([

      Promise.resolve(
        step.initialize()
      ),

      new Promise((_,reject) => {

        setTimeout(() => {

          reject(

            new Error(
              "BOOT STEP TIMEOUT"
            )

          );

        },

        RUNTIME_MANAGER_CONFIG
        .STARTUP_TIMEOUT);

      })

    ]);

    if(!result){

      throw new Error(
        "BOOT STEP FAILED"
      );

    }

    runtimeManagerState
    .diagnostics
    .synchronizedSystems++;

    return true;

  }

  catch(error){

    addRuntimeError(
      error
    );

    if(
      typeof logDiagnosticError ===
      "function"
    ){

      logDiagnosticError(

        "RUNTIME BOOT STEP FAILED",

        {

          step:
          step.name,

          error:
          String(error)

        }

      );

    }

    return false;

  }

}



// =====================================
// BOOT RUNTIME
// =====================================

async function bootRuntimeManager(){

  if(
    runtimeManagerState
    .booting
  ){

    return false;

  }

  runtimeManagerState
  .booting =
  true;

  runtimeManagerState
  .startedAt =
  Date.now();

  setRuntimeState(
    RUNTIME_STATES
    .BOOTING
  );

  runtimeManagerState
  .diagnostics
  .boots++;

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(

      RUNTIME_EVENTS
      .BOOT_STARTED

    );

  }

  try{

    const bootSequence =
    createRuntimeBootSequence();

    for(
      const step
      of bootSequence
    ){

      const success =
      await executeBootStep(
        step
      );

      if(
        !success &&
        step.critical === true
      ){

        throw new Error(

          "BOOT SEQUENCE FAILED"

        );

      }

    }

    runtimeManagerState
    .bootCompletedAt =
    Date.now();

    setRuntimeState(
      RUNTIME_STATES
      .READY
    );

    if(
      typeof emitSystemEvent ===
      "function"
    ){

      await emitSystemEvent(

        RUNTIME_EVENTS
        .BOOT_COMPLETED

      );

    }

    return true;

  }

  catch(error){

    runtimeManagerState
    .diagnostics
    .failures++;

    setRuntimeState(
      RUNTIME_STATES
      .FAILED
    );

    addRuntimeError(
      error
    );

    if(

      RUNTIME_MANAGER_CONFIG
      .ENABLE_RECOVERY &&

      runtimeManagerState
      .bootRetries <

      RUNTIME_MANAGER_CONFIG
      .MAX_BOOT_RETRIES

    ){

      runtimeManagerState
      .bootRetries++;

      return recoverRuntimeManager();

    }

    if(
      typeof emitSystemEvent ===
      "function"
    ){

      await emitSystemEvent(

        RUNTIME_EVENTS
        .BOOT_FAILED,

        {

          error:
          String(error)

        }

      );

    }

    return false;

  }

  finally{

    runtimeManagerState
    .booting =
    false;

  }

}



// =====================================
// RECOVERY
// =====================================

async function recoverRuntimeManager(){

  if(
    runtimeManagerState
    .recovering
  ){

    return false;

  }

  runtimeManagerState
  .recovering =
  true;

  runtimeManagerState
  .lastRecoveryAt =
  Date.now();

  setRuntimeState(
    RUNTIME_STATES
    .RECOVERING
  );

  runtimeManagerState
  .diagnostics
  .recoveries++;

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(

      RUNTIME_EVENTS
      .RECOVERY_STARTED

    );

  }

  try{

    await shutdownRuntimeManager();

    const rebooted =
    await bootRuntimeManager();

    if(!rebooted){

      throw new Error(
        "RUNTIME RECOVERY FAILED"
      );

    }

    if(
      typeof emitSystemEvent ===
      "function"
    ){

      await emitSystemEvent(

        RUNTIME_EVENTS
        .RECOVERY_COMPLETED

      );

    }

    return true;

  }

  catch(error){

    addRuntimeError(
      error
    );

    runtimeManagerState
    .diagnostics
    .failures++;

    return false;

  }

  finally{

    runtimeManagerState
    .recovering =
    false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownRuntimeManager(){

  if(
    runtimeManagerState
    .shuttingDown
  ){

    return false;

  }

  runtimeManagerState
  .shuttingDown =
  true;

  runtimeManagerState
  .lastShutdownAt =
  Date.now();

  setRuntimeState(
    RUNTIME_STATES
    .SHUTTING_DOWN
  );

  runtimeManagerState
  .diagnostics
  .shutdowns++;

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(

      RUNTIME_EVENTS
      .SHUTDOWN_STARTED

    );

  }

  try{

    await Promise.race([

      Promise.resolve(
        resetModuleLoader()
      ),

      new Promise((_,reject) => {

        setTimeout(() => {

          reject(

            new Error(
              "MODULE SHUTDOWN TIMEOUT"
            )

          );

        },

        RUNTIME_MANAGER_CONFIG
        .SHUTDOWN_TIMEOUT);

      })

    ]);

    await resetDependencyContainer();

    await resetStateManager();

    resetDiagnosticsSystem();

    resetSystemEvents();

    setRuntimeState(
      RUNTIME_STATES
      .IDLE
    );

    if(
      typeof emitSystemEvent ===
      "function"
    ){

      await emitSystemEvent(

        RUNTIME_EVENTS
        .SHUTDOWN_COMPLETED

      );

    }

    return true;

  }

  catch(error){

    addRuntimeError(
      error
    );

    runtimeManagerState
    .diagnostics
    .failures++;

    setRuntimeState(
      RUNTIME_STATES
      .FAILED
    );

    return false;

  }

  finally{

    runtimeManagerState
    .shuttingDown =
    false;

  }

}



// =====================================
// HEALTH REPORT
// =====================================

function getRuntimeHealthReport(){

  return freezeRuntimeObject({

    initialized:
    runtimeManagerState
    .initialized,

    runtimeState:

      runtimeManagerState
      .runtimeState,

    booting:
    runtimeManagerState
    .booting,

    recovering:
    runtimeManagerState
    .recovering,

    shuttingDown:

      runtimeManagerState
      .shuttingDown,

    diagnostics:

      runtimeManagerState
      .diagnostics,

    runtimeErrors:[

      ...runtimeManagerState
      .runtimeErrors

    ],

    startedAt:
    runtimeManagerState
    .startedAt,

    bootCompletedAt:

      runtimeManagerState
      .bootCompletedAt,

    lastRecoveryAt:

      runtimeManagerState
      .lastRecoveryAt,

    lastShutdownAt:

      runtimeManagerState
      .lastShutdownAt

  });

}



// =====================================
// INITIALIZE
// =====================================

async function initializeRuntimeManager(){

  if(
    runtimeManagerState
    .initialized
  ){

    return true;

  }

  runtimeManagerState
  .initialized =
  true;

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(

      RUNTIME_EVENTS
      .INITIALIZED

    );

  }

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const RuntimeManager =
Object.freeze({

  initialize:
  initializeRuntimeManager,

  boot:
  bootRuntimeManager,

  recover:
  recoverRuntimeManager,

  shutdown:
  shutdownRuntimeManager,

  health:
  getRuntimeHealthReport

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.RuntimeManager =
  RuntimeManager;

  window.initializeRuntimeManager =
  initializeRuntimeManager;

}
