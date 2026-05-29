// =====================================
// RIGO AI
// CONTAINER CONSTANTS
// FINAL STABILIZED EDITION
// =====================================



// =====================================
// CONTAINER CONFIG
// =====================================

const CONTAINER_CONFIG =
Object.freeze({

  ENABLE_SINGLETONS:true,

  ENABLE_LAZY_LOADING:true,

  ENABLE_SCOPES:true,

  ENABLE_DIAGNOSTICS:true,

  ENABLE_CIRCULAR_PROTECTION:true,

  ENABLE_LIFECYCLE_EVENTS:true,

  MAX_SERVICES:
  500,

  MAX_SCOPES:
  100,
  
  MAX_RESOLUTION_DEPTH:
  50

});



// =====================================
// CONTAINER LIFECYCLE
// =====================================

const CONTAINER_LIFECYCLE =
Object.freeze({

  SINGLETON:
  "singleton",

  TRANSIENT:
  "transient",

  SCOPED:
  "scoped"

});



// =====================================
// CONTAINER EVENTS
// =====================================

const CONTAINER_EVENTS =
Object.freeze({

  INITIALIZED:
  "container.initialized",

  REGISTERED:
  "container.registered",

  RESOLVED:
  "container.resolved",

  REMOVED:
  "container.removed",

  RESET:
  "container.reset",

  ERROR:
  "container.error"

});



// =====================================
// EXPORTS
// =====================================

export {

  CONTAINER_CONFIG,

  CONTAINER_LIFECYCLE,

  CONTAINER_EVENTS

};
