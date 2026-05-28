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

const RIGOCommunicationRuntime =
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

  return RIGOCommunicationRuntime;

}



// =====================================
// EXPORTS
// =====================================

export {

  validateCommunicationLayer,

  getCommunicationLayer,

  RIGOCommunicationRuntime

};

export default
RIGOCommunicationRuntime;



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOCommunicationRuntime",

    {

      value:
      RIGOCommunicationRuntime,

      writable:
      false,

      configurable:
      false

    }

  );
}
