// =====================================
// RIGO AI
// SHARED UTILITIES
// ENTERPRISE FINAL
// =====================================



// =====================================
// WAIT
// =====================================

function wait(ms){

  if(
    !Number.isFinite(ms)
  ){

    return Promise.resolve();

  }

  const safeTimeout =

    Math.min(

      60000,

      Math.max(
        0,
        Math.trunc(ms)
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
// NOOP
// =====================================

function noop(){}



// =====================================
// CLAMP
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
// SAFE TRIM
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
// SAFE PARSE NUMBER
// =====================================

function safeParseNumber(
  value,
  fallback = 0
){

  const normalized =
  Number(value);

  if(
    !Number.isFinite(
      normalized
    )
  ){

    return fallback;

  }

  return normalized;

}



// =====================================
// SAFE PARSE BOOLEAN
// =====================================

function safeParseBoolean(
  value
){

  return Boolean(value);

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
// SAFE EXECUTE
// =====================================

function safeExecute(
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

    return callback();

  }

  catch(error){

    if(
      typeof safeLogError ===
      "function"
    ){

      safeLogError(
        error
      );

    }

    return fallback;

  }

}



// =====================================
// DEEP FREEZE
// =====================================

function deepFreeze(
  object,
  seen = new WeakSet()
){

  if(

    !object ||

    (

      typeof object !==
      "object" &&

      typeof object !==
      "function"

    )

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

  if(
    seen.has(object)
  ){

    return object;

  }

  seen.add(object);

  Object
  .getOwnPropertyNames(
    object
  )
  .forEach((key) => {

    const value =
    object[key];

    if(

      value &&

      (

        typeof value ===
        "object" ||

        typeof value ===
        "function"

      )

    ){

      deepFreeze(
        value,
        seen
      );

    }

  });

  return Object.freeze(
    object
  );

}



// =====================================
// DEEP CLONE
// =====================================

function deepClone(data){

  if(
    typeof data ===
    "undefined"
  ){

    return undefined;

  }

  try{

    return structuredClone(
      data
    );

  }

  catch(error){

    try{

      return JSON.parse(
        JSON.stringify(data)
      );

    }

    catch(cloneError){

      if(
        typeof safeLogError ===
        "function"
      ){

        safeLogError(

          "DEEP CLONE ERROR:",

          cloneError

        );

      }

      return null;

    }

  }

}



// =====================================
// CREATE UNIQUE ID
// =====================================

function createUniqueId(
  prefix = "id"
){

  const normalizedPrefix =
  safeTrim(
    prefix || "id"
  );

  const safePrefix =

    normalizedPrefix ||

    "id";

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

  return (

    safePrefix +

    "_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .substring(2,9)

  );

}



// =====================================
// DEBOUNCE
// =====================================

function debounce(
  callback,
  delay = 0
){

  let timeoutId =
  null;

  return function(
    ...args
  ){

    clearTimeout(
      timeoutId
    );

    timeoutId =
    setTimeout(() => {

      callback.apply(
        this,
        args
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
  delay = 0
){

  let waiting =
  false;

  return function(
    ...args
  ){

    if(waiting){

      return;
    }

    waiting = true;

    callback.apply(
      this,
      args
    );

    setTimeout(() => {

      waiting = false;

    },

    Math.max(
      0,
      Number(delay) || 0
    ));

  };

}
