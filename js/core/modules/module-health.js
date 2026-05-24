// =====================================
// RIGO AI
// MODULE HEALTH
// =====================================



// =====================================
// HEALTH SCORE
// =====================================

function calculateModuleHealthScore(){

  const totalModules =

    moduleLoaderState
    .modules
    .size;

  const failedModules =

    moduleLoaderState
    .failedModules
    .size;

  if(totalModules <= 0){

    return 100;

  }

  const score =

    100 -

    Math.floor(

      (failedModules /
      totalModules) * 100

    );

  return Math.max(
    0,
    score
  );

}



// =====================================
// MODULE COUNTS
// =====================================

function getModuleCounts(){

  return freezeModuleObject({

    total:

      moduleLoaderState
      .modules
      .size,

    active:

      moduleLoaderState
      .activeModules
      .size,

    failed:

      moduleLoaderState
      .failedModules
      .size,

    loading:

      moduleLoaderState
      .loadingStack
      .length,

    instances:

      moduleLoaderState
      ?.instances
      ?.size || 0

  });

}



// =====================================
// SNAPSHOT
// =====================================

function createModuleLoaderSnapshot(){

  return freezeModuleObject({

    timestamp:
    Date.now(),

    initialized:
    moduleLoaderState
    .initialized,

    counts:
    getModuleCounts(),

    activeModules:[

      ...moduleLoaderState
      .activeModules

    ],

    failedModules:[

      ...moduleLoaderState
      .failedModules

    ],

    loadingStack:[

      ...moduleLoaderState
      .loadingStack

    ],

    diagnostics:{

      ...moduleLoaderState
      .diagnostics

    },

    lastLoadedAt:

      moduleLoaderState
      .lastLoadedAt

  });

}



// =====================================
// MODULE HEALTH STATUS
// =====================================

function getModuleHealthStatus(
  healthScore
){

  if(healthScore >= 90){

    return "healthy";

  }

  if(healthScore >= 70){

    return "degraded";

  }

  return "critical";

}



// =====================================
// HEALTH CHECK
// =====================================

async function getModuleHealth(){

  const healthScore =
  calculateModuleHealthScore();

  const counts =
  getModuleCounts();

  const health =
  freezeModuleObject({

    initialized:
    moduleLoaderState
    .initialized,

    status:
    getModuleHealthStatus(
      healthScore
    ),

    healthScore,

    counts,

    diagnostics:{

      ...moduleLoaderState
      .diagnostics

    },

    lastLoadedAt:

      moduleLoaderState
      .lastLoadedAt,

    timestamp:
    Date.now()

  });

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(

      MODULE_EVENTS
      .HEALTHCHECK,

      {

        health

      }

    );

  }

  return health;

}



// =====================================
// RESET DIAGNOSTICS
// =====================================

function resetModuleDiagnostics(){

  moduleLoaderState
  .diagnostics = {

    registered:0,

    loaded:0,

    activated:0,

    failed:0,

    retries:0

  };

  return true;

}



// =====================================
// RESET
// =====================================

async function resetModuleLoader(){

  try{



    // ================================
    // UNLOAD ACTIVE MODULES
    // ================================

    const activeModules = [

      ...moduleLoaderState
      .activeModules

    ];

    for(
      const moduleName
      of activeModules
    ){

      try{

        await unloadModule(
          moduleName
        );

      }

      catch(error){}

    }



    // ================================
    // RESET STATE
    // ================================

    moduleLoaderState
    .modules
    .clear();

    moduleLoaderState
    .activeModules
    .clear();

    moduleLoaderState
    .failedModules
    .clear();

    moduleLoaderState
    .dependencyGraph
    .clear();

    moduleLoaderState
    .reverseDependencies
    ?.clear();

    moduleLoaderState
    .loadingStack = [];

    if(
      moduleLoaderState
      .instances
    ){

      moduleLoaderState
      .instances
      .clear();

    }

    resetModuleDiagnostics();

    moduleLoaderState
    .lastLoadedAt =
    null;

    moduleLoaderState
    .initialized =
    false;

    return true;

  }

  catch(error){

    if(
      typeof logDiagnosticError ===
      "function"
    ){

      await logDiagnosticError(

        "MODULE RESET FAILED",

        {

          error:
          String(error)

        }

      );

    }

    return false;

  }

}



// =====================================
// INITIALIZE
// =====================================

async function initializeModuleLoader(){

  if(
    moduleLoaderState
    .initialized
  ){

    return true;

  }

  try{

    if(
      !moduleLoaderState
      .instances
    ){

      moduleLoaderState
      .instances =
      new Map();

    }

    moduleLoaderState
    .initialized =
    true;

    if(
      typeof emitSystemEvent ===
      "function"
    ){

      await emitSystemEvent(

        "module.loader.initialized",

        {

          timestamp:
          Date.now()

        }

      );

    }

    return true;

  }

  catch(error){

    if(
      typeof logDiagnosticError ===
      "function"
    ){

      await logDiagnosticError(

        "MODULE LOADER INIT FAILED",

        {

          error:
          String(error)

        }

      );

    }

    return false;

  }

}
