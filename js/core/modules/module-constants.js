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

  ENABLE_MODULE_TIMEOUTS:true,

  ENABLE_ACTIVATION_TIMEOUTS:true,

  ENABLE_EVENT_BRIDGE:true,

  ENABLE_STATE_TRACKING:true,

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
// MODULE LIFECYCLES
// =====================================

const MODULE_LIFECYCLES =
Object.freeze({

  SINGLETON:
  "singleton",

  TRANSIENT:
  "transient",

  RUNTIME:
  "runtime"

});



// =====================================
// MODULE PRIORITIES
// =====================================

const MODULE_PRIORITIES =
Object.freeze({

  CRITICAL:
  1,

  HIGH:
  2,

  NORMAL:
  3,

  LOW:
  4

});



// =====================================
// PUBLIC API
// =====================================

const ModuleConstants =
Object.freeze({

  config:
  MODULE_LOADER_CONFIG,

  states:
  MODULE_STATES,

  events:
  MODULE_EVENTS,

  lifecycles:
  MODULE_LIFECYCLES,

  priorities:
  MODULE_PRIORITIES

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.ModuleConstants =
  ModuleConstants;

  window.MODULE_LOADER_CONFIG =
  MODULE_LOADER_CONFIG;

  window.MODULE_STATES =
  MODULE_STATES;

  window.MODULE_EVENTS =
  MODULE_EVENTS;

  window.MODULE_LIFECYCLES =
  MODULE_LIFECYCLES;

  window.MODULE_PRIORITIES =
  MODULE_PRIORITIES;

}
