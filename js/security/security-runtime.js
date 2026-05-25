// =====================================
// RIGO AI
// SECURITY RUNTIME
// ENTERPRISE SECURITY ORCHESTRATOR
// FINAL HARDENED EDITION
// =====================================



// =====================================
// SECURITY RUNTIME STATE
// =====================================

const securityRuntimeState =
Object.seal({

  initialized:
  false,

  starting:
  false,

  shuttingDown:
  false,

  crashed:
  false,

  initializedAt:
  null,

  shutdownAt:
  null,

  lastHealthcheckAt:
  null,

  lastError:
  null,

  activeModules:
  new Set(),

  failedModules:
  new Set(),

  runtimeLocks:
  new Set(),

  startupPromise:
  null

});



// =====================================
// SECURITY MODULES
// =====================================

const SECURITY_RUNTIME_MODULES =
Object.freeze([

  {

    name:
    "core",

    required:
    true,

    async initialize(){

      return (

        typeof SecurityCore !==
        "undefined"

        &&

        typeof SecurityCore
        .initialize ===
        "function"

        &&

        await SecurityCore
        .initialize()

      );

    }

  },



  {

    name:
    "policy",

    required:
    true,

    async initialize(){

      return (

        typeof SecurityPolicy !==
        "undefined"

        &&

        typeof SecurityPolicy
        .initialize ===
        "function"

        &&

        await SecurityPolicy
        .initialize()

      );

    }

  },



  {

    name:
    "monitor",

    required:
    true,

    initialize(){

      return (

        typeof SecurityMonitor !==
        "undefined"

      );

    }

  },



  {

    name:
    "validator",

    required:
    true,

    initialize(){

      return (

        typeof SecurityValidator !==
        "undefined"

      );

    }

  },



  {

    name:
    "sanitize",

    required:
    true,

    initialize(){

      return (

        typeof SecuritySanitize !==
        "undefined"

      );

    }

  },



  {

    name:
    "url",

    required:
    true,

    initialize(){

      return (

        typeof SecurityURL !==
        "undefined"

      );

    }

  },



  {

    name:
    "freeze",

    required:
    true,

    initialize(){

      return (

        typeof SecurityFreeze !==
        "undefined"

      );

    }

  },



  {

    name:
    "sandbox",

    required:
    true,

    initialize(){

      return (

        typeof SecuritySandbox !==
        "undefined"

      );

    }

  },



  {

    name:
    "report",

    required:
    false,

    initialize(){

      return (

        typeof SecurityReport !==
        "undefined"

      );

    }

  }

]);



// =====================================
// SAFE LOG
// =====================================

function logSecurityRuntimeEvent(
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

    }

  }

  catch(error){}

}



// =====================================
// REGISTER MODULE
// =====================================

function registerSecurityRuntimeModule(
  moduleName
){

  const normalizedName =
  String(
    moduleName || ""
  )
  .trim()
  .toLowerCase();

  if(!normalizedName){

    return false;

  }

  securityRuntimeState
  .activeModules
  .add(
    normalizedName
  );

  securityRuntimeState
  .failedModules
  .delete(
    normalizedName
  );

  return true;

}



// =====================================
// MARK MODULE FAILED
// =====================================

function markSecurityModuleFailed(
  moduleName
){

  const normalizedName =
  String(
    moduleName || ""
  )
  .trim()
  .toLowerCase();

  if(!normalizedName){

    return false;

  }

  securityRuntimeState
  .failedModules
  .add(
    normalizedName
  );

  securityRuntimeState
  .activeModules
  .delete(
    normalizedName
  );

  return true;

}



// =====================================
// VALIDATE MODULES
// =====================================

function validateSecurityRuntimeModules(){

  return SECURITY_RUNTIME_MODULES
  .every((module) => {

    return (

      module

      &&

      typeof module ===
      "object"

      &&

      typeof module.name ===
      "string"

      &&

      typeof module
      .initialize ===
      "function"

    );

  });

}



// =====================================
// INITIALIZE MODULES
// =====================================

async function initializeSecurityModules(){

  for(
    const module of
    SECURITY_RUNTIME_MODULES
  ){

    try{

      const initialized =
      await Promise.resolve(

        module
        .initialize()

      );

      if(!initialized){

        markSecurityModuleFailed(
          module.name
        );

        logSecurityRuntimeEvent(

          "SECURITY MODULE FAILED",

          {

            module:
            module.name

          }

        );

        if(
          module.required
        ){

          return false;

        }

        continue;

      }

      registerSecurityRuntimeModule(
        module.name
      );

      logSecurityRuntimeEvent(

        "SECURITY MODULE READY",

        {

          module:
          module.name

        }

      );

    }

    catch(error){

      markSecurityModuleFailed(
        module.name
      );

      securityRuntimeState
      .lastError =
      error;

      logSecurityRuntimeEvent(

        "SECURITY MODULE CRASHED",

        {

          module:
          module.name,

          error:
          String(error)

        }

      );

      if(
        module.required
      ){

        return false;

      }

    }

  }

  return true;

}



// =====================================
// HEALTHCHECK
// =====================================

