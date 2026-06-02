// =====================================
// RIGO AI
// AUTH UTILS
// =====================================



// =====================================
// ERROR
// =====================================

export function getSafeErrorMessage(
  error
){

  if(
    error instanceof Error
  ){

    return (
      error.message ||
      "UNKNOWN_ERROR"
    );

  }

  return String(
    error ||
    "UNKNOWN_ERROR"
  );

}



// =====================================
// CLONE
// =====================================

export function safeCloneAuth(
  value
){

  if(
    value === undefined
  ){

    return undefined;

  }

  try{

    if(
      typeof deepClone ===
      "function"
    ){

      return deepClone(
        value
      );

    }

    if(
      typeof structuredClone ===
      "function"
    ){

      return structuredClone(
        value
      );

    }

    return JSON.parse(
      JSON.stringify(
        value
      )
    );

  }

  catch(error){

    return null;

  }

}



// =====================================
// FREEZE
// =====================================

export function freezeAuthObject(
  value
){

  if(

    value === null ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(
    typeof deepFreeze ===
    "function"
  ){

    return deepFreeze(
      value
    );

  }

  return Object.freeze(
    value
  );

}



// =====================================
// ENVIRONMENT
// =====================================

export function isBrowserEnvironment(){

  return (

    typeof window !==
    "undefined"

    &&

    typeof localStorage !==
    "undefined"

  );

}



export function isStorageAvailable(){

  try{

    if(
      !isBrowserEnvironment()
    ){

      return false;

    }

    const testKey =
    "__rigo_test__";

    localStorage.setItem(
      testKey,
      "1"
    );

    localStorage.removeItem(
      testKey
    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// IDS
// =====================================

export function createUniqueId(
  prefix = "id"
){

  const normalizedPrefix =
  String(
    prefix || "id"
  )
  .trim();

  if(

    typeof crypto !==
    "undefined"

    &&

    typeof crypto.randomUUID ===
    "function"

  ){

    return (

      normalizedPrefix +

      "_" +

      crypto.randomUUID()

    );

  }

  return (

    normalizedPrefix +

    "_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



export function createSecureToken(){

  if(

    typeof crypto !==
    "undefined"

    &&

    typeof crypto.getRandomValues ===
    "function"

  ){

    const array =
    new Uint8Array(32);

    crypto.getRandomValues(
      array
    );

    return Array.from(array)
    .map((byte) => {

      return byte
      .toString(16)
      .padStart(2,"0");

    })
    .join("");

  }

  return createUniqueId(
    "token"
  );

}
