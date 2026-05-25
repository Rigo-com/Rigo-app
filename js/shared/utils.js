// =====================================
// RIGO AI
// SHARED UTILITIES
// ENTERPRISE FINAL STABLE
// =====================================



// =====================================
// SHARED CONFIG
// =====================================

const SHARED_UTILS_CONFIG =
Object.freeze({

  MAX_TIMEOUT:
  60000,

  DEFAULT_DELAY:
  0

});



// =====================================
// WAIT
// =====================================

function wait(
  milliseconds
){

  if(
    !Number.isFinite(
      milliseconds
    )
  ){

    return Promise.resolve();

  }

  const safeTimeout =

    Math.min(

      SHARED_UTILS_CONFIG
      .MAX_TIMEOUT,

      Math.max(
        0,
        Math.trunc(
          milliseconds
        )
      )

    );

  return new Promise(
    (resolve) => {

      setTimeout(
        resolve,
        safeTimeout
      );

    }
  );

}



// =====================================
// NO OPERATION
// =====================================

function noop(){}



// =====================================
// CLAMP NUMBER
// =====================================

function clamp(
  value,
  minimum,
  maximum
){

  const normalized =
  Number(value);

  if(
    !Number.isFinite(
      normalized
    )
  ){

    return minimum;

  }

  return Math.min(

    maximum,

    Math.max(
      minimum,
      normalized
    )

  );

}



// =====================================
// SAFE STRING TRIM
// =====================================

function safeTrim(
  value
){

  if(
    value == null
  ){

    return "";
  }

  return String(value)
  .trim();

}



// =====================================
// SAFE NUMBER
// =====================================

function safeParseNumber(
  value,
  fallback = 0
){

  const normalized =
  Number(value);

  return Number.isFinite(
    normalized
  )

  ? normalized

  : fallback;

}



// =====================================
// SAFE BOOLEAN
// =====================================

function safeParseBoolean(
  value
){

  if(
    typeof value ===
    "boolean"
  ){

    return value;

  }

  if(
    typeof value ===
    "number"
  ){

    return value !== 0;

  }

  if(
    typeof value ===
    "string"
  ){

    const normalized =
    value
    .trim()
    .toLowerCase();

    if(

      normalized ===
      "true"

      ||

      normalized ===
      "1"

      ||

      normalized ===
      "yes"

      ||

      normalized ===
      "on"

    ){

      return true;

    }

    if(

      normalized ===
      "false"

      ||

      normalized ===
      "0"

      ||

      normalized ===
      "no"

      ||

      normalized ===
      "off"

      ||

      normalized ===
      ""

    ){

      return false;

    }

  }

  return Boolean(
    value
  );

}



// =====================================
// IS PLAIN OBJECT
// =====================================

function isPlainObject(
  value
){

  if(

    !value ||

    typeof value !==
    "object"

  ){

    return false;

  }

  const prototype =
  Object.getPrototypeOf(
    value
  );

  return (

    prototype ===
    Object.prototype

    ||

    prototype === null

  );

}



// =====================================
// SAFE EXECUTION
// =====================================

async function safeExecute(
  callback,
  fallback = null
){

  if(
    typeof callback !==
    "function"
  ){

    return fallback;

  }

  try{

    return await callback();

  }

  catch(error){

    try{

      if(
        typeof safeLogError ===
        "function"
      ){

        safeLogError(
          error
        );

      }

      else{

        console.error(
          error
        );

      }

    }

    catch(logError){

      console.error(
        logError
      );

    }

    return fallback;

  }

}



// =====================================
// SHARED DEEP FREEZE
// =====================================

function sharedDeepFreeze(
  object,
  visited = new WeakSet()
){

  if(

    !object ||

    (

      typeof object !==
      "object"

      &&

      typeof object !==
      "function"

    )

  ){

    return object;

  }

  if(
    visited.has(object)
  ){

    return object;

  }

  if(
    Object.isFrozen(
      object
    )
  ){

    return object;

  }

  visited.add(
    object
  );

  Reflect
  .ownKeys(object)
  .forEach((key) => {

    try{

      const value =
      object[key];

      if(

        value &&

        (

          typeof value ===
          "object"

          ||

          typeof value ===
          "function"

        )

      ){

        sharedDeepFreeze(
          value,
          visited
        );

      }

    }

    catch(error){

      // IGNORE ACCESS ERRORS
    }

  });

  return Object.freeze(
    object
  );

}



// =====================================
// SHARED DEEP CLONE
// =====================================

function sharedDeepClone(
  value
){

  if(
    typeof value ===
    "undefined"
  ){

    return undefined;

  }

  try{

    if(
      typeof structuredClone ===
      "function"
    ){

      return structuredClone(
        value
      );

    }

  }

  catch(error){

    // FALLBACK
  }

  try{

    return JSON.parse(
      JSON.stringify(
        value
      )
    );

  }

  catch(error){

    safeExecute(() => {

      console.error(
        "SHARED_DEEP_CLONE_FAILED",
        error
      );

    });

    return null;

  }

}



// =====================================
// UNIQUE ID
// =====================================

function createUniqueId(
  prefix = "id"
){

  const normalizedPrefix =
  safeTrim(prefix);

  const safePrefix =

    normalizedPrefix ||

    "id";

  try{

    if(

      typeof crypto !==
      "undefined"

      &&

      typeof crypto
      .randomUUID ===
      "function"

    ){

      return (

        safePrefix +

        "_" +

        crypto.randomUUID()

      );

    }

  }

  catch(error){

    // FALLBACK
  }

  return (

    safePrefix +

    "_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



// =====================================
// DEBOUNCE
// =====================================

function debounce(
  callback,
  delay =

  SHARED_UTILS_CONFIG
  .DEFAULT_DELAY

){

  if(
    typeof callback !==
    "function"
  ){

    return noop;

  }

  let timeoutId =
  null;

  return function(
    ...args
  ){

    clearTimeout(
      timeoutId
    );

    timeoutId =
    setTimeout(async() => {

      await safeExecute(
        () => callback.apply(
          this,
          args
        )
      );

    },

    Math.max(
      0,
      Number(delay) || 0
    ));

  };

}



// =====================================
// THROTTLE
// =====================================

function throttle(
  callback,
  delay =

  SHARED_UTILS_CONFIG
  .DEFAULT_DELAY

){

  if(
    typeof callback !==
    "function"
  ){

    return noop;

  }

  let waiting =
  false;

  return function(
    ...args
  ){

    if(waiting){

      return;
    }

    waiting = true;

    safeExecute(() => {

      return callback.apply(
        this,
        args
      );

    });

    setTimeout(() => {

      waiting = false;

    },

    Math.max(
      0,
      Number(delay) || 0
    ));

  };

}



// =====================================
// PUBLIC API
// =====================================

const SharedUtils =
Object.freeze({

  wait,

  noop,

  clamp,

  safeTrim,

  safeParseNumber,

  safeParseBoolean,

  isPlainObject,

  safeExecute,

  deepFreeze:
  sharedDeepFreeze,

  deepClone:
  sharedDeepClone,

  createUniqueId,

  debounce,

  throttle

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

    "SharedUtils",

    {

      value:
      SharedUtils,

      writable:
      false,

      configurable:
      false

    }

  );

}
