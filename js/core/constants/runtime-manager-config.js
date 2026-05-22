// =====================================
// RIGO AI
// RUNTIME MANAGER CONFIG
// =====================================

const RUNTIME_MANAGER_CONFIG =
Object.freeze({

  ENABLE_HEALTH_SYNC:true,

  ENABLE_RECOVERY:true,

  ENABLE_STARTUP_QUEUE:true,

  ENABLE_SHUTDOWN_COORDINATION:true,

  ENABLE_DIAGNOSTICS:true,

  ENABLE_BOOT_PROTECTION:true,

  MAX_BOOT_RETRIES:
  3,

  MAX_RUNTIME_ERRORS:
  20,

  STARTUP_TIMEOUT:
  30000,

  SHUTDOWN_TIMEOUT:
  15000

});
