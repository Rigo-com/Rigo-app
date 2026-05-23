// =====================================
// RIGO AI
// MODULE CONSTANTS
// =====================================



// =====================================
// MODULE CONFIG
// =====================================

const MODULE_LOADER_CONFIG =
Object.freeze({

  ENABLE_LAZY_LOADING:true,

  ENABLE_HEALTH_CHECKS:true,

  ENABLE_RETRY_LOADING:true,

  ENABLE_DEPENDENCY_GRAPH:true,

  ENABLE_FAILURE_ISOLATION:true,

  ENABLE_DIAGNOSTICS:true,

  ENABLE_RECOVERY:true,

  ENABLE_PARALLEL_LOADING:false,

  MAX_MODULES:
  1000,

  MAX_RETRIES:
  3,

  MAX_BOOT_DEPTH:
  50,

  MODULE_TIMEOUT:
  15000,

  ACTIVATION_TIMEOUT:
  10000,

  RETRY_DELAY:
  1000

});



// =====================================
// MODULE STATES
// =====================================

const MODULE_STATES =
Object.freeze({

  REGISTERED:
  "registered",

  INITIALIZING:
  "initializing",

  LOADING:
  "loading",

  ACTIVE:
  "active",

  FAILED:
  "failed",

  DISABLED:
  "disabled",

  UNLOADING:
  "unloading",

  UNLOADED:
  "unloaded"

});



// =====================================
// MODULE EVENTS
// =====================================

const MODULE_EVENTS =
Object.freeze({

  REGISTERED:
  "module.registered",

  INITIALIZED:
  "module.initialized",

  LOADED:
  "module.loaded",

  ACTIVATED:
  "module.activated",

  FAILED:
  "module.failed",

  RECOVERED:
  "module.recovered",

  UNLOADING:
  "module.unloading",

  UNLOADED:
  "module.unloaded",

  HEALTHCHECK:
  "module.healthcheck",

  DEPENDENCIES_RESOLVED:
  "module.dependencies.resolved"

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.MODULE_LOADER_CONFIG =
  MODULE_LOADER_CONFIG;

  window.MODULE_STATES =
  MODULE_STATES;

  window.MODULE_EVENTS =
  MODULE_EVENTS;

}
