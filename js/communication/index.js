// =====================================
// RIGO AI
// COMMUNICATION INDEX
// FINAL HARDENED EDITION
// =====================================



// =====================================
// IMPORTS
// =====================================

import "./communication-abort.js";
import "./communication-core.js";
import "./communication-health.js";
import "./communication-helpers.js";
import "./communication-queue.js";
import "./communication-storage.js";
import "./communication-stream.js";
import "./communication-typing.js";



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

  Object.defineProperty(

    window,

    "Communication",

    {

      value:
      Communication,

      writable:
      false,

      configurable:
      false

    }

  );



  Object.defineProperty(

    window,

    "getCommunicationLayer",

    {

      value:
      getCommunicationLayer,

      writable:
      false,

      configurable:
      false

    }

  );



  Object.defineProperty(

    window,

    "validateCommunicationLayer",

    {

      value:
      validateCommunicationLayer,

      writable:
      false,

      configurable:
      false

    }

  );

}
