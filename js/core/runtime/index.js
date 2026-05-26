// =====================================
// RIGO AI
// RUNTIME INDEX
// SAFE RUNTIME COMPOSITION LAYER
// ENTERPRISE FINAL
// =====================================



// =====================================
// RUNTIME FILES
// =====================================

import "./analytics-runtime.js";
import "./files-runtime.js";
import "./language-runtime.js";
import "./runtime-boot-sequence.js";
import "./runtime-helpers.js";
import "./runtime-manager.js";
import "./runtime-state.js";



// =====================================
// INTERNAL STATE
// =====================================

const runtimeIndexState =
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
// HELPERS
// =====================================

function isFunction(
  value
){

  return typeof value ===
  "function";

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



function normalizeRuntimeIndexError(
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



function emitRuntimeIndexWarning(
  message,
  error = null
){

  console.warn(

    `[RuntimeIndex] ${message}`,

    error || ""

  );

}



// =====================================
// EVENTS
// =====================================

const RUNTIME_INDEX_EVENTS =
Object.freeze({

  INITIALIZATION_STARTED:
  "runtime.index.initialization.started",

  INITIALIZATION_COMPLETED:
  "runtime.index.initialization.completed",

  BOOT_STARTED:
  "runtime.index.boot.started",

  BOOT_COMPLETED:
  "runtime.index.boot.completed",

  HEALTHCHECK:
  "runtime.index.healthcheck"

});



// =====================================
// EVENT EMITTER
// =====================================

async function emitRuntimeIndexEvent(
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
        "runtime-index",

        timestamp:
        Date.now(),

        ...payload

      }

    );

    return true;

  }

  catch(error){

    emitRuntimeIndexWarning(

      `Event failed: ${event}`,

      error

    );

    return false;

  }

}



// =====================================
// VALIDATION
// =====================================

