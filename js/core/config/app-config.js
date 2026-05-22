// =====================================
// RIGO AI
// APP CONFIG
// =====================================



// =====================================
// APP INFO
// =====================================

const APP_INFO =
Object.freeze({

  NAME:
  "RIGO AI",

  VERSION:
  "1.0.0",

  BUILD:
  "development"

});



// =====================================
// ENVIRONMENTS
// =====================================

const APP_ENVIRONMENTS =
Object.freeze({

  DEVELOPMENT:
  "development",

  PRODUCTION:
  "production",

  TEST:
  "test"

});



const CURRENT_ENVIRONMENT =

  APP_ENVIRONMENTS
  .DEVELOPMENT;



// =====================================
// DEBUG
// =====================================

const DEBUG_MODE =

  CURRENT_ENVIRONMENT ===

  APP_ENVIRONMENTS
  .DEVELOPMENT;



// =====================================
// FEATURE FLAGS
// =====================================

const FEATURE_FLAGS =
Object.freeze({

  ENABLE_AI:true,

  ENABLE_MEMORY:true,

  ENABLE_NOTIFICATIONS:true,

  ENABLE_BACKGROUND_SYNC:true,

  ENABLE_OFFLINE_MODE:true,

  ENABLE_DIAGNOSTICS:true,

  ENABLE_RUNTIME_RECOVERY:true,

  ENABLE_EVENT_SYSTEM:true,

  ENABLE_EVENT_BUS:true,

  ENABLE_STATE_MANAGER:true,

  ENABLE_DEPENDENCY_CONTAINER:true,

  ENABLE_MODULE_LOADER:true,

  ENABLE_BOOTSTRAP_SYSTEM:true,

  ENABLE_SERVICE_WORKERS:false,

  ENABLE_EXPERIMENTAL_FEATURES:false

});



// =====================================
// PLATFORM CAPABILITIES
// =====================================

const PLATFORM_CAPABILITIES =
Object.freeze({

  SUPPORTS_LOCAL_STORAGE:

    typeof localStorage !==
    "undefined",

  SUPPORTS_INDEXED_DB:

    typeof indexedDB !==
    "undefined",

  SUPPORTS_NOTIFICATIONS:

    typeof Notification !==
    "undefined",

  SUPPORTS_SERVICE_WORKER:

    typeof navigator !==
    "undefined" &&

    "serviceWorker"
    in navigator,

  SUPPORTS_BACKGROUND_SYNC:

    typeof window !==
    "undefined" &&

    "SyncManager"
    in window

});



// =====================================
// APP CORE CONFIG
// =====================================

const APP_CORE_CONFIG =
Object.freeze({

  RUNTIME_NAME:
  "RIGO_RUNTIME",

  RUNTIME_VERSION:
  "1.0.0",

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
  15000,

  MAX_CONCURRENT_TASKS:
  10,

  MAX_PARALLEL_REQUESTS:
  5

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.APP_INFO =
  APP_INFO;

  window.APP_ENVIRONMENTS =
  APP_ENVIRONMENTS;

  window.CURRENT_ENVIRONMENT =
  CURRENT_ENVIRONMENT;

  window.DEBUG_MODE =
  DEBUG_MODE;

  window.FEATURE_FLAGS =
  FEATURE_FLAGS;

  window.PLATFORM_CAPABILITIES =
  PLATFORM_CAPABILITIES;

  window.APP_CORE_CONFIG =
  APP_CORE_CONFIG;

}
