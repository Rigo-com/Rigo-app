// =====================================
// RIGO AI
// APP ENVIRONMENT
// =====================================



// =====================================
// IMMUTABLE
// =====================================

function freezeEnvironmentObject(
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

      freezeEnvironmentObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// STORAGE
// =====================================

function validateStorageAccess(){

  try{

    if(
      typeof localStorage ===
      "undefined"
    ){

      return false;

    }

    const testKey =
    "__rigo_env_test__";

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
// WORKERS
// =====================================

function validateWorkerSupport(){

  return (
    typeof Worker !==
    "undefined"
  );

}



// =====================================
// NETWORK
// =====================================

function getNetworkStatus(){

  try{

    if(
      typeof navigator ===
      "undefined"
    ){

      return false;

    }

    return navigator.onLine !==
    false;

  }

  catch(error){

    return false;

  }

}



// =====================================
// ENVIRONMENT
// =====================================

function validateAppEnvironment(){

  try{

    const hasWindow =

      typeof window !==
      "undefined";

    const hasDocument =

      typeof document !==
      "undefined";

    const hasNavigator =

      typeof navigator !==
      "undefined";

    const secureContext =

      typeof window !==
      "undefined"

      ? Boolean(
          window
          .isSecureContext
        )

      : false;

    const storageAccess =
    validateStorageAccess();

    const workerSupport =
    validateWorkerSupport();

    const online =
    getNetworkStatus();

    const validEnvironment =

      hasWindow &&

      hasDocument &&

      hasNavigator;

    const report =
    freezeEnvironmentObject({

      valid:
      validEnvironment,

      secureContext,

      storageAccess,

      workerSupport,

      online,

      browser:{

        userAgent:

          navigator
          ?.userAgent ||

          null,

        language:

          navigator
          ?.language ||

          null,

        platform:

          navigator
          ?.platform ||

          null

      },

      timestamp:
      Date.now()

    });

    if(

      !validEnvironment &&

      typeof logDiagnosticError ===
      "function"

    ){

      logDiagnosticError(

        "INVALID APP ENVIRONMENT",

        report

      );

    }

    return report;

  }

  catch(error){

    if(
      typeof logDiagnosticError ===
      "function"
    ){

      logDiagnosticError(

        "ENVIRONMENT VALIDATION FAILED",

        {

          error:
          String(error)

        }

      );

    }

    return freezeEnvironmentObject({

      valid:false,

      error:
      String(error),

      timestamp:
      Date.now()

    });

  }

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.validateAppEnvironment =
  validateAppEnvironment;

}
