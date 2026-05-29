// =====================================
// RIGO AI
// CONTAINER TYPES
// =====================================



// =====================================
// SERVICE LIFECYCLES
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
// SERVICE DEFINITIONS
// =====================================

const CONTAINER_SERVICE_TYPES =
Object.freeze({

  SERVICE:
  "service",

  FACTORY:
  "factory",

  VALUE:
  "value"

});



// =====================================
// EXPORTS
// =====================================

export {

  CONTAINER_LIFECYCLE,

  CONTAINER_SERVICE_TYPES

};