function runSecurityHealthcheck(){

  securityRuntimeState
  .lastHealthcheckAt =
  Date.now();

  if(
    !securityRuntimeState
    .initialized
  ){

    return false;

  }

  const requiredModules =

    SECURITY_RUNTIME_MODULES
    .filter((module) => {

      return (
        module.required ===
        true
      );

    });

  const healthy =
  requiredModules.every((module) => {

    return securityRuntimeState
    .activeModules
    .has(
      module.name
    );

  });

  if(!healthy){

    securityRuntimeState
    .crashed =
    true;

  }

  return healthy;

}



// =====================================
// INITIALIZE RUNTIME
// =====================================

async function initializeSecurityRuntime(){

  if(
    securityRuntimeState
    .initialized
  ){

    return true;

  }

  if(
    securityRuntimeState
    .startupPromise
  ){

    return securityRuntimeState
    .startupPromise;

  }

  securityRuntimeState
  .startupPromise =

  (async() => {

    if(
      securityRuntimeState
      .starting
    ){

      return false;

    }

    securityRuntimeState
    .starting =
    true;

    try{

      const valid =
      validateSecurityRuntimeModules();

      if(!valid){

        throw new Error(
          "INVALID_SECURITY_MODULES"
        );

      }

      const initialized =
      await initializeSecurityModules();

      if(!initialized){

        throw new Error(
          "SECURITY_MODULE_INIT_FAILED"
        );

      }

      securityRuntimeState
      .initialized =
      true;

      securityRuntimeState
      .crashed =
      false;

      securityRuntimeState
      .initializedAt =
      Date.now();

      const healthy =
      runSecurityHealthcheck();

      if(!healthy){

        throw new Error(
          "SECURITY_HEALTHCHECK_FAILED"
        );

      }

      logSecurityRuntimeEvent(
        "SECURITY RUNTIME READY"
      );

      return true;

    }

    catch(error){

      securityRuntimeState
      .crashed =
      true;

      securityRuntimeState
      .initialized =
      false;

      securityRuntimeState
      .lastError =
      error;

      logSecurityRuntimeEvent(

        "SECURITY RUNTIME FAILED",

        {

          error:
          String(error)

        }

      );

      return false;

    }

    finally{

      securityRuntimeState
      .starting =
      false;

      securityRuntimeState
      .startupPromise =
      null;

    }

  })();

  return securityRuntimeState
  .startupPromise;

}



// =====================================
// SHUTDOWN RUNTIME
// =====================================

async function shutdownSecurityRuntime(){

  if(
    securityRuntimeState
    .shuttingDown
  ){

    return false;

  }

  securityRuntimeState
  .shuttingDown =
  true;

  try{

    securityRuntimeState
    .activeModules
    .clear();

    securityRuntimeState
    .failedModules
    .clear();

    securityRuntimeState
    .runtimeLocks
    .clear();

    securityRuntimeState
    .shutdownAt =
    Date.now();

    securityRuntimeState
    .initialized =
    false;

    securityRuntimeState
    .starting =
    false;

    securityRuntimeState
    .startupPromise =
    null;

    logSecurityRuntimeEvent(
      "SECURITY RUNTIME SHUTDOWN"
    );

    return true;

  }

  catch(error){

    securityRuntimeState
    .lastError =
    error;

    logSecurityRuntimeEvent(

      "SECURITY RUNTIME SHUTDOWN FAILED",

      {

        error:
        String(error)

      }

    );

    return false;

  }

  finally{

    securityRuntimeState
    .shuttingDown =
    false;

  }

}



// =====================================
// RESET RUNTIME
// =====================================

async function resetSecurityRuntime(){

  await shutdownSecurityRuntime();

  securityRuntimeState
  .failedModules
  .clear();

  securityRuntimeState
  .crashed =
  false;

  securityRuntimeState
  .lastError =
  null;

  return initializeSecurityRuntime();

}



// =====================================
// DIAGNOSTICS
// =====================================

function getSecurityRuntimeDiagnostics(){

  return Object.freeze({

    initialized:
    securityRuntimeState
    .initialized,

    starting:
    securityRuntimeState
    .starting,

    shuttingDown:
    securityRuntimeState
    .shuttingDown,

    crashed:
    securityRuntimeState
    .crashed,

    initializedAt:
    securityRuntimeState
    .initializedAt,

    shutdownAt:
    securityRuntimeState
    .shutdownAt,

    lastHealthcheckAt:
    securityRuntimeState
    .lastHealthcheckAt,

    activeModules:[

      ...securityRuntimeState
      .activeModules

    ],

    failedModules:[

      ...securityRuntimeState
      .failedModules

    ],

    runtimeLocks:[

      ...securityRuntimeState
      .runtimeLocks

    ],

    startupInProgress:
    Boolean(
      securityRuntimeState
      .startupPromise
    ),

    lastError:

      securityRuntimeState
      .lastError

      ?

      String(
        securityRuntimeState
        .lastError
      )

      :

      null

  });

}



// =====================================
// PUBLIC API
// =====================================

const SecurityRuntime =
Object.freeze({

  initialize:
  initializeSecurityRuntime,

  shutdown:
  shutdownSecurityRuntime,

  reset:
  resetSecurityRuntime,

  diagnostics:
  getSecurityRuntimeDiagnostics,

  healthcheck:
  runSecurityHealthcheck

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

    "SecurityRuntime",

    {

      value:
      SecurityRuntime,

      writable:
      false,

      configurable:
      false

    }

  );

}
