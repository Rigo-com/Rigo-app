// =====================================
// RIGO AI
// RUNTIME EVENTS
// =====================================



// =====================================
// RUNTIME EVENTS
// =====================================

const RUNTIME_EVENTS =
Object.freeze(
Object.seal({



  // ===================================
  // INITIALIZATION
  // ===================================

  INITIALIZED:
  "runtime.initialized",



  // ===================================
  // BOOT
  // ===================================

  BOOT_STARTED:
  "runtime.boot.started",

  BOOT_COMPLETED:
  "runtime.boot.completed",

  BOOT_FAILED:
  "runtime.boot.failed",



  // ===================================
  // RECOVERY
  // ===================================

  RECOVERY_STARTED:
  "runtime.recovery.started",

  RECOVERY_COMPLETED:
  "runtime.recovery.completed",

  RECOVERY_FAILED:
  "runtime.recovery.failed",



  // ===================================
  // SHUTDOWN
  // ===================================

  SHUTDOWN_STARTED:
  "runtime.shutdown.started",

  SHUTDOWN_COMPLETED:
  "runtime.shutdown.completed",

  SHUTDOWN_FAILED:
  "runtime.shutdown.failed"

}));



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "RUNTIME_EVENTS",

    {

      value:
      RUNTIME_EVENTS,

      writable:false,

      configurable:false

    }

  );

}
