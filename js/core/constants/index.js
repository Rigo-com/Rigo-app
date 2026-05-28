// =====================================
// RIGO AI
// CONSTANTS INDEX
// SAFE CONSTANTS COMPOSITION LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// CONSTANT FILES
// =====================================

import "./app-phases.js";
import "./runtime-events.js";
import "./runtime-manager-config.js";
import "./runtime-states.js";
import "./system-event-config.js";
import "./system-event-priorities.js";
import "./system-event-types.js";



// =====================================
// INTERNAL HELPERS
// =====================================

function getGlobalConstant(
  constantName
){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return null;

    }

    return window[
      constantName
    ] || null;

  }

  catch(error){

    console.warn(

      `[ConstantsAPI] Failed resolving constant: ${constantName}`,

      error

    );

    return null;

  }

}



function safeFreeze(
  value,
  visited = new WeakSet()
){

  if(

    !value ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  if(

    value instanceof Promise ||

    value instanceof Date ||

    value instanceof RegExp ||

    value instanceof Map ||

    value instanceof Set ||

    (
      typeof HTMLElement !==
      "undefined" &&

      value instanceof HTMLElement
    )

  ){

    return value;

  }

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    if(

      nestedValue &&

      typeof nestedValue ===
      "object"

    ){

      safeFreeze(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// CONSTANTS API
// =====================================

const RIGOConstantsRuntime =
safeFreeze({



  // ===================================
  // GENERIC
  // ===================================

  get(
    constantName
  ){

    return safeFreeze(

      getGlobalConstant(
        constantName
      )

    );

  },



  // ===================================
  // APP
  // ===================================

  phases(){

    return safeFreeze(

      getGlobalConstant(
        "APP_PHASES"
      )

    );

  },



  validatePhase(){

    return getGlobalConstant(
      "isValidAppPhase"
    );

  },



  // ===================================
  // RUNTIME
  // ===================================

  runtime:{

    events(){

      return safeFreeze(

        getGlobalConstant(
          "RUNTIME_EVENTS"
        )

      );

    },



    states(){

      return safeFreeze(

        getGlobalConstant(
          "RUNTIME_STATES"
        )

      );

    },



    config(){

      return safeFreeze(

        getGlobalConstant(
          "RUNTIME_MANAGER_CONFIG"
        )

      );

    },



    validateState(){

      return getGlobalConstant(
        "isValidRuntimeState"
      );

    }

  },



  // ===================================
  // SYSTEM EVENTS
  // ===================================

  systemEvents:{

    config(){

      return safeFreeze(

        getGlobalConstant(
          "SYSTEM_EVENTS_CONFIG"
        )

      );

    },



    priorities(){

      return safeFreeze(

        getGlobalConstant(
          "SYSTEM_EVENT_PRIORITIES"
        )

      );

    },



    types(){

      return safeFreeze(

        getGlobalConstant(
          "SYSTEM_EVENT_TYPES"
        )

      );

    },



    validateType(){

      return getGlobalConstant(
        "isValidSystemEventType"
      );

    },



    validatePriority(){

      return getGlobalConstant(
        "isValidSystemEventPriority"
      );

    }

  }

});



// =====================================
// EXPORTS
// =====================================

export {

  getGlobalConstant,

  safeFreeze,

  RIGOConstantsRuntime

};

export default
RIGOConstantsRuntime;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOConstantsRuntime",

    {

      value:
      RIGOConstantsRuntime,

      writable:
      false,

      configurable:
      false

    }

  );

}
