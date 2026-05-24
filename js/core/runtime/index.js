// =====================================
// RIGO AI
// RUNTIME INDEX
// =====================================



// =====================================
// SAFE RUNTIME ACCESS
// =====================================

function getRuntimeManager(){

  return (

    typeof RuntimeManager !==
    "undefined"

    ?

    RuntimeManager

    :

    null

  );

}



function getRuntimeState(){

  return RuntimeState
  ?.get?.() || null;

}



function getRuntimeHealth(){

  return RuntimeManager
  ?.health?.() || null;

}



// =====================================
// RUNTIME API
// =====================================

const RuntimeAPI =
Object.freeze({



  // ===================================
  // CORE
  // ===================================

  manager:
  getRuntimeManager(),



  state:
  getRuntimeState,



  health:
  getRuntimeHealth,



  // ===================================
  // RUNTIME CONTROL
  // ===================================

  boot:
  RuntimeManager
  ?.boot,



  shutdown:
  RuntimeManager
  ?.shutdown,



  recover:
  RuntimeManager
  ?.recover,



  // ===================================
  // SYSTEMS
  // ===================================

  language:

    typeof LanguageRuntime !==
    "undefined"

    ?

    LanguageRuntime

    :

    null,



  files:

    typeof FileRuntime !==
    "undefined"

    ?

    FileRuntime

    :

    null,



  analytics:

    typeof AnalyticsRuntime !==
    "undefined"

    ?

    AnalyticsRuntime

    :

    null,



  // ===================================
  // BOOT SEQUENCE
  // ===================================

  bootSequence:

    typeof RuntimeBootSequence !==
    "undefined"

    ?

    RuntimeBootSequence

    :

    null

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.RuntimeAPI =
  RuntimeAPI;

}
