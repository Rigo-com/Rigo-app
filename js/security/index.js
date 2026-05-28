// =====================================
// RIGO AI
// SECURITY INDEX
// ENTERPRISE SECURITY ENTRYPOINT
// FINAL HARDENED EDITION
// =====================================



// =====================================
// IMPORTS
// =====================================

import "./security-core.js";
import "./security-freeze.js";
import "./security-monitor.js";
import "./security-policy.js";
import "./security-report.js";
import "./security-runtime.js";
import "./security-sandbox.js";
import "./security-sanitize.js";
import "./security-url.js";
import "./security-validator.js";



// =====================================
// REQUIRED MODULES
// =====================================

const REQUIRED_SECURITY_MODULES =
Object.freeze([

  "core",

  "freeze",

  "monitor",

  "policy",

  "report",

  "runtime",

  "sandbox",

  "sanitize",

  "url",

  "validator"

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

    core:
    resolveSecurityModule(
      globalThis
      .RIGOSecurityCore
    ),



    freeze:
    resolveSecurityModule(
      globalThis
      .RIGOSecurityFreeze
    ),



    monitor:
    resolveSecurityModule(
      globalThis
      .RIGOSecurityMonitor
    ),



    policy:
    resolveSecurityModule(
      globalThis
      .RIGOSecurityPolicy
    ),



    report:
    resolveSecurityModule(
      globalThis
      .RIGOSecurityReport
    ),



    runtime:
    resolveSecurityModule(
      globalThis
      .RIGOSecurityRuntime
    ),



    sandbox:
    resolveSecurityModule(
      globalThis
      .RIGOSecuritySandbox
    ),



    sanitize:
    resolveSecurityModule(
      globalThis
      .RIGOSecuritySanitize
    ),



    url:
    resolveSecurityModule(
      globalThis
      .RIGOSecurityURL
    ),



    validator:
    resolveSecurityModule(
      globalThis
      .RIGOSecurityValidator
    )

  });

}



// =====================================
// SECURITY INDEX STATE
// =====================================

const securityIndexState =
Object.seal({

  initialized:false,

  initializing:false,

  initializedAt:null,

  failedModules:
  new Set(),

  loadedModules:
  new Set(),

  lastHealthcheckAt:null,

  startupPromise:null

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
        .runtime

        &&

        typeof modules
        .runtime
        .initialize ===
        "function"

      ){

        const initialized =
        await modules
        .runtime
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
    .runtime

    &&

    typeof modules
    .runtime
    .healthcheck ===
    "function"

    ?

    modules
    .runtime
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
  .trim()
  .toLowerCase();

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

const RIGOSecurityRuntime =
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
    .core;

  },



  get freeze(){

    return getSecurityModules()
    .freeze;

  },



  get monitor(){

    return getSecurityModules()
    .monitor;

  },



  get policy(){

    return getSecurityModules()
    .policy;

  },



  get report(){

    return getSecurityModules()
    .report;

  },



  get runtime(){

    return getSecurityModules()
    .runtime;

  },



  get sandbox(){

    return getSecurityModules()
    .sandbox;

  },



  get sanitize(){

    return getSecurityModules()
    .sanitize;

  },



  get url(){

    return getSecurityModules()
    .url;

  },



  get validator(){

    return getSecurityModules()
    .validator;

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

  RIGOSecurityRuntime

};

export default
RIGOSecurityRuntime;



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOSecurityRuntime",

    {

      value:
      RIGOSecurityRuntime,

      writable:false,

      configurable:false

    }

  );

}
