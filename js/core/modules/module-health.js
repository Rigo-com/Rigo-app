// =====================================
// RIGO AI
// MODULE HEALTH
// READONLY HEALTH + SNAPSHOT LAYER
// =====================================



// =====================================
// INTERNAL HEALTH STATE
// =====================================

const moduleHealthState = {

  diagnostics:{

    registered:
    0,

    loaded:
    0,

    activated:
    0,

    failed:
    0,

    retries:
    0

  },

  lastLoadedAt:
  null

};



// =====================================
// HELPERS
// =====================================

function isPlainObject(value){

  if(
    !value ||
    typeof value !== "object"
  ){
    return false;
  }

  const prototype =
    Object.getPrototypeOf(value);

  return (

    prototype === Object.prototype ||
    prototype === null

  );

}



function safeFreeze(
  value,
  visited = new WeakSet()
){

  if(
    !value ||
    typeof value !== "object"
  ){
    return value;
  }

  if(visited.has(value)){
    return value;
  }

  if(

    value instanceof Map ||
    value instanceof Set ||
    value instanceof Date ||
    value instanceof RegExp

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

  Object.values(value).forEach((nestedValue) => {

    safeFreeze(
      nestedValue,
      visited
    );

  });

  return value;

}



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
// MODULE COUNTS
// =====================================

function getModuleCounts(){

  return safeFreeze({

    total:

      moduleLoaderState.modules.size,

    active:

      moduleLoaderState.activeModules.size,

    failed:

      moduleLoaderState.failedModules.size,

    loading:

      moduleLoaderState.loadingStack.length,

    instances:

      moduleLoaderState.instances.size

  });

}



// =====================================
// HEALTH SCORE
// =====================================

function calculateModuleHealthScore(){

  const counts =
    getModuleCounts();

  if(counts.total <= 0){
    return 100;
  }

  const failedPenalty =

    Math.floor(

      (counts.failed / counts.total) * 100

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

  if(healthScore >= 90){
    return "healthy";
  }

  if(healthScore >= 70){
    return "degraded";
  }

  return "critical";

}



// =====================================
// SNAPSHOT
// =====================================

function createModuleLoaderSnapshot(){

  try{

    return safeFreeze({

      timestamp:
      Date.now(),

      counts:
      getModuleCounts(),

      activeModules:[

        ...moduleLoaderState.activeModules

      ],

      failedModules:[

        ...moduleLoaderState.failedModules

      ],

      loadingStack:[

        ...moduleLoaderState.loadingStack

      ],

      diagnostics:{

        ...moduleHealthState.diagnostics

      },

      lastLoadedAt:
      moduleHealthState.lastLoadedAt

    });

  }catch(error){

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

    const healthScore =
      calculateModuleHealthScore();

    const health =
      safeFreeze({

        status:
        getModuleHealthStatus(
          healthScore
        ),

        healthScore,

        counts:
        getModuleCounts(),

        diagnostics:{

          ...moduleHealthState.diagnostics

        },

        lastLoadedAt:
        moduleHealthState.lastLoadedAt,

        timestamp:
        Date.now()

      });

    if(
      typeof emitSystemEvent ===
      "function"
    ){

      await emitSystemEvent(

        MODULE_EVENTS.HEALTHCHECK,

        {

          source:
          "module-health",

          health

        }

      );

    }

    return health;

  }catch(error){

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
      typeof value === "number" &&
      key in moduleHealthState.diagnostics
    ){

      moduleHealthState.diagnostics[key] =
        value;

    }

  });

  return true;

}



function markModuleLoaded(){

  moduleHealthState.lastLoadedAt =
    Date.now();

  moduleHealthState.diagnostics.loaded++;

  return true;

}



function resetModuleDiagnostics(){

  Object.keys(
    moduleHealthState.diagnostics
  ).forEach((key) => {

    moduleHealthState.diagnostics[key] =
      0;

  });

  moduleHealthState.lastLoadedAt =
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

if(typeof window !== "undefined"){

  Object.defineProperty(
    window,
    "ModuleHealth",
    {

      value:
      ModuleHealth,

      writable:
      false,

      configurable:
      false

    }
  );

}
