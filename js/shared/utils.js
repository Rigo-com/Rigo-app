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

      console.error(
        error
      );

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
// PUBLIC API
// =====================================

const SharedUtils =
Object.freeze({

  wait,

  safeTrim,

  isPlainObject,

  safeExecute,

  deepFreeze:
  sharedDeepFreeze,

  deepClone:
  sharedDeepClone,

  createUniqueId

});



// =====================================
// EXPORTS
// =====================================

export {

  wait,

  safeTrim,

  isPlainObject,

  safeExecute,

  sharedDeepFreeze,

  sharedDeepClone,

  createUniqueId,

  SharedUtils

};

export default
SharedUtils;