function validateRuntimeLayer(){

  if(
    typeof window ===
    "undefined"
  ){

    return false;

  }

  const requiredSystems = [

    "RuntimeManager",

    "RuntimeState",

    "RuntimeHelpers",

    "RuntimeBootSequence",

    "LanguageRuntime",

    "FileRuntime",

    "AnalyticsRuntime"

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

    emitRuntimeIndexWarning(

      `Missing systems: ${missingSystems.join(", ")}`

    );

    return false;

  }

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initializeRuntimeLayer(){

  if(
    runtimeIndexState
    .initialized
  ){

    return true;

  }

  if(
    runtimeIndexState
    .initializing
  ){

    return false;

  }

  runtimeIndexState
  .initializing =
  true;

  runtimeIndexState
  .lastError =
  null;

  try{

    await emitRuntimeIndexEvent(

      RUNTIME_INDEX_EVENTS
      .INITIALIZATION_STARTED

    );

    if(
      !validateRuntimeLayer()
    ){

      throw new Error(
        "RUNTIME LAYER VALIDATION FAILED"
      );

    }

    runtimeIndexState
    .initialized =
    true;

    runtimeIndexState
    .lastInitializedAt =
    Date.now();

    window.__RIGO_RUNTIME_READY__ =
    true;

    await emitRuntimeIndexEvent(

      RUNTIME_INDEX_EVENTS
      .INITIALIZATION_COMPLETED,

      {

        initialized:true

      }

    );

    console.info(
      "[RuntimeIndex] Runtime layer initialized"
    );

    return true;

  }

  catch(error){

    runtimeIndexState
    .lastError =
    normalizeRuntimeIndexError(
      error
    );

    emitRuntimeIndexWarning(

      "Runtime initialization failed",

      error

    );

    return false;

  }

  finally{

    runtimeIndexState
    .initializing =
    false;

  }

}



// =====================================
// BOOT
// =====================================

async function bootRuntimeLayer(){

  if(
    runtimeIndexState
    .booted
  ){

    return true;

  }

  if(
    runtimeIndexState
    .booting
  ){

    return false;

  }

  runtimeIndexState
  .booting =
  true;

  try{

    await emitRuntimeIndexEvent(

      RUNTIME_INDEX_EVENTS
      .BOOT_STARTED

    );

    const initialized =
    await initializeRuntimeLayer();

    if(
      !initialized
    ){

      throw new Error(
        "RUNTIME INITIALIZATION FAILED"
      );

    }

    const runtimeManager =
    window.RuntimeManager;

    if(

      !runtimeManager ||

      !isFunction(
        runtimeManager.boot
      )

    ){

      throw new Error(
        "INVALID RUNTIME MANAGER"
      );

    }

    const booted =
    await runtimeManager.boot();

    if(
      !booted
    ){

      throw new Error(
        "RUNTIME BOOT FAILED"
      );

    }

    runtimeIndexState
    .booted =
    true;

    runtimeIndexState
    .lastBootedAt =
    Date.now();

    await emitRuntimeIndexEvent(

      RUNTIME_INDEX_EVENTS
      .BOOT_COMPLETED,

      {

        booted:true

      }

    );

    return true;

  }

  catch(error){

    runtimeIndexState
    .lastError =
    normalizeRuntimeIndexError(
      error
    );

    emitRuntimeIndexWarning(
      "Runtime boot failed",
      error
    );

    return false;

  }

  finally{

    runtimeIndexState
    .booting =
    false;

  }

}



// =====================================
// HEALTHCHECK
// =====================================

async function getRuntimeLayerHealth(){

  try{

    const runtimeManager =
    window.RuntimeManager;

    const health =

      runtimeManager &&

      isFunction(
        runtimeManager.health
      )

      ?

      await runtimeManager.health()

      :

      null;

    const snapshot =
    safeFreeze({

      initialized:
      runtimeIndexState
      .initialized,

      booted:
      runtimeIndexState
      .booted,

      initializing:
      runtimeIndexState
      .initializing,

      booting:
      runtimeIndexState
      .booting,

      lastInitializedAt:

        runtimeIndexState
        .lastInitializedAt,

      lastBootedAt:

        runtimeIndexState
        .lastBootedAt,

      lastError:

        runtimeIndexState
        .lastError,

      runtime:
      health,

      timestamp:
      Date.now()

    });

    await emitRuntimeIndexEvent(

      RUNTIME_INDEX_EVENTS
      .HEALTHCHECK,

      {

        health:
        snapshot

      }

    );

    return snapshot;

  }

  catch(error){

    runtimeIndexState
    .lastError =
    normalizeRuntimeIndexError(
      error
    );

    emitRuntimeIndexWarning(

      "Runtime healthcheck failed",

      error

    );

    return null;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createRuntimeLayerSnapshot(){

  return safeFreeze({

    initialized:
    runtimeIndexState
    .initialized,

    booted:
    runtimeIndexState
    .booted,

    initializing:
    runtimeIndexState
    .initializing,

    booting:
    runtimeIndexState
    .booting,

    lastInitializedAt:

      runtimeIndexState
      .lastInitializedAt,

    lastBootedAt:

      runtimeIndexState
      .lastBootedAt,

    lastError:

      runtimeIndexState
      .lastError,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC SURFACE
// =====================================

const Runtime =
Object.freeze({

  Manager:
  window.RuntimeManager,

  State:
  window.RuntimeState,

  Helpers:
  window.RuntimeHelpers,

  BootSequence:
  window.RuntimeBootSequence,

  Language:
  window.LanguageRuntime,

  Files:
  window.FileRuntime,

  Analytics:
  window.AnalyticsRuntime,

  initialize:
  initializeRuntimeLayer,

  boot:
  bootRuntimeLayer,

  healthcheck:
  getRuntimeLayerHealth,

  snapshot:
  createRuntimeLayerSnapshot

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

    "Runtime",

    {

      value:
      Runtime,

      writable:false,

      configurable:false

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

      await initializeRuntimeLayer();

    }

    catch(error){

      emitRuntimeIndexWarning(

        "Queued runtime initialization failed",

        error

      );

    }

  });

}
