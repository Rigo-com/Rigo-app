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
      typeof window ===
      "undefined"
    ){

      return null;

    }

    const constantValue =
      window[constantName];

    if(
      typeof constantValue ===
      "undefined"
    ){

      console.warn(
        `[ConstantsAPI] Missing constant: ${constantName}`
      );

      return null;

    }

    return constantValue;

  }

  catch(error){

    console.warn(
      `[ConstantsAPI] Failed resolving constant: ${constantName}`,
      error
    );

    return null;

  }

}



// =====================================
// SAFE FREEZE
// =====================================

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

    value instanceof Map ||
    value instanceof Set ||
    value instanceof Date ||
    value instanceof RegExp

  ){

    return value;

  }

  visited.add(value);

  Object.freeze(value);

  Object.values(value).forEach((nestedValue) => {

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
  // APP
  // ===================================

  phases:
  getConstant(
    "APP_PHASES"
  ),



  // ===================================
  // RUNTIME
  // ===================================

  runtime:{

    events:
    getConstant(
      "RUNTIME_EVENTS"
    ),

    states:
    getConstant(
      "RUNTIME_STATES"
    ),

    config:
    getConstant(
      "RUNTIME_MANAGER_CONFIG"
    )

  },



  // ===================================
  // SYSTEM EVENTS
  // ===================================

  systemEvents:{

    config:
    getConstant(
      "SYSTEM_EVENTS_CONFIG"
    ),

    priorities:
    getConstant(
      "SYSTEM_EVENT_PRIORITIES"
    ),

    types:
    getConstant(
      "SYSTEM_EVENT_TYPES"
    )

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

      writable:
      false,

      configurable:
      false

    }

  );

}
