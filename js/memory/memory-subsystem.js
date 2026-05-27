// =====================================
// RIGO AI
// MEMORY SUBSYSTEM
// OPTIMIZED FINAL EDITION
// =====================================



// =====================================
// SUBSYSTEM CONFIG
// =====================================

const MEMORY_SUBSYSTEM_CONFIG =
Object.freeze({

  ENABLE_HEALTH_MONITOR:true,

  ENABLE_AUTO_RECOVERY:true,

  ENABLE_AUTO_SYNC:true,

  ENABLE_AUTO_EMBEDDINGS:true,

  ENABLE_AUTO_CLEANUP:true,

  ENABLE_SECURITY_CHECKS:true,

  STARTUP_TIMEOUT:
  15000,

  SHUTDOWN_TIMEOUT:
  10000,

  HEALTHCHECK_INTERVAL:
  60000

});



// =====================================
// SUBSYSTEM STATUS
// =====================================

const MEMORY_SUBSYSTEM_STATUS =
Object.freeze({

  IDLE:"idle",

  BOOTING:"booting",

  READY:"ready",

  DEGRADED:"degraded",

  FAILED:"failed",

  SHUTTING_DOWN:"shutting_down"

});



// =====================================
// SUBSYSTEM STATE
// =====================================

const memorySubsystemState =
Object.seal({

  initialized:false,

  initializing:false,

  shuttingDown:false,

  healthy:true,

  status:
  MEMORY_SUBSYSTEM_STATUS
  .IDLE,

  startupPromise:null,

  startupStartedAt:null,

  startupCompletedAt:null,

  shutdownStartedAt:null,

  shutdownCompletedAt:null,

  healthcheckTimer:null,

  subsystemVersion:
  MEMORY_VERSION

});



// =====================================
// HELPERS
// =====================================

async function executeSubsystemTask(
  task
){

  try{

    return await Promise.resolve(
      task?.()
    );

  }

  catch(error){

    registerMemoryRuntimeError?.(
      error
    );

    if(memoryState?.runtime){

      memoryState.runtime.lastError =
      error;

    }

    memorySubsystemState
    .healthy = false;

    memorySubsystemState
    .status =

    MEMORY_SUBSYSTEM_STATUS
    .FAILED;

    await emitSubsystemEvent(

      "memory.subsystem.failed",

      {
        error:error?.message
      }

    );

    return false;

  }

}



async function executeSubsystemTimeout(
  callback,
  timeout
){

  return Promise.race([

    Promise.resolve()
    .then(callback),

    new Promise((_,reject) => {

      setTimeout(() => {

        reject(
          new Error(
            "SUBSYSTEM_TIMEOUT"
          )
        );

      },

      timeout);

    })

  ]);

}



async function emitSubsystemEvent(
  eventName,
  payload = {}
){

  try{

    await emitMemoryEvent?.(
      eventName,
      payload
    );

  }

  catch(error){

    registerMemoryRuntimeError?.(
      error
    );

  }

}



// =====================================
// DEPENDENCY CHECK
// =====================================

function validateMemorySubsystem(){

  return [

    typeof memoryState ===
    "object",

    typeof initializeMemorySystem ===
    "function",

    typeof shutdownMemorySystem ===
    "function"

  ]
  .every(Boolean);

}



// =====================================
// READY
// =====================================

async function ensureSubsystemReady(){

  if(
    memorySubsystemState
    .initialized
  ){

    return true;

  }

  return initializeMemorySubsystem();

}



// =====================================
// SECURITY
// =====================================

async function initializeSubsystemSecurity(){

  return executeSubsystemTask(
    async() => {

      if(
        typeof memorySecurityState ===
        "object"
      ){

        memorySecurityState
        .initialized = true;

      }

      if(

        MEMORY_SUBSYSTEM_CONFIG
        .ENABLE_SECURITY_CHECKS

      ){

        await runMemoryIntegrityCheck?.();

      }

      return true;

    }
  );

}



// =====================================
// EMBEDDINGS
// =====================================

async function initializeSubsystemEmbeddings(){

  return executeSubsystemTask(
    async() => {

      if(

        !MEMORY_SUBSYSTEM_CONFIG
        .ENABLE_AUTO_EMBEDDINGS

      ){

        return true;

      }

      rebuildMemoryEmbeddings?.();

      if(
        typeof memoryEmbeddingsState ===
        "object"
      ){

        memoryEmbeddingsState
        .initialized = true;

      }

      return true;

    }
  );

}



// =====================================
// SYNC
// =====================================

async function initializeSubsystemSync(){

  return executeSubsystemTask(
    async() => {

      if(
        typeof memorySyncState ===
        "object"
      ){

        memorySyncState
        .initialized = true;

      }

      if(

        MEMORY_SUBSYSTEM_CONFIG
        .ENABLE_AUTO_SYNC

      ){

        startAutoMemorySync?.();

      }

      return true;

    }
  );

}



