// =====================================
// RIGO AI
// HEALTH SYSTEM
// =====================================



// =====================================
// INITIALIZE HEALTH SYSTEM
// =====================================

async function initializeHealthSystem(){

  const diagnosticsReady =
  await initializeDiagnosticsSystem();

  if(!diagnosticsReady){

    return false;

  }

  return true;

}



// =====================================
// RESET HEALTH SYSTEM
// =====================================

function resetHealthSystem(){

  resetDiagnosticsSystem();

  stopHealthchecks();

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const HealthSystem =
Object.freeze({

  initialize:
  initializeHealthSystem,

  reset:
  resetHealthSystem,

  run:
  runAppHealthcheck,

  start:
  startHealthchecks,

  stop:
  stopHealthchecks,

  diagnostics:
  getHealthDiagnostics

});
