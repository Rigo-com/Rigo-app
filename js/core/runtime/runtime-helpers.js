// =====================================
// RIGO AI
// RUNTIME HELPERS
// =====================================



// =====================================
// TYPE CHECKS
// =====================================

function isFunction(
  value
){

  return typeof value ===
  "function";

}



function isObject(
  value
){

  return (

    value !== null &&

    typeof value ===
    "object"

  );

}



function isPlainObject(
  value
){

  if(
    !isObject(value)
  ){

    return false;

  }

  const prototype =
  Object.getPrototypeOf(
    value
  );

  return (

    prototype ===
    Object.prototype ||

    prototype ===
    null

  );

}



// =====================================
// ERROR HELPERS
// =====================================

function normalizeRuntimeError(
  error
){

  if(
    error instanceof Error
  ){

    return error.message;

  }

  return String(
    error || "UNKNOWN ERROR"
  );

}



// =====================================
// SAFE FREEZE
// =====================================

function safeFreeze(
  value,
  visited = new WeakSet()
){

  if(
    !isObject(value)
  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  if(

    value instanceof Date ||

    value instanceof Map ||

    value instanceof Set ||

    value instanceof Promise ||

    value instanceof RegExp

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

    safeFreeze(
      nestedValue,
      visited
    );

  });

  return value;

}



// =====================================
// SAFE CLONE
// =====================================

function safeClone(
  value
){

  try{

    return structuredClone(
      value
    );

  }

  catch{

    return JSON.parse(
      JSON.stringify(
        value
      )
    );

  }

}



// =====================================
// TIME HELPERS
// =====================================

function getCurrentTimestamp(){

  return Date.now();

}



function createDuration(
  startedAt,
  endedAt = Date.now()
){

  if(
    !startedAt
  ){

    return 0;

  }

  return Math.max(

    0,

    endedAt -
    startedAt

  );

}



// =====================================
// PUBLIC API
// =====================================

const RuntimeHelpers =
Object.freeze({

  isFunction,

  isObject,

  isPlainObject,

  normalizeRuntimeError,

  safeFreeze,

  safeClone,

  getCurrentTimestamp,

  createDuration

});



// =====================================
// EXPORTS
// =====================================

export {

  isFunction,

  isObject,

  isPlainObject,

  normalizeRuntimeError,

  safeFreeze,

  safeClone,

  getCurrentTimestamp,

  createDuration,

  RuntimeHelpers

};

export default
RuntimeHelpers;
