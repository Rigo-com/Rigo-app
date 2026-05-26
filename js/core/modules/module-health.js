// =====================================
// RIGO AI
// MODULE HEALTH
// READONLY HEALTH + SNAPSHOT LAYER
// ENTERPRISE FINAL
// =====================================



// =====================================
// INTERNAL HEALTH STATE
// =====================================

const moduleHealthState =
Object.seal({

  diagnostics:
  Object.seal({

    registered:0,

    loaded:0,

    activated:0,

    failed:0,

    retries:0,

    healthchecks:0

  }),

  lastLoadedAt:null,

  lastHealthcheckAt:null

});



// =====================================
// HELPERS
// =====================================

function isPlainObject(
  value
){

  if(
    !value ||
    typeof value !==
    "object"
  ){

    return false;

  }

  const prototype =
  Object.getPrototypeOf(
    value
  );

  return (

    prototype ===
    Object.prototype ||

    prototype ===
    null

  );

}



function isFunction(
  value
){

  return typeof value ===
  "function";

}



function normalizeHealthError(
  error
){

  if(
    typeof getSafeErrorMessage ===
    "function"
  ){

    return getSafeErrorMessage(
      error
    );

  }

  return String(
    error || "UNKNOWN ERROR"
  );

}



// =====================================
// SAFE FREEZE
// =====================================

function safeFreeze(
  value,
  visited = new WeakSet()
){

  if(
    !value ||
    typeof value !==
    "object"
  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  if(

    value instanceof Promise ||

    value instanceof Map ||

    value instanceof Set ||

    value instanceof Date ||

    value instanceof RegExp ||

    (
      typeof HTMLElement !==
      "undefined" &&

      value instanceof HTMLElement
    )

  ){

    return value;

  }

  if(

    !Array.isArray(value) &&

    !isPlainObject(value)

  ){

    return value;

  }

  visited.add(value);

  Object.freeze(value);

  Object.values(value)
  .forEach((nestedValue) => {

    safeFreeze(
      nestedValue,
      visited
    );

  });

  return value;

}



// =====================================
// WARNINGS
// =====================================

function emitModuleHealthWarning(
  message,
  error = null
){

  console.warn(

    `[ModuleHealth] ${message}`,

    error || ""

  );

}



// =====================================
// REGISTRY SNAPSHOT
// =====================================

function getRegistrySnapshot(){

  try{

    if(

      typeof ModuleRegistry ===
      "undefined" ||

      !isFunction(
        ModuleRegistry.snapshot
      )

    ){

      return null;

    }

    return ModuleRegistry
    .snapshot();

  }

  catch(error){

    emitModuleHealthWarning(

      "Registry snapshot failed",

      error

    );

    return null;

  }

}



// =====================================
// MODULE COUNTS
// =====================================

function getModuleCounts(){

  const snapshot =
  getRegistrySnapshot();

  if(
    !snapshot
  ){

    return safeFreeze({

      total:0,

      active:0,

      failed:0,

      loading:0,

      instances:0

    });

  }

  return safeFreeze({

    total:

      snapshot
      .modules
      ?.length || 0,

    active:

      snapshot
      .activeModules
      ?.length || 0,

    failed:

      snapshot
      .failedModules
      ?.length || 0,

    loading:

      snapshot
      .loadingStack
      ?.length || 0,

    instances:

      snapshot
      .instances || 0

  });

}



// =====================================
// HEALTH SCORE
// =====================================

function calculateModuleHealthScore(){

  const counts =
  getModuleCounts();

  if(
    counts.total <= 0
  ){

    return 100;

  }

  const failedPenalty =

    Math.floor(

      (counts.failed / counts.total) *
      100

    );

  const loadingPenalty =

    Math.min(

      counts.loading * 2,

      15

    );

  const score =

    100 -
    failedPenalty -
    loadingPenalty;

  return Math.max(
    0,
    score
  );

}



// =====================================
// HEALTH STATUS
// =====================================

function getModuleHealthStatus(
  healthScore
){

  if(
    healthScore >= 90
  ){

    return "healthy";

  }

  if(
    healthScore >= 70
  ){

    return "degraded";

  }

  return "critical";

}



// =====================================
// HEALTH RECOMMENDATIONS
// =====================================

function getHealthRecommendations(
  counts,
  healthScore
){

  const recommendations =
  [];

  if(
    counts.failed > 0
  ){

    recommendations.push(
      "Recover failed modules"
    );

  }

  if(
    counts.loading > 10
  ){

    recommendations.push(
      "Investigate loading bottlenecks"
    );

  }

  if(
    healthScore < 70
  ){

    recommendations.push(
      "Runtime stabilization recommended"
    );

  }

  return recommendations;

}



// =====================================
// SNAPSHOT
// =====================================

function createModuleLoaderSnapshot(){

  try{

    const snapshot =
    getRegistrySnapshot();

    const counts =
    getModuleCounts();

    return safeFreeze({

      timestamp:
      Date.now(),

      counts,

      activeModules:

        snapshot
        ?.activeModules ||

        [],

      failedModules:

        snapshot
        ?.failedModules ||

        [],

      loadingStack:

        snapshot
        ?.loadingStack ||

        [],

      diagnostics:{

        ...moduleHealthState
        .diagnostics

      },

      lastLoadedAt:

        moduleHealthState
        .lastLoadedAt,

      lastHealthcheckAt:

        moduleHealthState
        .lastHealthcheckAt

    });

  }

  catch(error){

    emitModuleHealthWarning(

      "Snapshot creation failed",

      error

    );

    return null;

  }

}



// =====================================
// HEALTH CHECK
// =====================================

async function getModuleHealth(){

  try{

    moduleHealthState
    .diagnostics
    .healthchecks++;

    moduleHealthState
    .lastHealthcheckAt =
    Date.now();

    const counts =
    getModuleCounts();

    const healthScore =
    calculateModuleHealthScore();

    const health =
    safeFreeze({

      status:
      getModuleHealthStatus(
        healthScore
      ),

      healthScore,

      counts,

      recommendations:

        getHealthRecommendations(

          counts,
          healthScore

        ),

      diagnostics:{

        ...moduleHealthState
        .diagnostics

      },

      runtime:

        typeof ModuleRuntime !==
        "undefined"

        &&

        isFunction(
          ModuleRuntime.snapshot
        )

        ?

        ModuleRuntime
        .snapshot()

        :

        null,

      lastLoadedAt:

        moduleHealthState
        .lastLoadedAt,

      lastHealthcheckAt:

        moduleHealthState
        .lastHealthcheckAt,

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

          source:
          "module-health",

          health

        }

      );

    }

    return health;

  }

  catch(error){

    emitModuleHealthWarning(

      "Healthcheck failed",

      error

    );

    return null;

  }

}



