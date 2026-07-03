// =====================================
// RIGO AI
// ADMIN RUNTIME STATE
// =====================================

const adminRuntimeState =
Object.seal({

  initialized:
  false,

  booted:
  false,

  running:
  false,

  lastError:
  null,

  startedAt:
  null,

  diagnostics:
  Object.seal({

    boots:
    0,

    shutdowns:
    0,

    resets:
    0,

    errors:
    0

  }),

  modules:
  Object.seal({

    agent:
    false,

    studio:
    false

  }),

  logs:
  []

});



// =====================================
// LOG
// =====================================

function log(
  type,
  message,
  payload = null
){

  adminRuntimeState
  .logs
  .push({

    type,

    message,

    payload,

    timestamp:
    Date.now()

  });

  if(
    adminRuntimeState
    .logs
    .length > 500
  ){

    adminRuntimeState
    .logs
    .shift();

  }

}



// =====================================
// MODULE
// =====================================

function setModuleState(
  module,
  value
){

  if(
    module in
    adminRuntimeState
    .modules
  ){

    adminRuntimeState
    .modules[module] =
    Boolean(value);

  }

  return true;

}



// =====================================
// ERROR
// =====================================

function setError(
  error
){

  adminRuntimeState
  .lastError =
  error;

  adminRuntimeState
  .diagnostics
  .errors++;

  log(
    "error",
    error?.message ||
    String(error)
  );

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return structuredClone(
    adminRuntimeState
  );

}



// =====================================
// RESET
// =====================================

function reset(){

  adminRuntimeState
  .initialized =
  false;

  adminRuntimeState
  .booted =
  false;

  adminRuntimeState
  .running =
  false;

  adminRuntimeState
  .startedAt =
  null;

  adminRuntimeState
  .lastError =
  null;

  adminRuntimeState
  .modules
  .agent =
  false;

  adminRuntimeState
  .modules
  .studio =
  false;

  adminRuntimeState
  .logs =
  [];

  return true;

}



// =====================================
// API
// =====================================

const AdminRuntimeState =
Object.freeze({

  state:
  adminRuntimeState,

  log,

  setError,

  setModuleState,

  snapshot,

  reset

});



// =====================================
// EXPORTS
// =====================================

export {

  adminRuntimeState,

  log,

  setError,

  setModuleState,

  snapshot,

  reset,

  AdminRuntimeState

};

export default
AdminRuntimeState;
