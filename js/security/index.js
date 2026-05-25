// =====================================
// RIGO AI
// SECURITY INDEX
// ENTERPRISE SECURITY ENTRYPOINT
// FINAL HARDENED EDITION
// =====================================



// =====================================
// SAFE MODULE ACCESS
// =====================================

function resolveSecurityModule(
  moduleReference
){

  return (

    typeof moduleReference !==
    "undefined"

    ?

    moduleReference

    :

    null

  );

}



// =====================================
// SECURITY MODULE REGISTRY
// =====================================

const SECURITY_MODULES =
Object.freeze({

  Core:
  resolveSecurityModule(
    typeof SecurityCore !==
    "undefined"

    ?

    SecurityCore

    :

    undefined
  ),



  Freeze:
  resolveSecurityModule(
    typeof SecurityFreeze !==
    "undefined"

    ?

    SecurityFreeze

    :

    undefined
  ),



  Monitor:
  resolveSecurityModule(
    typeof SecurityMonitor !==
    "undefined"

    ?

    SecurityMonitor

    :

    undefined
  ),



  Policy:
  resolveSecurityModule(
    typeof SecurityPolicy !==
    "undefined"

    ?

    SecurityPolicy

    :

    undefined
  ),



  Report:
  resolveSecurityModule(
    typeof SecurityReport !==
    "undefined"

    ?

    SecurityReport

    :

    undefined
  ),



  Runtime:
  resolveSecurityModule(
    typeof SecurityRuntime !==
    "undefined"

    ?

    SecurityRuntime

    :

    undefined
  ),



  Sandbox:
  resolveSecurityModule(
    typeof SecuritySandbox !==
    "undefined"

    ?

    SecuritySandbox

    :

    undefined
  ),



  Sanitize:
  resolveSecurityModule(
    typeof SecuritySanitize !==
    "undefined"

    ?

    SecuritySanitize

    :

    undefined
  ),



  URL:
  resolveSecurityModule(
    typeof SecurityURL !==
    "undefined"

    ?

    SecurityURL

    :

    undefined
  ),



  Validator:
  resolveSecurityModule(
    typeof SecurityValidator !==
    "undefined"

    ?

    SecurityValidator

    :

    undefined
  )

});



// =====================================
// SECURITY INDEX STATE
// =====================================

const securityIndexState =
Object.seal({

  initialized:
  false,

  initializing:
  false,

  initializedAt:
  null,

  failedModules:
  new Set(),

  loadedModules:
  new Set(),

  lastHealthcheckAt:
  null,

  startupPromise:
  null

});



// =====================================
// SAFE LOG
// =====================================

function logSecurityIndexEvent(
  message,
  metadata = null
){

  try{

    if(
      typeof logSecurityEvent ===
      "function"
    ){

      logSecurityEvent(
        message,
        metadata
      );

      return;
    }

    console.info(
      "[RIGO SECURITY]",
      message,
      metadata || ""
    );

  }

  catch(error){

    console.error(error);

  }

}



// =====================================
// VALIDATE SECURITY MODULES
// =====================================

function validateSecurityModules(){

  securityIndexState
  .failedModules
  .clear();

  securityIndexState
  .loadedModules
  .clear();

  let valid =
  true;

  Object.entries(
    SECURITY_MODULES
  )
  .forEach(([name,module]) => {

    if(!module){

      securityIndexState
      .failedModules
      .add(name);

      valid = false;

      return;

    }

    securityIndexState
    .loadedModules
    .add(name);

  });

  return valid;

}



// =====================================
// INITIALIZE SECURITY INDEX
// =====================================

