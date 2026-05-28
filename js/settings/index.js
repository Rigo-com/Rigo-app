// =====================================
// RIGO AI
// SETTINGS INDEX
// ENTERPRISE SETTINGS RUNTIME
// FINAL HARDENED EDITION
// =====================================



// =====================================
// IMPORTS
// =====================================

import "./settings-types.js";
import "./settings-defaults.js";
import "./settings-utils.js";
import "./settings-validation.js";
import "./settings-security.js";
import "./settings-state.js";
import "./settings-events.js";
import "./settings-storage.js";
import "./settings-sync.js";
import "./settings-migrations.js";
import "./settings-debug.js";
import "./settings-manager.js";



// =====================================
// SETTINGS CONFIG
// =====================================

const SETTINGS_RUNTIME_CONFIG =
Object.freeze({

  ENABLE_LOGGING:
  true,

  ENABLE_EVENTS:
  true,

  INIT_TIMEOUT:
  10000

});



// =====================================
// SETTINGS STATE
// =====================================

const settingsRuntimeState =
Object.seal({

  initialized:
  false,

  initializing:
  false,

  crashed:
  false,

  initializedAt:
  null,

  startupPromise:
  null,

  loadedModules:
  new Set(),

  failedModules:
  new Set(),

  lastError:
  null

});



// =====================================
// HELPERS
// =====================================

function isFunction(
  value
){

  return (
    typeof value ===
    "function"
  );

}



function normalizeSettingsError(
  error
){

  if(
    typeof getSafeErrorMessage ===
    "function"
  ){

    return getSafeErrorMessage(
      error
    );

  }

  return String(
    error || "UNKNOWN_ERROR"
  );

}



// =====================================
// SETTINGS MODULES
// =====================================

const SETTINGS_MODULES =
Object.freeze([

  {

    name:
    "types",

    required:
    true,

    validate(){

      return (
        typeof SETTINGS_TYPES !==
        "undefined"
      );

    }

  },



  {

    name:
    "defaults",

    required:
    true,

    validate(){

      return (
        typeof SETTINGS_DEFAULTS !==
        "undefined"
      );

    }

  },



  {

    name:
    "utils",

    required:
    true,

    validate(){

      return (
        typeof normalizeSettingKey ===
        "function"
      );

    }

  },



  {

    name:
    "validation",

    required:
    true,

    validate(){

      return (
        typeof validateSettingValue ===
        "function"
      );

    }

  },



  {

    name:
    "security",

    required:
    true,

    validate(){

      return (
        typeof sanitizeSettingValue ===
        "function"
      );

    }

  },



  {

    name:
    "state",

    required:
    true,

    validate(){

      return (
        typeof settingsState !==
        "undefined"
      );

    }

  },



  {

    name:
    "events",

    required:
    false,

    validate(){

      return (

        typeof emitSettingsEvent ===
        "function"

        ||

        typeof SETTINGS_EVENTS !==
        "undefined"

      );

    }

  },



  {

    name:
    "storage",

    required:
    true,

    validate(){

      return (

        typeof loadSettingsStorage ===
        "function"

        ||

        typeof saveSettingsStorage ===
        "function"

      );

    }

  },



  {

    name:
    "sync",

    required:
    false,

    validate(){

      return (
        typeof syncSettingsSystem ===
        "function"
      );

    }

  },



  {

    name:
    "migrations",

    required:
    false,

    validate(){

      return (
        typeof migrateSettingsSystem ===
        "function"
      );

    }

  },



  {

    name:
    "debug",

    required:
    false,

    validate(){

      return (
        typeof getSettingsDebugInfo ===
        "function"
      );

    }

  },



  {

    name:
    "manager",

    required:
    true,

    validate(){

      return (

        typeof initializeSettingsSystem ===
        "function"

        &&

        typeof getSetting ===
        "function"

        &&

        typeof updateSetting ===
        "function"

      );

    }

  }

]);



// =====================================
// LOG HELPERS
// =====================================

function logSettingsInfo(
  message,
  metadata = null
){

  if(

    SETTINGS_RUNTIME_CONFIG
    .ENABLE_LOGGING !==
    true

  ){

    return false;

  }

  try{

    if(
      typeof logInfo ===
      "function"
    ){

      logInfo(

        "[RIGOSettingsRuntime]",

        {

          message,

          ...(metadata || {})

        }

      );

      return true;

    }

    console.info(

      "[RIGOSettingsRuntime]",

      message,

      metadata || ""

    );

  }

  catch(error){

    console.error(error);

  }

  return true;

}