// =====================================
// DIAGNOSTICS API
// =====================================

function updateModuleDiagnostics(
  partialDiagnostics = {}
){

  if(
    !isPlainObject(
      partialDiagnostics
    )
  ){

    return false;

  }

  Object.entries(
    partialDiagnostics
  ).forEach(([key, value]) => {

    if(

      typeof value ===
      "number"

      &&

      key in
      moduleHealthState
      .diagnostics

    ){

      moduleHealthState
      .diagnostics[
        key
      ] = value;

    }

  });

  return true;

}



function markModuleLoaded(){

  moduleHealthState
  .lastLoadedAt =
  Date.now();

  moduleHealthState
  .diagnostics
  .loaded++;

  return true;

}



function resetModuleDiagnostics(){

  Object.keys(

    moduleHealthState
    .diagnostics

  ).forEach((key) => {

    moduleHealthState
    .diagnostics[
      key
    ] = 0;

  });

  moduleHealthState
  .lastLoadedAt =
  null;

  moduleHealthState
  .lastHealthcheckAt =
  null;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const ModuleHealth =
Object.freeze({

  health:
  getModuleHealth,

  snapshot:
  createModuleLoaderSnapshot,

  counts:
  getModuleCounts,

  diagnostics:
  updateModuleDiagnostics,

  markLoaded:
  markModuleLoaded,

  resetDiagnostics:
  resetModuleDiagnostics

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "ModuleHealth",

    {

      value:
      ModuleHealth,

      writable:false,

      configurable:false

    }

  );

}
