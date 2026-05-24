// =====================================
// RIGO AI
// APP LIFECYCLE
// ENTERPRISE FINAL
// =====================================



// =====================================
// SNAPSHOT
// =====================================

async function createLifecycleSnapshot(){

  return freezeEnvironmentObject({

    timestamp:
    Date.now(),

    diagnostics:

      AppDiagnostics
      ?.get

      ? await AppDiagnostics
        .get()

      : null,

    health:

      HealthDiagnostics
      ?.get

      ? await HealthDiagnostics
        .get()

      : null,

    startup:

      AppStartup
      ?.snapshot

      ? AppStartup
        .snapshot()

      : null,

    shutdown:

      AppShutdown
      ?.snapshot

      ? AppShutdown
        .snapshot()

      : null

  });

}



// =====================================
// HEALTH
// =====================================

async function getLifecycleHealth(){

  if(
    !HealthRuntime
    ?.run
  ){

    return null;

  }

  return await HealthRuntime
  .run();

}



// =====================================
// RECOVERY
// =====================================

async function recoverApplication(){

  if(

    RuntimeManager
    ?.recover

  ){

    return RuntimeManager
    .recover();

  }

  return false;

}



// =====================================
// PUBLIC API
// =====================================

const AppLifecycle =
Object.freeze({



  // ===================================
  // CORE
  // ===================================

  start:
  AppStartup
  .start,

  shutdown:
  AppShutdown
  .shutdown,

  initialize:
  AppBootstrap
  .initialize,

  cleanup:
  AppShutdown
  .cleanup,



  // ===================================
  // DIAGNOSTICS
  // ===================================

  diagnostics:

    AppDiagnostics
    ?.get ||

    null,

  snapshot:
  createLifecycleSnapshot,

  health:
  getLifecycleHealth,



  // ===================================
  // RUNTIME
  // ===================================

  recover:
  recoverApplication,



  // ===================================
  // COMMUNICATION
  // ===================================

  sendMessage:
  handleSendMessage

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.AppLifecycle =
  AppLifecycle;

}
