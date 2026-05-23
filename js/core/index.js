// =====================================
// RIGO AI
// CORE INDEX
// =====================================



// =====================================
// CORE SNAPSHOT
// =====================================

async function createCoreSnapshot(){

  return Object.freeze({

    timestamp:
    Date.now(),

    runtime:

      typeof RuntimeManager !==
      "undefined"

      ? RuntimeManager
      .snapshot?.()

      : null,

    lifecycle:

      typeof ApplicationRuntime !==
      "undefined"

      ? ApplicationRuntime
      .snapshot?.()

      : null,

    diagnostics:

      typeof DiagnosticsRuntime !==
      "undefined"

      ? await DiagnosticsRuntime
      .health?.()

      : null,

    modules:

      typeof ModuleLoader !==
      "undefined"

      ? await ModuleLoader
      .health?.()

      : null,

    dependencies:

      typeof DependencySystem !==
      "undefined"

      ? DependencySystem
      .diagnostics?.()

      : null

  });

}



// =====================================
// CORE HEALTH
// =====================================

async function validateCoreSystems(){

  try{

    const checks = [

      typeof RuntimeManager !==
      "undefined",

      typeof ApplicationRuntime !==
      "undefined",

      typeof DiagnosticsRuntime !==
      "undefined",

      typeof ModuleLoader !==
      "undefined",

      typeof DependencySystem !==
      "undefined"

    ];

    return checks.every(Boolean);

  }

  catch(error){

    return false;

  }

}



// =====================================
// CORE READY
// =====================================

async function isCoreReady(){

  try{

    const validCore =
    await validateCoreSystems();

    if(!validCore){

      return false;

    }

    if(
      typeof validateApplicationHealth ===
      "function"
    ){

      return await
      validateApplicationHealth();

    }

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// CORE EXPORTS
// =====================================

const RIGOCore =
Object.freeze({

  runtime:
  RuntimeManager,

  lifecycle:
  ApplicationRuntime,

  diagnostics:
  DiagnosticsRuntime,

  modules:
  ModuleLoader,

  dependencies:
  DependencySystem,

  container:
  DependencyContainer,

  health:
  HealthSystem,

  analytics:
  AnalyticsRuntime,

  files:
  FileRuntime,

  snapshot:
  createCoreSnapshot,

  ready:
  isCoreReady

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.RIGOCore =
  RIGOCore;

  window.createCoreSnapshot =
  createCoreSnapshot;

  window.validateCoreSystems =
  validateCoreSystems;

  window.isCoreReady =
  isCoreReady;

}
