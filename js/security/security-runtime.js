// =====================================
// RIGO AI
// SECURITY RUNTIME
// ENTERPRISE SECURITY ORCHESTRATOR
// FINAL HARDENED EDITION
// =====================================



// =====================================
// RUNTIME CONFIG
// =====================================

const SECURITY_RUNTIME_CONFIG =
Object.freeze({

  STARTUP_TIMEOUT:
  15000,

  SHUTDOWN_TIMEOUT:
  10000,

  MAX_MODULES:
  100,

  ENABLE_HEALTHCHECK:
  true,

  ENABLE_STARTUP_LOGS:
  true

});



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

  startupPromise:
  null,

  runtimeVersion:
  "1.0.0",

  activeModules:
  new Set(),

  failedModules:
  new Set(),

  runtimeLocks:
  new Set(),

  moduleStates:
  new Map()

});



// =====================================
// SECURITY MODULES
// =====================================

const SECURITY_RUNTIME_MODULES =
Object.freeze([

  {

    name:
    "policy",

    required:
    true,

    resolver(){

      return globalThis
      .SecurityPolicy;

    }

  },



  {

    name:
    "monitor",

    required:
    true,

    resolver(){

      return globalThis
      .SecurityMonitor;

    }

  },



  {

    name:
    "validator",

    required:
    true,

    resolver(){

      return globalThis
      .SecurityValidator;

    }

  },



  {

    name:
    "sanitize",

    required:
    true,

    resolver(){

      return globalThis
      .SecuritySanitize;

    }

  },



  {

    name:
    "url",

    required:
    true,

    resolver(){

      return globalThis
      .SecurityURL;

    }

  },



  {

    name:
    "freeze",

    required:
    true,

    resolver(){

      return globalThis
      .SecurityFreeze;

    }

  },



  {

    name:
    "sandbox",

    required:
    true,

    resolver(){

      return globalThis
      .SecuritySandbox;

    }

  },



  {

    name:
    "report",

    required:
    false,

    resolver(){

      return globalThis
      .SecurityReport;

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
// MODULE RESOLVER
// =====================================

function resolveSecurityModule(
  module
){

  try{

    if(
      !module
      ?.resolver
    ){

      return null;

    }

    return module
    .resolver();

  }

  catch(error){

    return null;

  }

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

  securityRuntimeState
  .moduleStates
  .set(

    normalizedName,

    "ready"

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

  securityRuntimeState
  .moduleStates
  .set(

    normalizedName,

    "failed"

  );

  return true;

}



// =====================================
// VALIDATE MODULES
// =====================================

function validateSecurityRuntimeModules(){

  if(

    SECURITY_RUNTIME_MODULES
    .length >

    SECURITY_RUNTIME_CONFIG
    .MAX_MODULES

  ){

    return false;

  }

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
      .resolver ===
      "function"

    );

  });

}



// =====================================
// MODULE INITIALIZER
// =====================================

async function initializeSecurityModule(
  module
){

  const resolved =
  resolveSecurityModule(
    module
  );

  if(!resolved){

    markSecurityModuleFailed(
      module.name
    );

    return !module.required;
  }

  try{

    securityRuntimeState
    .moduleStates
    .set(

      module.name,

      "initializing"

    );

    if(

      typeof resolved
      .initialize ===
      "function"

    ){

      const initialized =
      await Promise.resolve(

        resolved
        .initialize()

      );

      if(!initialized){

        throw new Error(
          "MODULE_INIT_FAILED"
        );

      }

    }

    registerSecurityRuntimeModule(
      module.name
    );

    logSecurityRuntimeEvent(

      "SECURITY_MODULE_READY",

      {

        module:
        module.name

      }

    );

    return true;

  }

  catch(error){

    markSecurityModuleFailed(
      module.name
    );

    securityRuntimeState
    .lastError =
    error;

    logSecurityRuntimeEvent(

      "SECURITY_MODULE_CRASHED",

      {

        module:
        module.name,

        error:
        String(error)

      }

    );

    return !module.required;

  }

}



// =====================================
// INITIALIZE MODULES
// =====================================

async function initializeSecurityModules(){

  for(
    const module of
    SECURITY_RUNTIME_MODULES
  ){

    const initialized =
    await initializeSecurityModule(
      module
    );

    if(!initialized){

      return false;

    }

  }

  return true;

}



// =====================================
// TIMEOUT WRAPPER
// =====================================

async function executeRuntimeTimeout(
  callback,
  timeout
){

  let timeoutId =
  null;

  try{

    return await Promise.race([

      Promise.resolve()
      .then(callback),

      new Promise((_,reject) => {

        timeoutId =
        setTimeout(() => {

          reject(

            new Error(
              "SECURITY_RUNTIME_TIMEOUT"
            )

          );

        },

        timeout);

      })

    ]);

  }

  finally{

    if(timeoutId){

      clearTimeout(
        timeoutId
      );

    }

  }

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

  executeRuntimeTimeout(

    async() => {

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

        if(

          SECURITY_RUNTIME_CONFIG
          .ENABLE_HEALTHCHECK

        ){

          const healthy =
          runSecurityHealthcheck();

          if(!healthy){

            throw new Error(
              "SECURITY_HEALTHCHECK_FAILED"
            );

          }

        }

        logSecurityRuntimeEvent(
          "SECURITY_RUNTIME_READY"
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

          "SECURITY_RUNTIME_FAILED",

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

    },

    SECURITY_RUNTIME_CONFIG
    .STARTUP_TIMEOUT

  );

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

    await executeRuntimeTimeout(

      async() => {

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
        .moduleStates
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

        securityRuntimeState
        .lastError =
        null;

      },

      SECURITY_RUNTIME_CONFIG
      .SHUTDOWN_TIMEOUT

    );

    logSecurityRuntimeEvent(
      "SECURITY_RUNTIME_SHUTDOWN"
    );

    return true;

  }

  catch(error){

    securityRuntimeState
    .lastError =
    error;

    logSecurityRuntimeEvent(

      "SECURITY_RUNTIME_SHUTDOWN_FAILED",

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

  const diagnostics = {

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

    runtimeVersion:
    securityRuntimeState
    .runtimeVersion,

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

    moduleStates:

      Object.fromEntries(

        securityRuntimeState
        .moduleStates
      ),

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

  };

  if(

    typeof SecurityFreeze ===
    "object"

    &&

    typeof SecurityFreeze
    .deepFreeze ===
    "function"

  ){

    return SecurityFreeze
    .deepFreeze(
      diagnostics
    );

  }

  return Object.freeze(
    diagnostics
  );

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
// EXPORTS
// =====================================

export {

  SECURITY_RUNTIME_CONFIG,

  securityRuntimeState,

  SECURITY_RUNTIME_MODULES,

  logSecurityRuntimeEvent,

  resolveSecurityModule,

  registerSecurityRuntimeModule,

  markSecurityModuleFailed,

  validateSecurityRuntimeModules,

  initializeSecurityModule,

  initializeSecurityModules,

  executeRuntimeTimeout,

  runSecurityHealthcheck,

  initializeSecurityRuntime,

  shutdownSecurityRuntime,

  resetSecurityRuntime,

  getSecurityRuntimeDiagnostics,

  SecurityRuntime

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
