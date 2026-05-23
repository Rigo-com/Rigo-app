// =====================================
// RIGO AI
// RUNTIME BOOT SEQUENCE
// =====================================



// =====================================
// SAFE INITIALIZER
// =====================================

function resolveRuntimeInitializer(
  initializer
){

  return (
    typeof initializer ===
    "function"
  )

  ? initializer

  : null;

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

    {

      name:"diagnostics",

      critical:true,

      initialize:
      resolveRuntimeInitializer(

        typeof initializeDiagnosticsSystem ===
        "function"

        ?

        initializeDiagnosticsSystem

        :

        null

      )

    },

    {

      name:"events",

      critical:true,

      initialize:
      resolveRuntimeInitializer(

        typeof initializeSystemEvents ===
        "function"

        ?

        initializeSystemEvents

        :

        null

      )

    },

    {

      name:"state",

      critical:true,

      initialize:
      resolveRuntimeInitializer(

        typeof initializeStateManager ===
        "function"

        ?

        initializeStateManager

        :

        null

      )

    },



    // ================================
    // PLATFORM SYSTEMS
    // ================================

    {

      name:"container",

      critical:true,

      initialize:
      resolveRuntimeInitializer(

        typeof initializeDependencyContainer ===
        "function"

        ?

        initializeDependencyContainer

        :

        null

      )

    },

    {

      name:"modules",

      critical:true,

      initialize:
      resolveRuntimeInitializer(

        typeof initializeModuleLoader ===
        "function"

        ?

        initializeModuleLoader

        :

        null

      )

    },

    {

      name:"config-runtime",

      critical:false,

      initialize:
      resolveRuntimeInitializer(

        typeof initializeConfigRuntime ===
        "function"

        ?

        initializeConfigRuntime

        :

        null

      )

    },



    // ================================
    // MEMORY
    // ================================

    {

      name:"memory",

      critical:false,

      initialize:
      resolveRuntimeInitializer(

        MemoryAPI
        ?.initialize

      )

    },



    // ================================
    // UI
    // ================================

    {

      name:"ui",

      critical:false,

      initialize:
      resolveRuntimeInitializer(

        typeof initializeUI ===
        "function"

        ?

        initializeUI

        :

        null

      )

    },



    // ================================
    // FUTURE RUNTIMES
    // ================================

    {

      name:"notifications",

      critical:false,

      initialize:
      resolveRuntimeInitializer(

        NotificationRuntime
        ?.initialize

      )

    },

    {

      name:"background-sync",

      critical:false,

      initialize:
      resolveRuntimeInitializer(

        BackgroundSyncRuntime
        ?.initialize

      )

    },

    {

      name:"voice-runtime",

      critical:false,

      initialize:
      resolveRuntimeInitializer(

        VoiceRuntime
        ?.initialize

      )

    },

    {

      name:"offline-runtime",

      critical:false,

      initialize:
      resolveRuntimeInitializer(

        OfflineRuntime
        ?.initialize

      )

    }

  ];

  return sequence.filter(
    isValidBootStep
  );

}



// =====================================
// PUBLIC API
// =====================================

const RuntimeBootSequence =
Object.freeze({

  create:
  createRuntimeBootSequence

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

  window.createRuntimeBootSequence =
  createRuntimeBootSequence;

}
