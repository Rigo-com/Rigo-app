// =====================================
// RIGO AI
// BOOTSTRAP MANAGER
// BOOTABLE AI PLATFORM FINAL
// =====================================



// =====================================
// BOOTSTRAP CONFIG
// =====================================

const BOOTSTRAP_CONFIG =
Object.freeze({

  ENABLE_BOOT_LOGS:true,

  ENABLE_HEALTH_VALIDATION:true,

  ENABLE_RECOVERY:true,

  ENABLE_SAFE_SHUTDOWN:true,

  ENABLE_DEPENDENCY_GRAPH:true,

  ENABLE_BOOT_DIAGNOSTICS:true,

  ENABLE_PRELOADS:true,

  ENABLE_STARTUP_VALIDATION:true,

  MAX_BOOT_RETRIES:
  3,

  BOOT_TIMEOUT:
  120000

});



// =====================================
// BOOT STATES
// =====================================

const BOOTSTRAP_STATES =
Object.freeze({

  IDLE:"idle",

  PREPARING:"preparing",

  BOOTING:"booting",

  INITIALIZING:"initializing",

  VALIDATING:"validating",

  READY:"ready",

  RECOVERING:"recovering",

  FAILED:"failed",

  SHUTDOWN:"shutdown"

});



// =====================================
// BOOT EVENTS
// =====================================

const BOOTSTRAP_EVENTS =
Object.freeze({

  BOOT_STARTED:
  "bootstrap.started",

  BOOT_COMPLETED:
  "bootstrap.completed",

  BOOT_FAILED:
  "bootstrap.failed",

  SYSTEM_INITIALIZED:
  "bootstrap.system.initialized",

  VALIDATION_COMPLETED:
  "bootstrap.validation.completed",

  RECOVERY_STARTED:
  "bootstrap.recovery.started",

  RECOVERY_COMPLETED:
  "bootstrap.recovery.completed",

  SHUTDOWN_STARTED:
  "bootstrap.shutdown.started",

  SHUTDOWN_COMPLETED:
  "bootstrap.shutdown.completed"

});



// =====================================
// BOOTSTRAP STATE
// =====================================

const bootstrapState =
Object.seal({

  initialized:false,

  booting:false,

  shuttingDown:false,

  recovering:false,

  state:
  BOOTSTRAP_STATES
  .IDLE,

  initializedSystems:
  new Set(),

  failedSystems:
  new Set(),

  dependencyGraph:
  new Map(),

  diagnostics:{

    boots:0,

    failures:0,

    recoveries:0,

    validations:0,

    initializedSystems:0,

    shutdowns:0

  },

  startedAt:null,

  completedAt:null,

  lastError:null,

  bootRetries:0

});



// =====================================
// HELPERS
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

  visited.add(value);

  Object.freeze(value);

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



function cloneBootstrapDiagnostics(){

  return freezeBootstrapObject({

    ...bootstrapState
    .diagnostics

  });

}



function setBootstrapState(
  state
){

  bootstrapState
  .state =
  state;

  return true;

}



