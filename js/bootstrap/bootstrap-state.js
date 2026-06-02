// =====================================
// RIGO AI
// BOOTSTRAP STATE
// =====================================

export const bootstrapState =
Object.seal({

  initialized:false,

  booting:false,

  shuttingDown:false,

  recovering:false,

  state:"idle",

  recoveryAttempts:0,
  
  startupPromise:null,



  // ===================================
  // REGISTRY
  // ===================================

  registeredSystems:
  new Map(),

  initializedSystems:
  new Set(),

  failedSystems:
  new Set(),



  // ===================================
  // DIAGNOSTICS
  // ===================================

  diagnostics:{

    boots:0,

    failures:0,

    recoveries:0,

    shutdowns:0,

    initializedSystems:0

  },



  // ===================================
  // RUNTIME
  // ===================================

  startedAt:null,

  completedAt:null,

  lastError:null

});
