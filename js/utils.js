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
  String(
    prefix || "id"
  )
  .trim();

  const safePrefix =

    normalizedPrefix ||

    "id";

  if(
    typeof crypto !==
    "undefined" &&

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