function logSettingsError(
  message,
  metadata = null
){

  try{

    if(
      typeof logError ===
      "function"
    ){

      logError(

        "[RIGOSettingsRuntime]",

        {

          message,

          ...(metadata || {})

        }

      );

      return true;

    }

    console.error(

      "[RIGOSettingsRuntime]",

      message,

      metadata || ""

    );

  }

  catch(error){

    console.error(error);

  }

  return true;

}



// =====================================
// EVENTS
// =====================================

async function emitSettingsRuntimeEvent(
  eventName,
  payload = {}
){

  if(

    SETTINGS_RUNTIME_CONFIG
    .ENABLE_EVENTS !==
    true

  ){

    return false;

  }

  try{

    if(
      typeof emitSystemEvent ===
      "function"
    ){

      await emitSystemEvent(

        eventName,

        {

          source:
          "settings-runtime",

          timestamp:
          Date.now(),

          ...payload

        }

      );

    }

  }

  catch(error){

    logSettingsError(

      "SETTINGS_EVENT_FAILED",

      {

        event:
        eventName,

        error:
        normalizeSettingsError(
          error
        )

      }

    );

  }

  return true;

}



// =====================================
// MODULE REGISTRATION
// =====================================

function registerLoadedSettingsModule(
  moduleName
){

  settingsRuntimeState
  .loadedModules
  .add(
    String(moduleName)
  );

  settingsRuntimeState
  .failedModules
  .delete(
    String(moduleName)
  );

  return true;

}



function registerFailedSettingsModule(
  moduleName
){

  settingsRuntimeState
  .failedModules
  .add(
    String(moduleName)
  );

  return true;

}



// =====================================
// VALIDATION
// =====================================

function validateSettingsModules(){

  return SETTINGS_MODULES
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

      isFunction(
        module.validate
      )

    );

  });

}



// =====================================
// INITIALIZATION
// =====================================

async function initializeSettingsRuntime(){

  if(
    settingsRuntimeState
    .initialized
  ){

    return true;

  }

  if(
    settingsRuntimeState
    .startupPromise
  ){

    return settingsRuntimeState
    .startupPromise;

  }

  settingsRuntimeState
  .startupPromise =

  (async() => {

    settingsRuntimeState
    .initializing =
    true;

    try{

      const valid =
      validateSettingsModules();

      if(!valid){

        throw new Error(
          "INVALID_SETTINGS_RUNTIME"
        );

      }

      for(
        const module of
        SETTINGS_MODULES
      ){

        try{

          const validated =
          module.validate();

          if(!validated){

            registerFailedSettingsModule(
              module.name
            );

            logSettingsError(

              "SETTINGS_MODULE_FAILED",

              {

                module:
                module.name

              }

            );

            if(
              module.required
            ){

              throw new Error(

                "REQUIRED_SETTINGS_MODULE_FAILED"

              );

            }

            continue;

          }

          registerLoadedSettingsModule(
            module.name
          );

          logSettingsInfo(

            "SETTINGS_MODULE_READY",

            {

              module:
              module.name

            }

          );

        }

        catch(error){

          registerFailedSettingsModule(
            module.name
          );

          logSettingsError(

            "SETTINGS_MODULE_CRASHED",

            {

              module:
              module.name,

              error:
              normalizeSettingsError(
                error
              )

            }

          );

          if(
            module.required
          ){

            throw error;

          }

        }

      }

      if(

        typeof initializeSettingsSystem ===
        "function"

      ){

        await Promise.race([

          Promise.resolve()
          .then(() => {

            return initializeSettingsSystem();

          }),

          new Promise((_,reject) => {

            setTimeout(() => {

              reject(

                new Error(
                  "SETTINGS_INIT_TIMEOUT"
                )

              );

            },

            SETTINGS_RUNTIME_CONFIG
            .INIT_TIMEOUT);

          })

        ]);

      }

      settingsRuntimeState
      .initialized =
      true;

      settingsRuntimeState
      .initializedAt =
      Date.now();

      await emitSettingsRuntimeEvent(
        "settings.ready"
      );

      logSettingsInfo(
        "SETTINGS_RUNTIME_READY"
      );

      return true;

    }

    catch(error){

      settingsRuntimeState
      .crashed =
      true;

      settingsRuntimeState
      .lastError =
      normalizeSettingsError(
        error
      );

      await emitSettingsRuntimeEvent(

        "settings.failed",

        {

          error:
          normalizeSettingsError(
            error
          )

        }

      );

      logSettingsError(

        "SETTINGS_RUNTIME_FAILED",

        {

          error:
          normalizeSettingsError(
            error
          )

        }

      );

      return false;

    }

    finally{

      settingsRuntimeState
      .initializing =
      false;

    }

  })();

  const currentPromise =
  settingsRuntimeState
  .startupPromise;

  try{

    return await currentPromise;

  }

  finally{

    if(

      settingsRuntimeState
      .startupPromise ===
      currentPromise

    ){

      settingsRuntimeState
      .startupPromise =
      null;

    }

  }

}



