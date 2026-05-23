// =====================================
// RIGO AI
// SECURITY INDEX
// ENTERPRISE SECURITY ENTRYPOINT
// =====================================



// =====================================
// SECURITY MODULE REGISTRY
// =====================================

const SECURITY_MODULES =
Object.freeze({

  Core:
  typeof SecurityCore !==
  "undefined"

  ?

  SecurityCore

  :

  null,



  Freeze:
  typeof SecurityFreeze !==
  "undefined"

  ?

  SecurityFreeze

  :

  null,



  Monitor:
  typeof SecurityMonitor !==
  "undefined"

  ?

  SecurityMonitor

  :

  null,



  Policy:
  typeof SecurityPolicy !==
  "undefined"

  ?

  SecurityPolicy

  :

  null,



  Report:
  typeof SecurityReport !==
  "undefined"

  ?

  SecurityReport

  :

  null,



  Runtime:
  typeof SecurityRuntime !==
  "undefined"

  ?

  SecurityRuntime

  :

  null,



  Sandbox:
  typeof SecuritySandbox !==
  "undefined"

  ?

  SecuritySandbox

  :

  null,



  Sanitize:
  typeof SecuritySanitize !==
  "undefined"

  ?

  SecuritySanitize

  :

  null,



  URL:
  typeof SecurityURL !==
  "undefined"

  ?

  SecurityURL

  :

  null,



  Validator:
  typeof SecurityValidator !==
  "undefined"

  ?

  SecurityValidator

  :

  null

});



// =====================================
// SECURITY INDEX STATE
// =====================================

const securityIndexState =
Object.seal({

  initialized:false,

  initializedAt:null,

  failedModules:
  new Set(),

  loadedModules:
  new Set(),

  lastHealthcheckAt:null

});



// =====================================
// VALIDATE SECURITY MODULES
// =====================================

function validateSecurityModules(){

  let valid = true;

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

  const valid =
  validateSecurityModules();

  if(!valid){

    console.error(
      "[RIGO SECURITY] MODULE VALIDATION FAILED"
    );

    return false;

  }

  try{

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

    if(
      typeof logSecurityEvent ===
      "function"
    ){

      logSecurityEvent(
        "SECURITY INDEX READY"
      );

    }

    return true;

  }

  catch(error){

    console.error(
      "[RIGO SECURITY]",
      error
    );

    return false;

  }

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
    runtimeHealthy,

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

    initializedAt:
    securityIndexState
    .initializedAt,

    lastHealthcheckAt:
    securityIndexState
    .lastHealthcheckAt,

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
// AUTO INITIALIZATION
// =====================================

(async () => {

  try{

    await initializeSecurityIndex();

  }

  catch(error){

    console.error(
      "[RIGO SECURITY AUTO INIT FAILED]",
      error
    );

  }

})();
