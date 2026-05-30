// =====================================
// RIGO AI
// CONFIG TYPES
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

  typeof window !==
  "undefined"

  &&

  window.location.hostname !==
  "localhost"

    ?

    APP_ENVIRONMENTS
    .PRODUCTION

    :

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

  ENABLE_STATE_MANAGER:true,

  ENABLE_CONTAINER_SYSTEM:true,

  ENABLE_MODULE_LOADER:true,

  ENABLE_BOOTSTRAP_SYSTEM:true,

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
// CONFIG DEFAULTS
// =====================================

const CONFIG_DEFAULTS =
Object.freeze({

  RUNTIME_NAME:
  "RIGO_RUNTIME",

  ENABLE_DIAGNOSTICS:true,

  ENABLE_HEALTHCHECKS:true,

  ENABLE_RECOVERY:true,

  ENABLE_SYSTEM_EVENTS:true,

  HEALTHCHECK_INTERVAL:
  60000,

  CONTAINER_TIMEOUT:
  15000

});



// =====================================
// EXPORTS
// =====================================

export {

  APP_INFO,

  APP_ENVIRONMENTS,

  CURRENT_ENVIRONMENT,

  DEBUG_MODE,

  FEATURE_FLAGS,

  PLATFORM_CAPABILITIES,

  CONFIG_DEFAULTS

};
