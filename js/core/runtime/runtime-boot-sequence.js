// =====================================
// RIGO AI
// RUNTIME BOOT SEQUENCE
// =====================================



// =====================================
// CREATE BOOT SEQUENCE
// =====================================

function createRuntimeBootSequence(){

  return [



    // ================================
    // CORE SYSTEMS
    // ================================

    {

      name:"diagnostics",

      critical:true,

      initialize:
      initializeDiagnosticsSystem

    },

    {

      name:"events",

      critical:true,

      initialize:
      initializeSystemEvents

    },

    {

      name:"state",

      critical:true,

      initialize:
      initializeStateManager

    },



    // ================================
    // PLATFORM SYSTEMS
    // ================================

    {

      name:"container",

      critical:true,

      initialize:
      initializeDependencyContainer

    },

    {

      name:"modules",

      critical:true,

      initialize:
      initializeModuleLoader

    },

    {

      name:"config-runtime",

      critical:false,

      initialize:
      initializeConfigRuntime

    },



    // ================================
    // MEMORY
    // ================================

    {

      name:"memory",

      critical:false,

      initialize:
      MemoryAPI
      ?.initialize

    },



    // ================================
    // UI
    // ================================

    {

      name:"ui",

      critical:false,

      initialize:
      initializeUI

    },



    // ================================
    // FUTURE RUNTIMES
    // ================================

    {

      name:"notifications",

      critical:false,

      initialize:
      NotificationRuntime
      ?.initialize

    },

    {

      name:"background-sync",

      critical:false,

      initialize:
      BackgroundSyncRuntime
      ?.initialize

    },

    {

      name:"voice-runtime",

      critical:false,

      initialize:
      VoiceRuntime
      ?.initialize

    },

    {

      name:"offline-runtime",

      critical:false,

      initialize:
      OfflineRuntime
      ?.initialize

    }

  ];

}
