// =====================================
// RIGO AI
// SECURITY RUNTIME
// ENTERPRISE SECURITY ORCHESTRATOR
// =====================================



// =====================================
// SECURITY RUNTIME STATE
// =====================================

const securityRuntimeState =
Object.seal({

  initialized:false,

  starting:false,

  shuttingDown:false,

  crashed:false,

  initializedAt:null,

  shutdownAt:null,

  lastHealthcheckAt:null,

  lastError:null,

  activeModules:
  new Set(),

  failedModules:
  new Set(),

  runtimeLocks:
  new Set()

});



// =====================================
// SECURITY MODULES
// =====================================

const SECURITY_RUNTIME_MODULES =
Object.freeze([

  {

    name:"core",

    required:true,

    initialize(){

      return (

        typeof SecurityCore !==
        "undefined"

        &&

        SecurityCore
        .initialize()

      );

    }

  },



  {

    name:"policy",

    required:true,

    initialize(){

      return (

        typeof SecurityPolicy !==
        "undefined"

        &&

        SecurityPolicy
        .initialize()

      );

    }

  },



  {

    name:"monitor",

    required:true,

    initialize(){

      return typeof
      SecurityMonitor !==
      "undefined";

    }

  },



  {

    name:"validator",

    required:true,

    initialize(){

      return typeof
      SecurityValidator !==
      "undefined";

    }

  },



  {

    name:"sanitize",

    required:true,

    initialize(){

      return typeof
      SecuritySanitize !==
      "undefined";

    }

  },



  {

    name:"url",

    required:true,

    initialize(){

      return typeof
      SecurityURL !==
      "undefined";

    }

  },



  {

    name:"freeze",

    required:true,

    initialize(){

      return typeof
      SecurityFreeze !==
      "undefined";

    }

  }

]);



// =====================================
// REGISTER MODULE
// =====================================

function registerSecurityRuntimeModule(
  moduleName
){

  if(
    !moduleName
  ){

    return false;

  }

  securityRuntimeState
  .activeModules
  .add(
    String(moduleName)
  );

  securityRuntimeState
  .failedModules
  .delete(
    String(moduleName)
  );

  return true;

}



// =====================================
// MARK MODULE FAILED
// =====================================

function markSecurityModuleFailed(
  moduleName
){

  if(
    !moduleName
  ){

    return false;

  }

  securityRuntimeState
  .failedModules
  .add(
    String(moduleName)
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
// INITIALIZE SECURITY MODULES
// =====================================

async function initializeSecurityModules(){

  for(
    const module of
    SECURITY_RUNTIME_MODULES
  ){

    try{

      const initialized =
      await module
      .initialize();

      if(!initialized){

        markSecurityModuleFailed(
          module.name
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

    }

    catch(error){

      markSecurityModuleFailed(
        module.name
      );

      securityRuntimeState
      .lastError =
      error;

      if(
        typeof logSecurityEvent ===
        "function"
      ){

        logSecurityEvent(

          "SECURITY MODULE FAILED",

          {

            module:
            module.name,

            error:
            String(error)

          }

        );

      }

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
// SECURITY HEALTHCHECK
// =====================================

function runSecurityHealthcheck(){

  if(
    !securityRuntimeState
    .initialized
  ){

    return false;

  }

  securityRuntimeState
  .lastHealthcheckAt =
  Date.now();

  const healthy =

    securityRuntimeState
    .failedModules
    .size === 0;

  return healthy;

}



// =====================================
// INITIALIZE RUNTIME
// =====================================

async function initializeSecurityRuntime(){

  if(
    securityRuntimeState
    .initialized

    ||

    securityRuntimeState
    .starting
  ){

    return true;

  }

  securityRuntimeState
  .starting =
  true;

  try{

    const valid =
    validateSecurityRuntimeModules();

    if(!valid){

      throw new Error(
        "INVALID SECURITY MODULES"
      );

    }

    const initialized =
    await initializeSecurityModules();

    if(!initialized){

      throw new Error(
        "SECURITY MODULE INIT FAILED"
      );

    }

    securityRuntimeState
    .initialized =
    true;

    securityRuntimeState
    .initializedAt =
    Date.now();

    runSecurityHealthcheck();

    if(
      typeof logSecurityEvent ===
      "function"
    ){

      logSecurityEvent(
        "SECURITY RUNTIME READY"
      );

    }

    return true;

  }

  catch(error){

    securityRuntimeState
    .crashed =
    true;

    securityRuntimeState
    .lastError =
    error;

    if(
      typeof logSecurityEvent ===
      "function"
    ){

      logSecurityEvent(

        "SECURITY RUNTIME FAILED",

        {

          error:
          String(error)

        }

      );

    }

    return false;

  }

  finally{

    securityRuntimeState
    .starting =
    false;

  }

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

    if(
      typeof logSecurityEvent ===
      "function"
    ){

      logSecurityEvent(
        "SECURITY RUNTIME SHUTDOWN"
      );

    }

    return true;

  }

  catch(error){

    securityRuntimeState
    .lastError =
    error;

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
// RUNTIME DIAGNOSTICS
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
