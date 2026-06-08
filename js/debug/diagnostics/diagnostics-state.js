// =====================================
// RIGO AI
// DIAGNOSTICS STATE
// DEBUG FOUNDATION STATE
// =====================================



// =====================================
// DIAGNOSTICS STATE
// =====================================

const diagnosticsState =
Object.seal({

  initialized:
  false,

  active:
  false,

  scanning:
  false,

  monitoring:
  false,

  reporting:
  false,

  dashboardOpen:
  false,



  startedAt:
  null,

  lastScanAt:
  null,

  lastReportAt:
  null,



  healthScore:
  100,



  modules:
  new Map(),

  dependencies:
  new Map(),

  services:
  new Map(),

  monitors:
  new Map(),

  reports:
  [],

  eventHistory:
  [],

  errors:
  [],

  warnings:
  [],

  criticalIssues:
  [],



  diagnostics:{

    scans:0,

    reports:0,

    errors:0,

    warnings:0,

    critical:0

  }

});



// =====================================
// EXPORTS
// =====================================

export {

  diagnosticsState

};

export default
diagnosticsState;
