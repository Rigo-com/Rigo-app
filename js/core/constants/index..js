// =====================================
// RIGO AI
// CONSTANTS INDEX
// SAFE CONSTANTS COMPOSITION LAYER
// =====================================



// =====================================
// HELPERS
// =====================================

function getConstant(
  constantName
){

  try{

    if(
      typeof DependencySystem ===
      "undefined"
    ){

      return null;

    }

    if(
      typeof DependencySystem
      .resolve !==
      "function"
    ){

      return null;

    }

    return DependencySystem
    .resolve(
      constantName
    );

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

const ConstantsAPI =
safeFreeze({



  // ===================================
  // GENERIC
  // ===================================

  get(
    constantName
  ){

    return safeFreeze(
      getConstant(
        constantName
      )
    );

  },



  // ===================================
  // APP
  // ===================================

  phases(){

    return safeFreeze(
      getConstant(
        "APP_PHASES"
      )
    );

  },



  validatePhase(){

    return getConstant(
      "isValidAppPhase"
    );

  },



  // ===================================
  // RUNTIME
  // ===================================

  runtime:{

    events(){

      return safeFreeze(
        getConstant(
          "RUNTIME_EVENTS"
        )
      );

    },



    states(){

      return safeFreeze(
        getConstant(
          "RUNTIME_STATES"
        )
      );

    },



    config(){

      return safeFreeze(
        getConstant(
          "RUNTIME_MANAGER_CONFIG"
        )
      );

    },



    validateState(){

      return getConstant(
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
        getConstant(
          "SYSTEM_EVENTS_CONFIG"
        )
      );

    },



    priorities(){

      return safeFreeze(
        getConstant(
          "SYSTEM_EVENT_PRIORITIES"
        )
      );

    },



    types(){

      return safeFreeze(
        getConstant(
          "SYSTEM_EVENT_TYPES"
        )
      );

    },



    validateType(){

      return getConstant(
        "isValidSystemEventType"
      );

    },



    validatePriority(){

      return getConstant(
        "isValidSystemEventPriority"
      );

    }

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

    "ConstantsAPI",

    {

      value:
      ConstantsAPI,

      writable:false,

      configurable:false

    }

  );

}