// =====================================
// HEALTH MONITOR
// =====================================

function startMemoryHealthMonitor(){

  stopMemoryHealthMonitor();

  if(

    !MEMORY_SUBSYSTEM_CONFIG
    .ENABLE_HEALTH_MONITOR

  ){

    return false;

  }

  memorySubsystemState
  .healthcheckTimer =
  setInterval(async() => {

    try{

      const report =
      await runMemoryHealthCheck?.();

      if(
        !report?.valid
      ){

        memorySubsystemState
        .healthy = false;

        memorySubsystemState
        .status =

        MEMORY_SUBSYSTEM_STATUS
        .DEGRADED;

        if(

          MEMORY_SUBSYSTEM_CONFIG
          .ENABLE_AUTO_RECOVERY

        ){

          await recoverMemorySubsystem();

        }

        return;
      }

      memorySubsystemState
      .healthy = true;

    }

    catch(error){

      registerMemoryRuntimeError?.(
        error
      );

    }

  },

  MEMORY_SUBSYSTEM_CONFIG
  .HEALTHCHECK_INTERVAL);

  return true;

}



function stopMemoryHealthMonitor(){

  if(
    memorySubsystemState
    .healthcheckTimer
  ){

    clearInterval(

      memorySubsystemState
      .healthcheckTimer

    );

    memorySubsystemState
    .healthcheckTimer =
    null;

  }

  return true;

}



// =====================================
// RECOVERY
// =====================================

async function recoverMemorySubsystem(){

  memorySubsystemState
  .status =

  MEMORY_SUBSYSTEM_STATUS
  .DEGRADED;

  return executeSubsystemTask(
    async() => {

      const recovered =
      await recoverMemoryStorage?.();

      if(!recovered){

        return false;

      }

      rebuildMemoryEmbeddings?.();

      await runMemoryIntegrityCheck?.();

      memorySubsystemState
      .healthy = true;

      memorySubsystemState
      .status =

      MEMORY_SUBSYSTEM_STATUS
      .READY;

      await emitSubsystemEvent(

        "memory.subsystem.recovered"

      );

      return true;

    }
  );

}



// =====================================
// INITIALIZE
// =====================================

