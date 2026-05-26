// =====================================
// RIGO AI
// RUNTIME BOOT SEQUENCE
// =====================================



// =====================================
// CREATE STEP
// =====================================

function createBootStep({

  name,
  critical = false,
  enabled = true,
  timeout = 10000,
  initialize = null

}){

  return Object.freeze({

    name:
    String(name),

    critical:
    Boolean(critical),

    enabled:
    Boolean(enabled),

    timeout:
    Number(timeout),

    initialize:

      typeof initialize ===
      "function"

      ?

      initialize

      :

      null

  });

}



// =====================================
// VALIDATE STEP
// =====================================

function isValidBootStep(
  step
){

  return Boolean(

    step &&

    typeof step.name ===
    "string" &&

    typeof step.critical ===
    "boolean" &&

    typeof step.enabled ===
    "boolean" &&

    typeof step.timeout ===
    "number" &&

    typeof step.initialize ===
    "function"

  );

}



// =====================================
// CREATE BOOT SEQUENCE
// =====================================

function createRuntimeBootSequence(){

  const sequence = [



    // ================================
    // CORE SYSTEMS
    // ================================

    createBootStep({

      name:"diagnostics",

      critical:true,

      initialize:
      globalThis
      ?.initializeDiagnosticsSystem

    }),

    createBootStep({

      name:"events",

      critical:true,

      initialize:
      globalThis
      ?.initializeSystemEvents

    }),

    createBootStep({

      name:"state",

      critical:true,

      initialize:
      globalThis
      ?.initializeStateManager

    }),



    // ================================
    // PLATFORM SYSTEMS
    // ================================

    createBootStep({

      name:"container",

      critical:true,

      initialize:
      globalThis
      ?.initializeContainer

    }),

    createBootStep({

      name:"modules",

      critical:true,

      initialize:
      globalThis
      ?.initializeModuleLoader

    }),

    createBootStep({

      name:"config-runtime",

      critical:false,

      initialize:
      globalThis
      ?.initializeConfigRuntime

    }),



    // ================================
    // MEMORY
    // ================================

    createBootStep({

      name:"memory",

      critical:false,

      initialize:
      globalThis
      ?.MemoryAPI
      ?.initialize

    }),



    // ================================
    // UI
    // ================================

    createBootStep({

      name:"ui",

      critical:false,

      initialize:
      globalThis
      ?.initializeUI

    }),



    // ================================
    // OPTIONAL RUNTIMES
    // ================================

    createBootStep({

      name:"voice-runtime",

      critical:false,

      initialize:
      globalThis
      ?.VoiceRuntime
      ?.initialize

    })

  ];

  return Object.freeze(

    sequence.filter(
      isValidBootStep
    )

  );

}



// =====================================
// GET STEP
// =====================================

function getBootStepByName(
  stepName
){

  return createRuntimeBootSequence()
  .find((step) => {

    return (
      step.name ===
      stepName
    );

  }) || null;

}



// =====================================
// PUBLIC API
// =====================================

const RuntimeBootSequence =
Object.freeze({

  create:
  createRuntimeBootSequence,

  getStep:
  getBootStepByName,

  validate:
  isValidBootStep

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.RuntimeBootSequence =
  RuntimeBootSequence;

}
