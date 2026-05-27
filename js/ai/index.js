// =====================================
// RIGO AI
// AI INDEX
// SAFE AI COMPOSITION LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// AI FILES
// =====================================

import "./ai-kernel.js";
import "./context-manager.js";
import "./agent-manager.js";
import "./tool-executor.js";
import "./workflow-engine.js";
import "./planner-engine.js";



// =====================================
// INTERNAL STATE
// =====================================

const aiIndexState =
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

    value instanceof WeakMap ||

    value instanceof WeakSet ||

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



function normalizeAIIndexError(
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



function emitAIIndexWarning(
  message,
  error = null
){

  console.warn(

    `[AIIndex] ${message}`,

    error || ""

  );

}



// =====================================
// EVENTS
// =====================================

const AI_INDEX_EVENTS =
Object.freeze({

  INITIALIZATION_STARTED:
  "ai.index.initialization.started",

  INITIALIZATION_COMPLETED:
  "ai.index.initialization.completed",

  BOOT_STARTED:
  "ai.index.boot.started",

  BOOT_COMPLETED:
  "ai.index.boot.completed",

  HEALTHCHECK:
  "ai.index.healthcheck"

});



// =====================================
// EVENT EMITTER
// =====================================

async function emitAIIndexEvent(
  event,
  payload = {}
){

  try{

    if(
      typeof emitSystemEvent !==
      "function"
    ){

      return false;

    }

    await emitSystemEvent(

      event,

      {

        source:
        "ai-index",

        timestamp:
        Date.now(),

        ...payload

      }

    );

    return true;

  }

  catch(error){

    emitAIIndexWarning(

      `Event failed: ${event}`,

      error

    );

    return false;

  }

}



// =====================================
// VALIDATION
// =====================================

function validateAILayer(){

  if(
    typeof window ===
    "undefined"
  ){

    return false;

  }

  const requiredSystems = [

    "RIGOAIKernel",

    "RIGOContextManager",

    "RIGOAgentManager",

    "RIGOToolExecutor",

    "RIGOWorkflowEngine",

    "RIGOPlannerEngine"

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

    emitAIIndexWarning(

      `Missing systems: ${missingSystems.join(", ")}`

    );

    return false;

  }

  return true;

}



// =====================================
// KERNEL REGISTRATION
// =====================================

function registerAISystems(){

  try{

    const kernel =
    window.RIGOAIKernel;

    if(

      !kernel ||

      !isFunction(
        kernel.registerSystem
      )

    ){

      return false;

    }

    kernel.registerSystem(

      "contexts",

      window.RIGOContextManager

    );

    kernel.registerSystem(

      "agents",

      window.RIGOAgentManager

    );

    kernel.registerSystem(

      "tools",

      window.RIGOToolExecutor

    );

    kernel.registerSystem(

      "workflows",

      window.RIGOWorkflowEngine

    );

    kernel.registerSystem(

      "planner",

      window.RIGOPlannerEngine

    );

    return true;

  }

  catch(error){

    emitAIIndexWarning(
      "System registration failed",
      error
    );

    return false;

  }

}



// =====================================
// INITIALIZE
// =====================================

async function initializeAILayer(){

  if(
    aiIndexState
    .initialized
  ){

    return true;

  }

  if(
    aiIndexState
    .initializing
  ){

    return false;

  }

  aiIndexState
  .initializing =
  true;

  aiIndexState
  .lastError =
  null;

  try{

    await emitAIIndexEvent(

      AI_INDEX_EVENTS
      .INITIALIZATION_STARTED

    );

    if(
      !validateAILayer()
    ){

      throw new Error(
        "AI LAYER VALIDATION FAILED"
      );

    }

    registerAISystems();

    const initializationPipeline = [

      window.RIGOContextManager,

      window.RIGOAgentManager,

      window.RIGOToolExecutor,

      window.RIGOWorkflowEngine,

      window.RIGOPlannerEngine,

      window.RIGOAIKernel

    ];

    for(
      const system
      of initializationPipeline
    ){

      if(

        system &&

        isFunction(
          system.initialize
        )

      ){

        const initialized =
        await system.initialize();

        if(
          initialized === false
        ){

          throw new Error(
            "AI SYSTEM INITIALIZATION FAILED"
          );

        }

      }

    }

    aiIndexState
    .initialized =
    true;

    aiIndexState
    .lastInitializedAt =
    Date.now();

    window.__RIGO_AI_READY__ =
    true;

    await emitAIIndexEvent(

      AI_INDEX_EVENTS
      .INITIALIZATION_COMPLETED,

      {

        initialized:true

      }

    );

    console.info(
      "[AIIndex] AI layer initialized"
    );

    return true;

  }

  catch(error){

    aiIndexState
    .lastError =
    normalizeAIIndexError(
      error
    );

    emitAIIndexWarning(

      "AI initialization failed",

      error

    );

    return false;

  }

  finally{

    aiIndexState
    .initializing =
    false;

  }

}



// =====================================
// BOOT
// =====================================

async function bootAILayer(){

  if(
    aiIndexState
    .booted
  ){

    return true;

  }

  if(
    aiIndexState
    .booting
  ){

    return false;

  }

  aiIndexState
  .booting =
  true;

  try{

    await emitAIIndexEvent(

      AI_INDEX_EVENTS
      .BOOT_STARTED

    );

    const initialized =
    await initializeAILayer();

    if(
      !initialized
    ){

      throw new Error(
        "AI INITIALIZATION FAILED"
      );

    }

    const kernel =
    window.RIGOAIKernel;

    if(

      !kernel ||

      !isFunction(
        kernel.boot
      )

    ){

      throw new Error(
        "INVALID AI KERNEL"
      );

    }

    const booted =
    await kernel.boot();

    if(
      !booted
    ){

      throw new Error(
        "AI BOOT FAILED"
      );

    }

    aiIndexState
    .booted =
    true;

    aiIndexState
    .lastBootedAt =
    Date.now();

    await emitAIIndexEvent(

      AI_INDEX_EVENTS
      .BOOT_COMPLETED,

      {

        booted:true

      }

    );

    return true;

  }

  catch(error){

    aiIndexState
    .lastError =
    normalizeAIIndexError(
      error
    );

    emitAIIndexWarning(
      "AI boot failed",
      error
    );

    return false;

  }

  finally{

    aiIndexState
    .booting =
    false;

  }

}



// =====================================
// HEALTHCHECK
// =====================================

async function getAILayerHealth(){

  try{

    const kernel =
    window.RIGOAIKernel;

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
      aiIndexState
      .initialized,

      booted:
      aiIndexState
      .booted,

      initializing:
      aiIndexState
      .initializing,

      booting:
      aiIndexState
      .booting,

      lastInitializedAt:

        aiIndexState
        .lastInitializedAt,

      lastBootedAt:

        aiIndexState
        .lastBootedAt,

      lastError:

        aiIndexState
        .lastError,

      kernel:
      health,

      timestamp:
      Date.now()

    });

    await emitAIIndexEvent(

      AI_INDEX_EVENTS
      .HEALTHCHECK,

      {

        health:
        snapshot

      }

    );

    return snapshot;

  }

  catch(error){

    aiIndexState
    .lastError =
    normalizeAIIndexError(
      error
    );

    emitAIIndexWarning(

      "AI healthcheck failed",

      error

    );

    return null;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createAILayerSnapshot(){

  return safeFreeze({

    initialized:
    aiIndexState
    .initialized,

    booted:
    aiIndexState
    .booted,

    initializing:
    aiIndexState
    .initializing,

    booting:
    aiIndexState
    .booting,

    lastInitializedAt:

      aiIndexState
      .lastInitializedAt,

    lastBootedAt:

      aiIndexState
      .lastBootedAt,

    lastError:

      aiIndexState
      .lastError,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC SURFACE
// =====================================

const RIGOAIRuntime =
Object.freeze({

  kernel:
  window.RIGOAIKernel,

  context:
  window.RIGOContextManager,

  agents:
  window.RIGOAgentManager,

  tools:
  window.RIGOToolExecutor,

  workflows:
  window.RIGOWorkflowEngine,

  planner:
  window.RIGOPlannerEngine,

  initialize:
  initializeAILayer,

  boot:
  bootAILayer,

  healthcheck:
  getAILayerHealth,

  snapshot:
  createAILayerSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  aiIndexState,

  initializeAILayer,

  bootAILayer,

  getAILayerHealth,

  createAILayerSnapshot,

  RIGOAIRuntime

};

export default
RIGOAIRuntime;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "RIGOAIRuntime",

    {

      value:
      RIGOAIRuntime,

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

      await initializeAILayer();

    }

    catch(error){

      emitAIIndexWarning(

        "Queued AI initialization failed",

        error

      );

    }

  });

}
