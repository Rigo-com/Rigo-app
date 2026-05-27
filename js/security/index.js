// =====================================
// RIGO AI
// SECURITY INDEX
// ENTERPRISE SECURITY ENTRYPOINT
// FINAL HARDENED EDITION
// =====================================



// =====================================
// REQUIRED MODULES
// =====================================

const REQUIRED_SECURITY_MODULES =
Object.freeze([

  "Core",

  "Freeze",

  "Monitor",

  "Policy",

  "Runtime",

  "Sandbox",

  "Sanitize",

  "URL",

  "Validator"

]);



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

function getSecurityModules(){

  return Object.freeze({

    Core:
    resolveSecurityModule(
      globalThis
      .SecurityCore
    ),



    Freeze:
    resolveSecurityModule(
      globalThis
      .SecurityFreeze
    ),



    Monitor:
    resolveSecurityModule(
      globalThis
      .SecurityMonitor
    ),



    Policy:
    resolveSecurityModule(
      globalThis
      .SecurityPolicy
    ),



    Report:
    resolveSecurityModule(
      globalThis
      .SecurityReport
    ),



    Runtime:
    resolveSecurityModule(
      globalThis
      .SecurityRuntime
    ),



    Sandbox:
    resolveSecurityModule(
      globalThis
      .SecuritySandbox
    ),



    Sanitize:
    resolveSecurityModule(
      globalThis
      .SecuritySanitize
    ),



    URL:
    resolveSecurityModule(
      globalThis
      .SecurityURL
    ),



    Validator:
    resolveSecurityModule(
      globalThis
      .SecurityValidator
    )

  });

}



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

    if(
      typeof console !==
      "undefined"

      &&

      typeof console.info ===
      "function"
    ){

      console.info(

        "[RIGO SECURITY]",

        message,

        metadata || ""

      );

    }

  }

  catch(error){

    try{

      if(
        typeof console !==
        "undefined"

        &&

        typeof console.error ===
        "function"
      ){

        console.error(error);

      }

    }

    catch(innerError){}

  }

}



// =====================================
// VALIDATE SECURITY MODULES
// =====================================

function validateSecurityModules(){

  const modules =
  getSecurityModules();

  securityIndexState
  .failedModules
  .clear();

  securityIndexState
  .loadedModules
  .clear();

  let valid =
  true;

  Object.entries(
    modules
  )
  .forEach(([name,module]) => {

    if(module){

      securityIndexState
      .loadedModules
      .add(name);

      return;

    }

    if(

      REQUIRED_SECURITY_MODULES
      .includes(name)

    ){

      securityIndexState
      .failedModules
      .add(name);

      valid = false;

    }

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

      const modules =
      getSecurityModules();

      if(

        modules
        .Runtime

        &&

        typeof modules
        .Runtime
        .initialize ===
        "function"

      ){

        const initialized =
        await modules
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
        "SECURITY_INDEX_READY"
      );

      return true;

    }

    catch(error){

      logSecurityIndexEvent(

        "SECURITY_INDEX_FAILED",

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

  const modules =
  getSecurityModules();

  const runtimeHealthy =

    modules
    .Runtime

    &&

    typeof modules
    .Runtime
    .healthcheck ===
    "function"

    ?

    modules
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

  const modules =
  getSecurityModules();

  return (

    modules[
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

  get modules(){

    return getSecurityModules();

  },



  initialize:
  initializeSecurityIndex,



  healthcheck:
  runSecurityIndexHealthcheck,



  diagnostics:
  getSecurityIndexDiagnostics,



  getModule:
  getSecurityModule,



  get core(){

    return getSecurityModules()
    .Core;

  },



  get freeze(){

    return getSecurityModules()
    .Freeze;

  },



  get monitor(){

    return getSecurityModules()
    .Monitor;

  },



  get policy(){

    return getSecurityModules()
    .Policy;

  },



  get report(){

    return getSecurityModules()
    .Report;

  },



  get runtime(){

    return getSecurityModules()
    .Runtime;

  },



  get sandbox(){

    return getSecurityModules()
    .Sandbox;

  },



  get sanitize(){

    return getSecurityModules()
    .Sanitize;

  },



  get url(){

    return getSecurityModules()
    .URL;

  },



  get validator(){

    return getSecurityModules()
    .Validator;

  }

});



// =====================================
// EXPORTS
// =====================================

export {

  REQUIRED_SECURITY_MODULES,

  securityIndexState,

  resolveSecurityModule,

  getSecurityModules,

  logSecurityIndexEvent,

  validateSecurityModules,

  initializeSecurityIndex,

  runSecurityIndexHealthcheck,

  getSecurityModule,

  getSecurityIndexDiagnostics,

  Security

};



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

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
