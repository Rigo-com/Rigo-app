// =====================================
// RIGO AI
// COMMUNICATION INDEX
// =====================================



// =====================================
// VALIDATION
// =====================================

function validateCommunicationLayer(){

  return (

    typeof CommunicationCore !==
    "undefined"

    &&

    typeof CommunicationQueue !==
    "undefined"

    &&

    typeof CommunicationStream !==
    "undefined"

    &&

    typeof CommunicationTyping !==
    "undefined"

    &&

    typeof CommunicationStorage !==
    "undefined"

    &&

    typeof CommunicationAbort !==
    "undefined"

    &&

    typeof CommunicationHelpers !==
    "undefined"

    &&

    typeof CommunicationHealth !==
    "undefined"

  );

}



// =====================================
// PUBLIC API
// =====================================

const Communication =
Object.freeze({

  core:
  CommunicationCore,

  queue:
  CommunicationQueue,

  stream:
  CommunicationStream,

  typing:
  CommunicationTyping,

  storage:
  CommunicationStorage,

  abort:
  CommunicationAbort,

  helpers:
  CommunicationHelpers,

  health:
  CommunicationHealth

});



// =====================================
// SAFE ACCESS
// =====================================

function getCommunicationLayer(){

  if(
    !validateCommunicationLayer()
  ){

    return null;

  }

  return Communication;

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.Communication =
  Communication;

  window.getCommunicationLayer =
  getCommunicationLayer;

  window.validateCommunicationLayer =
  validateCommunicationLayer;

}



if(
  typeof globalThis !==
  "undefined"
){

  globalThis.Communication =
  Communication;

}
