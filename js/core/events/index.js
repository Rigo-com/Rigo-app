// =====================================
// RIGO AI
// EVENTS INDEX
// CLEAN EVENTS COMPOSITION LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// EVENT FILES
// =====================================

import "./system-events.js";
import "./app-events.js";



// =====================================
// INTERNAL HELPERS
// =====================================

function emitEventsWarning(
  message,
  error = null
){

  console.warn(

    `[EventsIndex] ${message}`,

    error || ""

  );

}



function getGlobalEvent(
  eventName
){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return null;

    }

    return (
      window[eventName] ||
      null
    );

  }

  catch(error){

    emitEventsWarning(
      `Failed resolving event system: ${eventName}`,
      error
    );

    return null;

  }

}



// =====================================
// VALIDATION
// =====================================

function validateEventsLayer(){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return false;

    }

    const requiredSystems = [

      "RIGOSystemEvents",
      "RIGOAppEvents"

    ];

    const missingSystems =

      requiredSystems.filter((systemName) => {

        return (
          typeof window[systemName] ===
          "undefined"
        );

      });

    if(
      missingSystems.length > 0
    ){

      emitEventsWarning(

        `Missing systems: ${missingSystems.join(", ")}`

      );

      return false;

    }

    return true;

  }

  catch(error){

    emitEventsWarning(
      "Validation failed",
      error
    );

    return false;

  }

}



// =====================================
// EVENTS API
// =====================================

const EventsAPI =
Object.freeze({



  validate:
  validateEventsLayer,



  // ===================================
  // SAFE ACCESSORS
  // ===================================

  get system(){

    return getGlobalEvent(
      "RIGOSystemEvents"
    );

  },



  get app(){

    return getGlobalEvent(
      "RIGOAppEvents"
    );

  },



  get events(){

    return getGlobalEvent(
      "APP_EVENTS"
    );

  }

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "EventsAPI",

    {

      value:
      EventsAPI,

      writable:
      false,

      configurable:
      false

    }

  );

}
