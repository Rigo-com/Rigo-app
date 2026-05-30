// =====================================
// RIGO AI
// MODULE CONSTANTS
// =====================================



// =====================================
// MODULE SYSTEM VERSION
// =====================================

const MODULE_SYSTEM_VERSION =
"1.0.0";



// =====================================
// MODULE CONFIG
// =====================================

const MODULE_LOADER_CONFIG =
Object.freeze({

  ENABLE_LAZY_LOADING:
  true,

  ENABLE_HEALTH_CHECKS:
  true,

  ENABLE_RETRY_LOADING:
  true,

  ENABLE_DEPENDENCY_GRAPH:
  true,

  ENABLE_FAILURE_ISOLATION:
  true,

  ENABLE_DIAGNOSTICS:
  true,

  ENABLE_RECOVERY:
  true,

  ENABLE_PARALLEL_LOADING:
  false,

  ENABLE_MODULE_TIMEOUTS:
  true,

  ENABLE_ACTIVATION_TIMEOUTS:
  true,

  ENABLE_EVENT_BRIDGE:
  true,

  ENABLE_STATE_TRACKING:
  true,

  MAX_MODULES:
  1000,

  MAX_RETRIES:
  3,

  MAX_BOOT_DEPTH:
  50,

  MAX_DEPENDENCIES:
  100,

  MAX_EVENT_LISTENERS:
  500,

  MAX_HEALTH_FAILURES:
  5,

  MODULE_TIMEOUT:
  15000,

  ACTIVATION_TIMEOUT:
  10000,

  RETRY_DELAY:
  1000,

  RECOVERY_DELAY:
  3000,

  HEALTHCHECK_INTERVAL:
  30000,

  BOOTSTRAP_TIMEOUT:
  30000

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

  RECOVERING:
  "recovering",

  SUSPENDED:
  "suspended",

  DISABLED:
  "disabled",

  UNLOADING:
  "unloading",

  UNLOADED:
  "unloaded",

  DESTROYED:
  "destroyed"

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

  LOAD_FAILED:
  "module.load.failed",

  ACTIVATED:
  "module.activated",

  ACTIVATION_FAILED:
  "module.activation.failed",

  FAILED:
  "module.failed",

  RECOVERED:
  "module.recovered",

  SUSPENDED:
  "module.suspended",

  DISABLED:
  "module.disabled",

  DESTROYED:
  "module.destroyed",

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

  LOW:
  10,

  NORMAL:
  50,

  HIGH:
  100,

  CRITICAL:
  1000

});



// =====================================
// VALIDATION
// =====================================

function isValidModuleState(
  state
){

  return Object.values(
    MODULE_STATES
  )
  .includes(
    String(state)
  );

}



function isValidModuleEvent(
  event
){

  return Object.values(
    MODULE_EVENTS
  )
  .includes(
    String(event)
  );

}



function isValidModuleLifecycle(
  lifecycle
){

  return Object.values(
    MODULE_LIFECYCLES
  )
  .includes(
    String(lifecycle)
  );

}



function isValidModulePriority(
  priority
){

  return Object.values(
    MODULE_PRIORITIES
  )
  .includes(
    Number(priority)
  );

}



// =====================================
// PUBLIC API
// =====================================

const ModuleConstants =
Object.freeze({

  version:
  MODULE_SYSTEM_VERSION,

  config:
  MODULE_LOADER_CONFIG,

  states:
  MODULE_STATES,

  events:
  MODULE_EVENTS,

  lifecycles:
  MODULE_LIFECYCLES,

  priorities:
  MODULE_PRIORITIES,

  validateState:
  isValidModuleState,

  validateEvent:
  isValidModuleEvent,

  validateLifecycle:
  isValidModuleLifecycle,

  validatePriority:
  isValidModulePriority

});



// =====================================
// EXPORTS
// =====================================

export {

  MODULE_SYSTEM_VERSION,

  MODULE_LOADER_CONFIG,

  MODULE_STATES,

  MODULE_EVENTS,

  MODULE_LIFECYCLES,

  MODULE_PRIORITIES,

  isValidModuleState,

  isValidModuleEvent,

  isValidModuleLifecycle,

  isValidModulePriority,

  ModuleConstants

};

export default
ModuleConstants;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "ModuleConstants",

    {

      value:
      ModuleConstants,

      writable:
      false,

      configurable:
      false

    }

  );

}