// =====================================
// RESET
// =====================================

async function resetSettingsRuntime(){

  settingsRuntimeState
  .loadedModules
  .clear();

  settingsRuntimeState
  .failedModules
  .clear();

  settingsRuntimeState
  .initialized =
  false;

  settingsRuntimeState
  .crashed =
  false;

  settingsRuntimeState
  .lastError =
  null;

  if(

    typeof resetSettingsSystem ===
    "function"

  ){

    try{

      await resetSettingsSystem();

    }

    catch(error){

      logSettingsError(

        "SETTINGS_RESET_FAILED",

        {

          error:
          normalizeSettingsError(
            error
          )

        }

      );

    }

  }

  return initializeSettingsRuntime();

}



// =====================================
// HEALTHCHECK
// =====================================

function runSettingsHealthcheck(){

  if(
    !settingsRuntimeState
    .initialized
  ){

    return false;

  }

  if(
    settingsRuntimeState
    .crashed
  ){

    return false;

  }

  const requiredModules =
  SETTINGS_MODULES
  .filter((module) => {

    return module.required;

  });

  return requiredModules
  .every((module) => {

    return settingsRuntimeState
    .loadedModules
    .has(
      module.name
    );

  });

}



// =====================================
// DIAGNOSTICS
// =====================================

function getSettingsRuntimeDiagnostics(){

  return Object.freeze({

    initialized:
    settingsRuntimeState
    .initialized,

    initializing:
    settingsRuntimeState
    .initializing,

    crashed:
    settingsRuntimeState
    .crashed,

    initializedAt:
    settingsRuntimeState
    .initializedAt,

    loadedModules:[

      ...settingsRuntimeState
      .loadedModules

    ],

    failedModules:[

      ...settingsRuntimeState
      .failedModules

    ],

    modulesCount:

      settingsRuntimeState
      .loadedModules
      .size,

    failedCount:

      settingsRuntimeState
      .failedModules
      .size,

    healthcheck:
    runSettingsHealthcheck(),

    lastError:

      settingsRuntimeState
      .lastError

  });

}



// =====================================
// PUBLIC API
// =====================================

const RIGOSettingsRuntime =
Object.freeze({

  initialize:
  initializeSettingsRuntime,



  get:

    typeof getSetting ===
    "function"

    ?

    getSetting

    :

    null,



  update:

    typeof updateSetting ===
    "function"

    ?

    updateSetting

    :

    null,



  reset:
  resetSettingsRuntime,



  sync:

    typeof syncSettingsSystem ===
    "function"

    ?

    syncSettingsSystem

    :

    null,



  backup:

    typeof createSettingsBackup ===
    "function"

    ?

    createSettingsBackup

    :

    null,



  restore:

    typeof restoreSettingsBackup ===
    "function"

    ?

    restoreSettingsBackup

    :

    null,



  diagnostics:
  getSettingsRuntimeDiagnostics,



  snapshot:
  getSettingsRuntimeDiagnostics,



  healthcheck:
  runSettingsHealthcheck

});



// =====================================
// EXPORTS
// =====================================

export {

  SETTINGS_RUNTIME_CONFIG,

  settingsRuntimeState,

  SETTINGS_MODULES,

  validateSettingsModules,

  initializeSettingsRuntime,

  resetSettingsRuntime,

  runSettingsHealthcheck,

  getSettingsRuntimeDiagnostics,

  RIGOSettingsRuntime

};

export default
RIGOSettingsRuntime;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOSettingsRuntime",

    {

      value:
      RIGOSettingsRuntime,

      writable:
      false,

      configurable:
      false,

      enumerable:
      false

    }

  );

}
