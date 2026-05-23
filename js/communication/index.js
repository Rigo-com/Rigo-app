// =====================================
// RIGO AI
// COMMUNICATION INDEX
// COMMUNICATION RUNTIME EXPORTS
// =====================================



// =====================================
// VALIDATE RUNTIME
// =====================================

function validateCommunicationRuntime(){

  return (

    typeof CommunicationRuntime ===
    "object"

    &&

    typeof CommunicationRuntime
    .initialize ===
    "function"

    &&

    typeof CommunicationRuntime
    .send ===
    "function"

    &&

    typeof CommunicationRuntime
    .abort ===
    "function"

    &&

    typeof CommunicationRuntime
    .abortAll ===
    "function"

    &&

    typeof CommunicationRuntime
    .recover ===
    "function"

    &&

    typeof CommunicationRuntime
    .status ===
    "function"

    &&

    typeof CommunicationRuntime
    .reset ===
    "function"

    &&

    typeof CommunicationRuntime
    .destroy ===
    "function"

  );

}



// =====================================
// SAFE EXPORT
// =====================================

const CommunicationModule =
Object.freeze({

  runtime:

    validateCommunicationRuntime()

    ?

    CommunicationRuntime

    :

    null,

  config:

    typeof COMMUNICATION_RUNTIME_CONFIG ===
    "object"

    ?

    COMMUNICATION_RUNTIME_CONFIG

    :

    null,

  states:

    typeof COMMUNICATION_RUNTIME_STATES ===
    "object"

    ?

    COMMUNICATION_RUNTIME_STATES

    :

    null,

  events:

    typeof COMMUNICATION_RUNTIME_EVENTS ===
    "object"

    ?

    COMMUNICATION_RUNTIME_EVENTS

    :

    null

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  globalThis
  .CommunicationModule =
  CommunicationModule;

}



// =====================================
// MODULE EXPORT
// =====================================

export default
CommunicationModule;

export {

  CommunicationRuntime,

  COMMUNICATION_RUNTIME_CONFIG,

  COMMUNICATION_RUNTIME_STATES,

  COMMUNICATION_RUNTIME_EVENTS

};
