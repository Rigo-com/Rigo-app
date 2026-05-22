// =====================================
// RIGO AI
// APP CONFIG
// =====================================

const APP_CORE_CONFIG =
Object.freeze({

  STARTUP_TIMEOUT:
  30000,

  MAX_RECOVERY_ATTEMPTS:
  3,

  ENABLE_DIAGNOSTICS:true,

  ENABLE_HEALTHCHECKS:true,

  ENABLE_RECOVERY:true,

  ENABLE_SYSTEM_EVENTS:true,

  HEALTHCHECK_INTERVAL:
  60000,

  DEPENDENCY_TIMEOUT:
  15000

});



const APP_PHASES =
Object.freeze({

  IDLE:"idle",

  PREINIT:"preinit",

  INITIALIZING:"initializing",

  BOOTING:"booting",

  READY:"ready",

  RECOVERING:"recovering",

  SHUTTING_DOWN:"shutting_down",

  ERROR:"error"

});
