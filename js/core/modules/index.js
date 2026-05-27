// =====================================
// RIGO AI
// MODULES INDEX
// CLEAN COMPOSITION LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// MODULE FILES
// =====================================

import "./module-constants.js";
import "./module-registry.js";
import "./module-runtime.js";
import "./module-health.js";
import "./module-loader.js";
import "./module-activation.js";
import "./module-kernel.js";



// =====================================
// INTERNAL STATE
// =====================================

const modulesIndexState =
Object.seal({

  initialized:false,

  booted:false,

  initializing:false,

  booting:false,

  lastInitializedAt:null,

  lastBootedAt:null,

  lastError:null

});



// =====================================
// INTERNAL HELPERS
// =====================================

function isFunction(
  value
){

  return (
    typeof value ===
    "function"
  );

}



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

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    safeFreeze(
      nestedValue,
      visited
    );

  });

  return value;

}



function normalizeModulesIndexError(
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



function emitModulesIndexWarning(
  message,
  error = null
){

  console.warn(

    `[ModulesIndex] ${message}`,

    error || ""

  );

}



// =====================================
// EVENTS
// =====================================

const MODULES_INDEX_EVENTS =
Object.freeze({

  INITIALIZATION_STARTED:
  "modules.index.initialization.started",

  INITIALIZATION_COMPLETED:
  "modules.index.initialization.completed",

  BOOT_STARTED:
  "modules.index.boot.started",

  BOOT_COMPLETED:
  "modules.index.boot.completed",

  HEALTHCHECK:
  "modules.index.healthcheck"

});



// =====================================
// EVENT EMITTER
// =====================================

async function emitModulesIndexEvent(
  event,
  payload = {}
){

  try{

    if(
      !isFunction(
        emitSystemEvent
      )
    ){

      return false;

    }

    await emitSystemEvent(

      event,

      {

        source:
        "modules-index",

        timestamp:
        Date.now(),

        ...payload

      }

    );

    return true;

  }

  catch(error){

    emitModulesIndexWarning(

      `Event failed: ${event}`,

      error

    );

    return false;

  }

}



// =====================================
// VALIDATION
// =====================================

function validateModulesLayer(){

  if(
    typeof window ===
    "undefined"
  ){

    return false;

  }

  const requiredSystems = [

    "RIGOModuleConstants",
    "RIGOModuleRegistry",
    "RIGOModuleRuntime",
    "RIGOModuleHealth",
    "RIGOModuleLoader",
    "RIGOModuleKernel",
    "RIGOModuleActivation"

  ];

  const missingSystems =

    requiredSystems.filter((systemName) => {

      return (

        typeof window[
          systemName
        ] ===

        "undefined"

      );

    });

  if(
    missingSystems.length > 0
  ){

    emitModulesIndexWarning(

      `Missing systems: ${missingSystems.join(", ")}`

    );

    return false;

  }

  return true;

}



// =====================================
// INITIALIZATION
// =====================================

async function initializeModulesLayer(){

  if(
    modulesIndexState
    .initialized
  ){

    return true;

  }

  if(
    modulesIndexState
    .initializing
  ){

    return false;

  }

  modulesIndexState
  .initializing =
  true;

  modulesIndexState
  .lastError =
  null;

  try{

    await emitModulesIndexEvent(

      MODULES_INDEX_EVENTS
      .INITIALIZATION_STARTED

    );

    if(
      !validateModulesLayer()
    ){

      throw new Error(
        "MODULE LAYER VALIDATION FAILED"
      );

    }

    const kernel =
      window.RIGOModuleKernel;

    if(

      kernel &&

      isFunction(
        kernel.initialize
      )

    ){

      const initialized =
      await kernel.initialize();

      if(
        !initialized
      ){

        throw new Error(

          "MODULE KERNEL INITIALIZATION FAILED"

        );

      }

    }

    modulesIndexState
    .initialized =
    true;

    modulesIndexState
    .lastInitializedAt =
    Date.now();

    window.__RIGO_MODULES_READY__ =
    true;

    await emitModulesIndexEvent(

      MODULES_INDEX_EVENTS
      .INITIALIZATION_COMPLETED,

      {

        initialized:true

      }

    );

    console.info(
      "[ModulesIndex] Modules layer initialized"
    );

    return true;

  }

  catch(error){

    modulesIndexState
    .lastError =
    normalizeModulesIndexError(
      error
    );

    emitModulesIndexWarning(

      "Modules initialization failed",

      error

    );

    return false;

  }

  finally{

    modulesIndexState
    .initializing =
    false;

  }

}



// =====================================
// BOOT
// =====================================

async function bootModulesLayer(){

  if(
    modulesIndexState
    .booted
  ){

    return true;

  }

  if(
    modulesIndexState
    .booting
  ){

    return false;

  }

  modulesIndexState
  .booting =
  true;

  try{

    await emitModulesIndexEvent(

      MODULES_INDEX_EVENTS
      .BOOT_STARTED

    );

    const initialized =
    await initializeModulesLayer();

    if(
      !initialized
    ){

      throw new Error(
        "MODULES INITIALIZATION FAILED"
      );

    }

    const kernel =
      window.RIGOModuleKernel;

    if(

      !kernel ||

      !isFunction(
        kernel.boot
      )

    ){

      throw new Error(
        "INVALID MODULE KERNEL"
      );

    }

    const booted =
    await kernel.boot();

    if(
      !booted
    ){

      throw new Error(
        "MODULE KERNEL BOOT FAILED"
      );

    }

    modulesIndexState
    .booted =
    true;

    modulesIndexState
    .lastBootedAt =
    Date.now();

    await emitModulesIndexEvent(

      MODULES_INDEX_EVENTS
      .BOOT_COMPLETED,

      {

        booted:true

      }

    );

    return true;

  }

  catch(error){

    modulesIndexState
    .lastError =
    normalizeModulesIndexError(
      error
    );

    emitModulesIndexWarning(
      "Auto boot failed",
      error
    );

    return false;

  }

  finally{

    modulesIndexState
    .booting =
    false;

  }

}



// =====================================
// HEALTHCHECK
// =====================================

async function getModulesLayerHealth(){

  try{

    const kernel =
      window.RIGOModuleKernel;

    const health =

      kernel &&

      isFunction(
        kernel.health
      )

      ?

      await kernel.health()

      :

      null;

    const snapshot =
    safeFreeze({

      initialized:
      modulesIndexState
      .initialized,

      booted:
      modulesIndexState
      .booted,

      initializing:
      modulesIndexState
      .initializing,

      booting:
      modulesIndexState
      .booting,

      lastInitializedAt:

        modulesIndexState
        .lastInitializedAt,

      lastBootedAt:

        modulesIndexState
        .lastBootedAt,

      lastError:

        modulesIndexState
        .lastError,

      kernel:
      health,

      timestamp:
      Date.now()

    });

    await emitModulesIndexEvent(

      MODULES_INDEX_EVENTS
      .HEALTHCHECK,

      {

        health:
        snapshot

      }

    );

    return snapshot;

  }

  catch(error){

    modulesIndexState
    .lastError =
    normalizeModulesIndexError(
      error
    );

    emitModulesIndexWarning(

      "Healthcheck failed",

      error

    );

    return null;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createModulesLayerSnapshot(){

  return safeFreeze({

    initialized:
    modulesIndexState
    .initialized,

    booted:
    modulesIndexState
    .booted,

    initializing:
    modulesIndexState
    .initializing,

    booting:
    modulesIndexState
    .booting,

    lastInitializedAt:

      modulesIndexState
      .lastInitializedAt,

    lastBootedAt:

      modulesIndexState
      .lastBootedAt,

    lastError:

      modulesIndexState
      .lastError,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const RIGOModules =
Object.freeze({



  get constants(){

    return window.RIGOModuleConstants;

  },



  get registry(){

    return window.RIGOModuleRegistry;

  },



  get runtime(){

    return window.RIGOModuleRuntime;

  },



  get health(){

    return window.RIGOModuleHealth;

  },



  get loader(){

    return window.RIGOModuleLoader;

  },



  get kernel(){

    return window.RIGOModuleKernel;

  },



  get activation(){

    return window.RIGOModuleActivation;

  },



  initialize:
  initializeModulesLayer,



  boot:
  bootModulesLayer,



  healthcheck:
  getModulesLayerHealth,



  snapshot:
  createModulesLayerSnapshot

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

    "RIGOModules",

    {

      value:
      RIGOModules,

      writable:
      false,

      configurable:
      false

    }

  );

}



// =====================================
// SAFE AUTO INITIALIZATION
// =====================================

if(
  typeof window !==
  "undefined"
){

  queueMicrotask(async() => {

    try{

      await initializeModulesLayer();

    }

    catch(error){

      emitModulesIndexWarning(

        "Queued initialization failed",

        error

      );

    }

  });

}
