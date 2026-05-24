// =====================================
// RIGO AI
// CONSTANTS INDEX
// =====================================



// =====================================
// SAFE ACCESS
// =====================================

function resolveConstant(
  constantReference
){

  return (

    typeof constantReference !==
    "undefined"

    ?

    constantReference

    :

    null

  );

}



// =====================================
// CONSTANTS API
// =====================================

const ConstantsAPI =
Object.freeze({



  // ===================================
  // APP
  // ===================================

  phases:
  resolveConstant(
    typeof APP_PHASES !==
    "undefined"

    ?

    APP_PHASES

    :

    undefined
  ),



  // ===================================
  // RUNTIME
  // ===================================

  runtimeEvents:
  resolveConstant(
    typeof RUNTIME_EVENTS !==
    "undefined"

    ?

    RUNTIME_EVENTS

    :

    undefined
  ),



  runtimeStates:
  resolveConstant(
    typeof RUNTIME_STATES !==
    "undefined"

    ?

    RUNTIME_STATES

    :

    undefined
  ),



  runtimeManager:
  resolveConstant(
    typeof RUNTIME_MANAGER_CONFIG !==
    "undefined"

    ?

    RUNTIME_MANAGER_CONFIG

    :

    undefined
  ),



  // ===================================
  // SYSTEM EVENTS
  // ===================================

  systemEventConfig:
  resolveConstant(
    typeof SYSTEM_EVENTS_CONFIG !==
    "undefined"

    ?

    SYSTEM_EVENTS_CONFIG

    :

    undefined
  ),



  systemEventPriorities:
  resolveConstant(
    typeof SYSTEM_EVENT_PRIORITIES !==
    "undefined"

    ?

    SYSTEM_EVENT_PRIORITIES

    :

    undefined
  ),



  systemEventTypes:
  resolveConstant(
    typeof SYSTEM_EVENT_TYPES !==
    "undefined"

    ?

    SYSTEM_EVENT_TYPES

    :

    undefined
  )

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "ConstantsAPI",

    {

      value:
      ConstantsAPI,

      writable:false,

      configurable:false

    }

  );

}
