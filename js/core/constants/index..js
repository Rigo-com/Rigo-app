// =====================================
// RIGO AI
// CORE CONSTANTS INDEX
// =====================================



const ConstantsAPI =
Object.freeze({

  phases:
  APP_PHASES,

  runtimeEvents:
  RUNTIME_EVENTS,

  runtimeStates:
  RUNTIME_STATES,

  runtimeManager:
  RUNTIME_MANAGER_CONFIG,

  systemEventConfig:
  SYSTEM_EVENT_CONFIG,

  systemEventPriorities:
  SYSTEM_EVENT_PRIORITIES,

  systemEventTypes:
  SYSTEM_EVENT_TYPES

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.ConstantsAPI =
  ConstantsAPI;

}
