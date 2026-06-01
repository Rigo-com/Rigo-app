// =====================================
// RIGO AI
// SERVICE TYPES
// FOUNDATION DEFINITIONS
// =====================================



// =====================================
// SERVICE LIFECYCLES
// =====================================

export const SERVICE_LIFECYCLES =
Object.freeze({

  SINGLETON:
  "singleton",

  SCOPED:
  "scoped",

  TRANSIENT:
  "transient"

});



// =====================================
// SERVICE STATES
// =====================================

export const SERVICE_STATES =
Object.freeze({

  REGISTERED:
  "registered",

  INITIALIZING:
  "initializing",

  ACTIVE:
  "active",

  FAILED:
  "failed",

  SHUTTING_DOWN:
  "shutting_down",

  STOPPED:
  "stopped"

});



// =====================================
// SERVICE PRIORITIES
// =====================================

export const SERVICE_PRIORITIES =
Object.freeze({

  CRITICAL:
  100,

  HIGH:
  75,

  NORMAL:
  50,

  LOW:
  25

});



// =====================================
// VALIDATORS
// =====================================

export function
isValidServiceLifecycle(
  lifecycle
){

  return Object
  .values(
    SERVICE_LIFECYCLES
  )
  .includes(
    lifecycle
  );

}



export function
isValidServiceState(
  state
){

  return Object
  .values(
    SERVICE_STATES
  )
  .includes(
    state
  );

}



export function
isValidServicePriority(
  priority
){

  return Object
  .values(
    SERVICE_PRIORITIES
  )
  .includes(
    priority
  );

}



// =====================================
// EXPORTS
// =====================================

export default
Object.freeze({

  SERVICE_LIFECYCLES,

  SERVICE_STATES,

  SERVICE_PRIORITIES,

  isValidServiceLifecycle,

  isValidServiceState,

  isValidServicePriority

});
