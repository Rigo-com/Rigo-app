// =====================================
// RIGO AI
// RUNTIME CONFIG
// =====================================



// =====================================
// VERSION
// =====================================

const RUNTIME_VERSION =
"1.0.0";



// =====================================
// BOOT CONFIG
// =====================================

const RUNTIME_BOOT_CONFIG =
Object.freeze({

  AUTO_BOOT:
  false,

  BOOT_TIMEOUT:
  30000,

  SHUTDOWN_TIMEOUT:
  15000,

  RESET_TIMEOUT:
  15000,

  MAX_BOOT_RETRIES:
  3

});



// =====================================
// STATE CONFIG
// =====================================

const RUNTIME_STATE_CONFIG =
Object.freeze({

  ENABLE_SNAPSHOTS:
  true,

  ENABLE_HISTORY:
  true,

  MAX_HISTORY_ENTRIES:
  100

});



// =====================================
// RUNTIME STATES
// =====================================

const RUNTIME_STATES =
Object.freeze({

  IDLE:
  "idle",

  INITIALIZING:
  "initializing",

  INITIALIZED:
  "initialized",

  BOOTING:
  "booting",

  RUNNING:
  "running",

  SHUTTING_DOWN:
  "shutting_down",

  STOPPED:
  "stopped",

  RESETTING:
  "resetting",

  FAILED:
  "failed"

});



// =====================================
// RUNTIME EVENTS
// =====================================

const RUNTIME_EVENTS =
Object.freeze({

  INITIALIZED:
  "runtime.initialized",

  BOOT_STARTED:
  "runtime.boot.started",

  BOOT_COMPLETED:
  "runtime.boot.completed",

  SHUTDOWN_STARTED:
  "runtime.shutdown.started",

  SHUTDOWN_COMPLETED:
  "runtime.shutdown.completed",

  RESET_STARTED:
  "runtime.reset.started",

  RESET_COMPLETED:
  "runtime.reset.completed",

  FAILED:
  "runtime.failed"

});



// =====================================
// VALIDATION
// =====================================

function isValidRuntimeState(
  state
){

  return Object.values(
    RUNTIME_STATES
  )
  .includes(
    String(state)
  );

}



function isValidRuntimeEvent(
  event
){

  return Object.values(
    RUNTIME_EVENTS
  )
  .includes(
    String(event)
  );

}



// =====================================
// PUBLIC API
// =====================================

const RuntimeConfig =
Object.freeze({

  version:
  RUNTIME_VERSION,

  boot:
  RUNTIME_BOOT_CONFIG,

  state:
  RUNTIME_STATE_CONFIG,

  states:
  RUNTIME_STATES,

  events:
  RUNTIME_EVENTS,

  validateState:
  isValidRuntimeState,

  validateEvent:
  isValidRuntimeEvent

});



// =====================================
// EXPORTS
// =====================================

export {

  RUNTIME_VERSION,

  RUNTIME_BOOT_CONFIG,

  RUNTIME_STATE_CONFIG,

  RUNTIME_STATES,

  RUNTIME_EVENTS,

  isValidRuntimeState,

  isValidRuntimeEvent,

  RuntimeConfig

};

export default
RuntimeConfig;
