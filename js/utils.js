// =====================================
// RIGO AI
// UTILS
// PRODUCTION FINAL
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

  return new Promise(
    (resolve) => {

      setTimeout(

        resolve,

        Math.max(
          0,
          Math.trunc(ms)
        )

      );

    }
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

      console.error(
        "DEEP CLONE ERROR:",
        cloneError
      );

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

  const safePrefix =
  String(
    prefix || "id"
  ).trim();

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



// =====================================
// MESSAGE ID
// =====================================

function createMessageId(){

  return createUniqueId(
    "msg"
  );

}



// =====================================
// CHAT ID
// =====================================

function createChatId(){

  return createUniqueId(
    "chat"
  );

}
