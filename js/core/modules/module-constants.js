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

  MAX_MODULES:
  1000,

  MAX_RETRIES:
  3,

  MAX_BOOT_DEPTH:
  50

});



// =====================================
// MODULE STATES
// =====================================

const MODULE_STATES =
Object.freeze({

  REGISTERED:
  "registered",

  LOADING:
  "loading",

  ACTIVE:
  "active",

  FAILED:
  "failed",

  DISABLED:
  "disabled"

});



// =====================================
// MODULE EVENTS
// =====================================

const MODULE_EVENTS =
Object.freeze({

  REGISTERED:
  "module.registered",

  LOADED:
  "module.loaded",

  ACTIVATED:
  "module.activated",

  FAILED:
  "module.failed",

  UNLOADED:
  "module.unloaded"

});
