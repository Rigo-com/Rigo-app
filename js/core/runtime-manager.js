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
// RUNTIME STATES
// =====================================

const RUNTIME_STATES =
Object.freeze({

  IDLE:"idle",

  BOOTING:"booting",

  READY:"ready",

  RECOVERING:"recovering",

  SHUTTING_DOWN:"shutting_down",

  FAILED:"failed"

});



// =====================================
// RUNTIME EVENTS
// =====================================

const RUNTIME_EVENTS =
Object.freeze({

  INITIALIZED:
  "runtime.initialized",

  BOOT_STARTED:
  "runtime.boot.started",

  BOOT_COMPLETED:
  "runtime.boot.completed",

  BOOT_FAILED:
  "runtime.boot.failed",

  RECOVERY_STARTED:
  "runtime.recovery.started",

  RECOVERY_COMPLETED:
  "runtime.recovery.completed",

  SHUTDOWN_STARTED:
  "runtime.shutdown.started",

  SHUTDOWN_COMPLETED:
  "runtime.shutdown.completed"

});



// =====================================
// RUNTIME STATE
// =====================================

const runtimeManagerState =
Object.seal({

  initialized:false,

  booting:false,

  shuttingDown:false,

  recovering:false,

  runtimeState:
  RUNTIME_STATES
  .IDLE,

  startupQueue:[],

  runtimeErrors:[],

  bootRetries:0,

  diagnostics:{

    boots:0,

    recoveries:0,

    shutdowns:0,

    failures:0,

    synchronizedSystems:0

  },

  startedAt:null,

  bootCompletedAt:null,

  lastRecoveryAt:null,

  lastShutdownAt:null

});



// =====================================
// HELPERS
// =====================================

function freezeRuntimeObject(
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

      freezeRuntimeObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



function setRuntimeState(
  runtimeState
){

  runtimeManagerState
  .runtimeState =
  runtimeState;

  return true;

}



function addRuntimeError(
  error
){

  runtimeManagerState
  .runtimeErrors
  .push({

    error:
    String(error),

    timestamp:
    Date.now()

  });

  if(

    runtimeManagerState
    .runtimeErrors
    .length >

    RUNTIME_MANAGER_CONFIG
    .MAX_RUNTIME_ERRORS

  ){

    runtimeManagerState
    .runtimeErrors
    .shift();

  }

  return true;

}



// =====================================
// SYSTEM BOOT ORDER
// =====================================

function createRuntimeBootSequence(){

  return [

    {

      name:"diagnostics",

      initialize:
      initializeDiagnosticsSystem

    },

    {

      name:"events",

      initialize:
      initializeSystemEvents

    },

    {

      name:"state",

      initialize:
      initializeStateManager

    },

    {

      name:"container",

      initialize:
      initializeDependencyContainer

    },

    {

      name:"modules",

      initialize:
      initializeModuleLoader

    }

  ];

}



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

      if(!success){

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