async function initializeMemorySubsystem(){

  if(

    memorySubsystemState
    .startupPromise

  ){

    return memorySubsystemState
    .startupPromise;

  }

  memorySubsystemState
  .startupPromise =
  executeSubsystemTimeout(

    async() => {

      if(

        memorySubsystemState
        .initialized

      ){

        return true;

      }

      if(
        !validateMemorySubsystem()
      ){

        memorySubsystemState
        .status =

        MEMORY_SUBSYSTEM_STATUS
        .FAILED;

        return false;

      }

      memorySubsystemState
      .initializing = true;

      memorySubsystemState
      .status =

      MEMORY_SUBSYSTEM_STATUS
      .BOOTING;

      memorySubsystemState
      .startupStartedAt =
      Date.now();

      try{



        // ============================
        // CORE
        // ============================

        const initialized =
        await initializeMemorySystem();

        if(!initialized){

          return false;

        }



        // ============================
        // SECURITY
        // ============================

        await initializeSubsystemSecurity();



        // ============================
        // EMBEDDINGS
        // ============================

        await initializeSubsystemEmbeddings();



        // ============================
        // SYNC
        // ============================

        await initializeSubsystemSync();



        // ============================
        // CLEANUP
        // ============================

        if(

          MEMORY_SUBSYSTEM_CONFIG
          .ENABLE_AUTO_CLEANUP

        ){

          startAutoMemoryCleanup?.();

        }



        // ============================
        // HEALTH
        // ============================

        startMemoryHealthMonitor();



        // ============================
        // FINALIZE
        // ============================

        memorySubsystemState
        .initialized = true;

        memorySubsystemState
        .healthy = true;

        memorySubsystemState
        .status =

        MEMORY_SUBSYSTEM_STATUS
        .READY;

        memorySubsystemState
        .startupCompletedAt =
        Date.now();

        await emitSubsystemEvent(

          "memory.subsystem.initialized"

        );

        return true;

      }

      catch(error){

        registerMemoryRuntimeError?.(
          error
        );

        memorySubsystemState
        .healthy = false;

        memorySubsystemState
        .status =

        MEMORY_SUBSYSTEM_STATUS
        .FAILED;

        return false;

      }

      finally{

        memorySubsystemState
        .initializing = false;

      }

    },

    MEMORY_SUBSYSTEM_CONFIG
    .STARTUP_TIMEOUT

  );

  try{

    return await memorySubsystemState
    .startupPromise;

  }

  finally{

    memorySubsystemState
    .startupPromise = null;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownMemorySubsystem(){

  if(

    memorySubsystemState
    .shuttingDown

  ){

    return false;

  }

  memorySubsystemState
  .shuttingDown = true;

  memorySubsystemState
  .status =

  MEMORY_SUBSYSTEM_STATUS
  .SHUTTING_DOWN;

  memorySubsystemState
  .shutdownStartedAt =
  Date.now();

  try{

    stopMemoryHealthMonitor();

    stopAutoMemoryCleanup?.();

    stopAutoMemorySync?.();

    await syncMemoryCloud?.();

    await executeSubsystemTimeout(

      () => shutdownMemorySystem(),

      MEMORY_SUBSYSTEM_CONFIG
      .SHUTDOWN_TIMEOUT

    );

    memorySubsystemState
    .initialized = false;

    memorySubsystemState
    .healthy = false;

    memorySubsystemState
    .status =

    MEMORY_SUBSYSTEM_STATUS
    .IDLE;

    memorySubsystemState
    .shutdownCompletedAt =
    Date.now();

    await emitSubsystemEvent(

      "memory.subsystem.shutdown"

    );

    return true;

  }

  catch(error){

    registerMemoryRuntimeError?.(
      error
    );

    memorySubsystemState
    .status =

    MEMORY_SUBSYSTEM_STATUS
    .FAILED;

    return false;

  }

  finally{

    memorySubsystemState
    .shuttingDown = false;

  }

}



// =====================================
// RESTART
// =====================================

async function restartMemorySubsystem(){

  const shutdown =
  await shutdownMemorySubsystem();

  if(!shutdown){

    return false;

  }

  return initializeMemorySubsystem();

}



// =====================================
// PUBLIC API
// =====================================

const MemoryAPI =
Object.freeze({



  // ===================================
  // LIFECYCLE
  // ===================================

  initialize:
  initializeMemorySubsystem,

  shutdown:
  shutdownMemorySubsystem,

  restart:
  restartMemorySubsystem,

  ready:
  ensureSubsystemReady,



  // ===================================
  // CRUD
  // ===================================

  async create(...args){

    await ensureSubsystemReady();

    return createMemory(
      ...args
    );

  },

  async update(...args){

    await ensureSubsystemReady();

    return updateMemoryData(
      ...args
    );

  },

  async delete(...args){

    await ensureSubsystemReady();

    return deleteMemoryData(
      ...args
    );

  },

  async get(...args){

    await ensureSubsystemReady();

    return getMemoryById(
      ...args
    );

  },



  // ===================================
  // SEARCH
  // ===================================

  async search(...args){

    await ensureSubsystemReady();

    return advancedMemorySearch(
      ...args
    );

  },

  async semanticSearch(...args){

    await ensureSubsystemReady();

    return semanticMemorySearch?.(
      ...args
    ) || [];

  },

  async related(...args){

    await ensureSubsystemReady();

    return findRelatedMemories?.(
      ...args
    ) || [];

  },



  // ===================================
  // STORAGE
  // ===================================

  export:
  exportMemoryData,

  import:
  importMemoryData,



  // ===================================
  // CLOUD
  // ===================================

  sync:
  syncMemoryCloud,



  // ===================================
  // SECURITY
  // ===================================

  integrity:
  runMemoryIntegrityCheck,



  // ===================================
  // DIAGNOSTICS
  // ===================================

  diagnostics:
  getFullMemoryDiagnostics

});



// =====================================
// DIAGNOSTICS
// =====================================

function getFullMemoryDiagnostics(){

  return {

    subsystem:
    {

      initialized:

        memorySubsystemState
        .initialized,

      healthy:

        memorySubsystemState
        .healthy,

      status:

        memorySubsystemState
        .status,

      version:

        memorySubsystemState
        .subsystemVersion

    },

    memory:
    getMemoryDiagnostics?.(),

    embeddings:
    getMemoryEmbeddingDiagnostics?.(),

    security:
    getMemorySecurityDiagnostics?.(),

    sync:
    getMemorySyncDiagnostics?.(),

    cleanup:
    getMemoryCleanupDiagnostics?.(),

    events:
    getMemoryEventDiagnostics?.()

  };

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(typeof globalThis === "object"){

  globalThis.MemoryAPI =
  MemoryAPI;

  globalThis.memorySubsystemState =
  memorySubsystemState;

  globalThis.initializeMemorySubsystem =
  initializeMemorySubsystem;

  globalThis.shutdownMemorySubsystem =
  shutdownMemorySubsystem;

  globalThis.restartMemorySubsystem =
  restartMemorySubsystem;

  globalThis.ensureSubsystemReady =
  ensureSubsystemReady;

  globalThis.getFullMemoryDiagnostics =
  getFullMemoryDiagnostics;

}



// =====================================
// MODULE EXPORTS
// =====================================

export {

  MEMORY_SUBSYSTEM_CONFIG,

  MEMORY_SUBSYSTEM_STATUS,

  memorySubsystemState,

  initializeMemorySubsystem,

  shutdownMemorySubsystem,

  restartMemorySubsystem,

  ensureSubsystemReady,

  getFullMemoryDiagnostics,

  MemoryAPI

};

export default MemoryAPI;