async function initializeSecurityIndex(){

  if(
    securityIndexState
    .initialized
  ){

    return true;

  }

  if(
    securityIndexState
    .startupPromise
  ){

    return securityIndexState
    .startupPromise;

  }

  securityIndexState
  .startupPromise =

  (async() => {

    if(
      securityIndexState
      .initializing
    ){

      return false;

    }

    securityIndexState
    .initializing =
    true;

    try{

      const valid =
      validateSecurityModules();

      if(!valid){

        throw new Error(
          "SECURITY_MODULE_VALIDATION_FAILED"
        );

      }

      if(

        SECURITY_MODULES
        .Runtime

        &&

        typeof SECURITY_MODULES
        .Runtime
        .initialize ===
        "function"

      ){

        const initialized =
        await SECURITY_MODULES
        .Runtime
        .initialize();

        if(!initialized){

          throw new Error(
            "SECURITY_RUNTIME_INIT_FAILED"
          );

        }

      }

      securityIndexState
      .initialized =
      true;

      securityIndexState
      .initializedAt =
      Date.now();

      securityIndexState
      .lastHealthcheckAt =
      Date.now();

      logSecurityIndexEvent(
        "SECURITY INDEX READY"
      );

      return true;

    }

    catch(error){

      logSecurityIndexEvent(

        "SECURITY INDEX FAILED",

        {

          error:
          String(error)

        }

      );

      return false;

    }

    finally{

      securityIndexState
      .initializing =
      false;

      securityIndexState
      .startupPromise =
      null;

    }

  })();

  return securityIndexState
  .startupPromise;

}



// =====================================
// SECURITY HEALTHCHECK
// =====================================

function runSecurityIndexHealthcheck(){

  securityIndexState
  .lastHealthcheckAt =
  Date.now();

  const runtimeHealthy =

    SECURITY_MODULES
    .Runtime

    &&

    typeof SECURITY_MODULES
    .Runtime
    .healthcheck ===
    "function"

    ?

    SECURITY_MODULES
    .Runtime
    .healthcheck()

    :

    false;

  return Object.freeze({

    healthy:
    Boolean(
      runtimeHealthy
    ),

    initialized:
    securityIndexState
    .initialized,

    loadedModules:[

      ...securityIndexState
      .loadedModules

    ],

    failedModules:[

      ...securityIndexState
      .failedModules

    ],

    checkedAt:
    securityIndexState
    .lastHealthcheckAt

  });

}



// =====================================
// GET SECURITY MODULE
// =====================================

function getSecurityModule(
  moduleName
){

  const normalized =
  String(
    moduleName || ""
  )
  .trim();

  if(!normalized){

    return null;

  }

  return (

    SECURITY_MODULES[
      normalized
    ]

    ||

    null

  );

}



// =====================================
// SECURITY DIAGNOSTICS
// =====================================

function getSecurityIndexDiagnostics(){

  return Object.freeze({

    initialized:
    securityIndexState
    .initialized,

    initializing:
    securityIndexState
    .initializing,

    initializedAt:
    securityIndexState
    .initializedAt,

    lastHealthcheckAt:
    securityIndexState
    .lastHealthcheckAt,

    startupInProgress:
    Boolean(
      securityIndexState
      .startupPromise
    ),

    loadedModules:[

      ...securityIndexState
      .loadedModules

    ],

    failedModules:[

      ...securityIndexState
      .failedModules

    ]

  });

}



// =====================================
// GLOBAL SECURITY API
// =====================================

const Security =
Object.freeze({

  modules:
  SECURITY_MODULES,



  initialize:
  initializeSecurityIndex,



  healthcheck:
  runSecurityIndexHealthcheck,



  diagnostics:
  getSecurityIndexDiagnostics,



  getModule:
  getSecurityModule,



  core:
  SECURITY_MODULES
  .Core,



  freeze:
  SECURITY_MODULES
  .Freeze,



  monitor:
  SECURITY_MODULES
  .Monitor,



  policy:
  SECURITY_MODULES
  .Policy,



  report:
  SECURITY_MODULES
  .Report,



  runtime:
  SECURITY_MODULES
  .Runtime,



  sandbox:
  SECURITY_MODULES
  .Sandbox,



  sanitize:
  SECURITY_MODULES
  .Sanitize,



  url:
  SECURITY_MODULES
  .URL,



  validator:
  SECURITY_MODULES
  .Validator

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

    "Security",

    {

      value:
      Security,

      writable:
      false,

      configurable:
      false

    }

  );

}
