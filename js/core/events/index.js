// =====================================
// RIGO AI
// EVENTS INDEX
// CLEAN EVENTS COMPOSITION LAYER
// =====================================



// =====================================
// EVENT FILES
// =====================================

import "./system-events.js";
import "./app-events.js";



// =====================================
// HELPERS
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

      "SystemEvents",
      "AppEvents"

    ];

    const missingSystems =

      requiredSystems.filter((systemName) => {

        return (
          typeof window[systemName] ===
          "undefined"
        );

      });

    if(missingSystems.length > 0){

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

  system:
  window.SystemEvents,

  app:
  window.AppEvents,

  events:
  typeof APP_EVENTS !==
  "undefined"

    ?

    APP_EVENTS

    :

    null,

  validate:
  validateEventsLayer

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