async function emitBootstrapEvent(
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

        source:
        "bootstrap-manager",

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



function safeBootstrapLog(
  ...args
){

  if(
    !BOOTSTRAP_CONFIG
    .ENABLE_BOOT_LOGS
  ){

    return false;

  }

  try{

    console.log(
      "[BOOTSTRAP]:",
      ...args
    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// DEPENDENCY GRAPH
// =====================================

function buildDependencyGraph(){

  bootstrapState
  .dependencyGraph
  .clear();

  bootstrapState
  .dependencyGraph
  .set(

    "core",

    [

      "diagnostics",
      "events",
      "state"

    ]

  );

  bootstrapState
  .dependencyGraph
  .set(

    "ai",

    [

      "agents",
      "context",
      "tools",
      "planner",
      "workflows",
      "kernel"

    ]

  );

  bootstrapState
  .dependencyGraph
  .set(

    "bridges",

    [

      "runtime-bridge"

    ]

  );

  return true;

}



// =====================================
// VALIDATION
// =====================================

function validateBootstrapSystems(){

  return (

    typeof initializeDiagnosticsSystem ===
    "function"

    &&

    typeof initializeSystemEvents ===
    "function"

    &&

    typeof RuntimeManager
    ?.initialize ===
    "function"

    &&

    typeof AgentManager
    ?.initialize ===
    "function"

    &&

    typeof ContextManager
    ?.initialize ===
    "function"

    &&

    typeof ToolExecutor
    ?.initialize ===
    "function"

    &&

    typeof WorkflowEngine
    ?.initialize ===
    "function"

    &&

    typeof PlannerEngine
    ?.initialize ===
    "function"

    &&

    typeof AIKernel
    ?.initialize ===
    "function"

    &&

    typeof AIRuntimeBridge
    ?.initialize ===
    "function"

  );

}



// =====================================
// SYSTEM INITIALIZATION
// =====================================

async function initializeBootstrapSystems(){

  const systems = [

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
      name:"runtime",
      initialize:
      RuntimeManager
      ?.initialize
    },

    {
      name:"agents",
      initialize:
      AgentManager
      ?.initialize
    },

    {
      name:"contexts",
      initialize:
      ContextManager
      ?.initialize
    },

    {
      name:"tools",
      initialize:
      ToolExecutor
      ?.initialize
    },

    {
      name:"planner",
      initialize:
      PlannerEngine
      ?.initialize
    },

    {
      name:"workflows",
      initialize:
      WorkflowEngine
      ?.initialize
    },

    {
      name:"kernel",
      initialize:
      AIKernel
      ?.initialize
    },

    {
      name:"bridge",
      initialize:
      AIRuntimeBridge
      ?.initialize
    }

  ];

  for(
    const system
    of systems
  ){

    try{

      if(
        typeof system.initialize !==
        "function"
      ){

        continue;

      }

      await system.initialize();

      bootstrapState
      .initializedSystems
      .add(system.name);

      bootstrapState
      .failedSystems
      .delete(system.name);

      bootstrapState
      .diagnostics
      .initializedSystems++;

      await emitBootstrapEvent(

        BOOTSTRAP_EVENTS
        .SYSTEM_INITIALIZED,

        {
          system:
          system.name
        }

      );

      safeBootstrapLog(
        "INITIALIZED:",
        system.name
      );

    }

    catch(error){

      bootstrapState
      .failedSystems
      .add(system.name);

      bootstrapState
      .lastError =
      error;

      throw error;

    }

  }

  return true;

}



// =====================================
// HEALTH VALIDATION
// =====================================

async function validateBootHealth(){

  if(
    !BOOTSTRAP_CONFIG
    .ENABLE_HEALTH_VALIDATION
  ){

    return true;

  }

  try{

    const kernelHealth =
    AIKernel
    ?.health?.();

    const bridgeHealth =
    AIRuntimeBridge
    ?.diagnostics?.();

    const healthy = (

      kernelHealth &&
      bridgeHealth

    );

    if(!healthy){

      throw new Error(
        "BOOT HEALTH VALIDATION FAILED"
      );

    }

    bootstrapState
    .diagnostics
    .validations++;

    await emitBootstrapEvent(
      BOOTSTRAP_EVENTS
      .VALIDATION_COMPLETED
    );

    return true;

  }

  catch(error){

    bootstrapState
    .lastError =
    error;

    return false;

  }

}



// =====================================
// PRELOADS
// =====================================

async function executeBootPreloads(){

  if(
    !BOOTSTRAP_CONFIG
    .ENABLE_PRELOADS
  ){

    return true;

  }

  try{

    if(
      typeof MemorySystem !==
      "undefined"
    ){

      await MemorySystem
      ?.initialize?.();

    }

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// BOOT SYSTEM
// =====================================

async function bootRigoPlatform(
  options = {}
){

  const recoveryMode =
  options.recovery ===
  true;

  if(
    bootstrapState.booting
  ){

    return false;

  }

  bootstrapState
  .booting =
  true;

  bootstrapState
  .startedAt =
  Date.now();

  bootstrapState
  .diagnostics
  .boots++;

  setBootstrapState(
    BOOTSTRAP_STATES
    .PREPARING
  );

  await emitBootstrapEvent(
    BOOTSTRAP_EVENTS
    .BOOT_STARTED
  );

  let timeoutId = null;

  try{

    buildDependencyGraph();

    const systemsValid =
    validateBootstrapSystems();

    if(!systemsValid){

      throw new Error(
        "INVALID_BOOTSTRAP_SYSTEMS"
      );

    }

    await executeBootPreloads();

    setBootstrapState(
      BOOTSTRAP_STATES
      .INITIALIZING
    );

    await Promise.race([

      initializeBootstrapSystems(),

      new Promise((_,reject) => {

        timeoutId =
        setTimeout(() => {

          reject(

            new Error(
              "BOOTSTRAP TIMEOUT"
            )

          );

        },

        BOOTSTRAP_CONFIG
        .BOOT_TIMEOUT);

      })

    ]);

    setBootstrapState(
      BOOTSTRAP_STATES
      .VALIDATING
    );

    const valid =
    await validateBootHealth();

    if(!valid){

      throw new Error(
        "BOOT VALIDATION FAILED"
      );

    }

    bootstrapState
    .completedAt =
    Date.now();

    bootstrapState
    .initialized =
    true;

    bootstrapState
    .bootRetries =
    0;

    setBootstrapState(
      BOOTSTRAP_STATES
      .READY
    );

    await emitBootstrapEvent(
      BOOTSTRAP_EVENTS
      .BOOT_COMPLETED
    );

    safeBootstrapLog(
      "RIGO PLATFORM READY"
    );

    return true;

  }

  catch(error){

    bootstrapState
    .diagnostics
    .failures++;

    bootstrapState
    .lastError =
    error;

    setBootstrapState(
      BOOTSTRAP_STATES
      .FAILED
    );

    await emitBootstrapEvent(

      BOOTSTRAP_EVENTS
      .BOOT_FAILED,

      {
        error:
        String(error)
      }

    );

    if(
      BOOTSTRAP_CONFIG
      .ENABLE_RECOVERY
      &&
      !recoveryMode
    ){

      await recoverBootstrap();

    }

    return false;

  }

  finally{

    if(timeoutId){

      clearTimeout(
        timeoutId
      );

    }

    bootstrapState
    .booting =
    false;

  }

}



// =====================================
// RECOVERY
// =====================================

async function recoverBootstrap(){

  if(
    bootstrapState.recovering
  ){

    return false;

  }

  bootstrapState
  .recovering =
  true;

  bootstrapState
  .diagnostics
  .recoveries++;

  bootstrapState
  .bootRetries++;

  if(

    bootstrapState
    .bootRetries >

    BOOTSTRAP_CONFIG
    .MAX_BOOT_RETRIES

  ){

    setBootstrapState(
      BOOTSTRAP_STATES
      .FAILED
    );

    bootstrapState
    .recovering =
    false;

    return false;

  }

  bootstrapState
  .initializedSystems
  .clear();

  bootstrapState
  .failedSystems
  .clear();

  setBootstrapState(
    BOOTSTRAP_STATES
    .RECOVERING
  );

  await emitBootstrapEvent(
    BOOTSTRAP_EVENTS
    .RECOVERY_STARTED
  );

  try{

    await AIKernel
    ?.recover?.();

    await AIRuntimeBridge
    ?.recover?.();

    const rebooted =
    await bootRigoPlatform({

      recovery:true

    });

    if(!rebooted){

      return false;

    }

    await emitBootstrapEvent(
      BOOTSTRAP_EVENTS
      .RECOVERY_COMPLETED
    );

    return true;

  }

  catch(error){

    bootstrapState
    .lastError =
    error;

    setBootstrapState(
      BOOTSTRAP_STATES
      .FAILED
    );

    return false;

  }

  finally{

    bootstrapState
    .recovering =
    false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownRigoPlatform(){

  if(
    bootstrapState
    .shuttingDown
  ){

    return false;

  }

  bootstrapState
  .shuttingDown =
  true;

  bootstrapState
  .diagnostics
  .shutdowns++;

  setBootstrapState(
    BOOTSTRAP_STATES
    .SHUTDOWN
  );

  await emitBootstrapEvent(
    BOOTSTRAP_EVENTS
    .SHUTDOWN_STARTED
  );

  try{

    await AIRuntimeBridge
    ?.reset?.();

    await AIKernel
    ?.reset?.();

    await WorkflowEngine
    ?.reset?.();

    await PlannerEngine
    ?.reset?.();

    await ToolExecutor
    ?.reset?.();

    bootstrapState
    .initializedSystems
    .clear();

    bootstrapState
    .failedSystems
    .clear();

    bootstrapState
    .dependencyGraph
    .clear();

    bootstrapState
    .initialized =
    false;

    bootstrapState
    .completedAt =
    null;

    bootstrapState
    .startedAt =
    null;

    bootstrapState
    .lastError =
    null;

    setBootstrapState(
      BOOTSTRAP_STATES
      .IDLE
    );

    await emitBootstrapEvent(
      BOOTSTRAP_EVENTS
      .SHUTDOWN_COMPLETED
    );

    return true;

  }

  catch(error){

    bootstrapState
    .lastError =
    error;

    setBootstrapState(
      BOOTSTRAP_STATES
      .FAILED
    );

    return false;

  }

  finally{

    bootstrapState
    .shuttingDown =
    false;

  }

}



// =====================================
// DIAGNOSTICS
// =====================================

function getBootstrapDiagnostics(){

  return freezeBootstrapObject({

    initialized:
    bootstrapState
    .initialized,

    state:
    bootstrapState
    .state,

    booting:
    bootstrapState
    .booting,

    recovering:
    bootstrapState
    .recovering,

    shuttingDown:
    bootstrapState
    .shuttingDown,

    initializedSystems:[

      ...bootstrapState
      .initializedSystems

    ],

    failedSystems:[

      ...bootstrapState
      .failedSystems

    ],

    diagnostics:
    cloneBootstrapDiagnostics(),

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
// RESET
// =====================================

async function resetBootstrapManager(){

  bootstrapState
  .initializedSystems
  .clear();

  bootstrapState
  .failedSystems
  .clear();

  bootstrapState
  .dependencyGraph
  .clear();

  bootstrapState
  .diagnostics = {

    boots:0,

    failures:0,

    recoveries:0,

    validations:0,

    initializedSystems:0,

    shutdowns:0

  };

  bootstrapState
  .lastError =
  null;

  bootstrapState
  .initialized =
  false;

  bootstrapState
  .booting =
  false;

  bootstrapState
  .shuttingDown =
  false;

  bootstrapState
  .recovering =
  false;

  bootstrapState
  .startedAt =
  null;

  bootstrapState
  .completedAt =
  null;

  bootstrapState
  .bootRetries =
  0;

  setBootstrapState(
    BOOTSTRAP_STATES
    .IDLE
  );

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const BootstrapManager =
Object.freeze({

  boot:
  bootRigoPlatform,

  recover:
  recoverBootstrap,

  shutdown:
  shutdownRigoPlatform,

  diagnostics:
  getBootstrapDiagnostics,

  reset:
  resetBootstrapManager

});
