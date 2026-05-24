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
// BROWSER INFO
// =====================================

function getBrowserEnvironmentInfo(){

  if(
    typeof navigator ===
    "undefined"
  ){

    return null;

  }

  return freezeEnvironmentObject({

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

  });

}



// =====================================
// ENVIRONMENT REPORT
// =====================================

function createEnvironmentReport({

  valid,
  secureContext,
  storageAccess,
  workerSupport,
  online,
  browser,
  error = null

}){

  return freezeEnvironmentObject({

    valid:
    Boolean(valid),

    secureContext:
    Boolean(secureContext),

    storageAccess:
    Boolean(storageAccess),

    workerSupport:
    Boolean(workerSupport),

    online:
    Boolean(online),

    browser,

    error:

      error
      ? String(error)
      : null,

    timestamp:
    Date.now()

  });

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

      hasWindow

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
    createEnvironmentReport({

      valid:
      validEnvironment,

      secureContext,

      storageAccess,

      workerSupport,

      online,

      browser:
      getBrowserEnvironmentInfo()

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

    return createEnvironmentReport({

      valid:false,

      secureContext:false,

      storageAccess:false,

      workerSupport:false,

      online:false,

      browser:null,

      error

    });

  }

}



// =====================================
// PUBLIC API
// =====================================

const AppEnvironment =
Object.freeze({

  validate:
  validateAppEnvironment,

  network:
  getNetworkStatus,

  storage:
  validateStorageAccess,

  workers:
  validateWorkerSupport,

  browser:
  getBrowserEnvironmentInfo

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.AppEnvironment =
  AppEnvironment;

}
