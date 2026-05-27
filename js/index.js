// =====================================
// RIGO AI
// ROOT SYSTEM INDEX
// ENTERPRISE APPLICATION ORCHESTRATOR
// FINAL STABILIZED EDITION
// =====================================



// =====================================
// FOUNDATION IMPORTS
// =====================================

import "./shared/index.js";



// =====================================
// INFRASTRUCTURE IMPORTS
// =====================================

import "./security/index.js";
import "./storage/index.js";
import "./settings/index.js";



// =====================================
// SERVICE IMPORTS
// =====================================

import "./services/index.js";
import "./communication/index.js";
import "./bridges/index.js";



// =====================================
// MEMORY & SEARCH IMPORTS
// =====================================

import "./memory/index.js";
import "./search/index.js";



// =====================================
// APPLICATION IMPORTS
// =====================================

import "./chat/index.js";
import "./ui/index.js";
import "./voice/index.js";



// =====================================
// BOOTSTRAP IMPORTS
// =====================================

import "./bootstrap/index.js";



// =====================================
// ROOT STATE
// =====================================

const rootSystemState =
Object.seal({

  initialized:
  false,

  initializing:
  false,

  shuttingDown:
  false,

  crashed:
  false,

  initializedAt:
  null,

  shutdownAt:
  null,

  startupPromise:
  null,

  lastError:
  null

});



// =====================================
// LOG HELPERS
// =====================================

function logRootSystemInfo(
  message,
  metadata = null
){

  try{

    if(
      typeof logInfo ===
      "function"
    ){

      logInfo(

        "[RIGO ROOT]",

        {

          message,

          ...(metadata || {})

        }

      );

      return;

    }

    console.info(

      "[RIGO ROOT]",

      message,

      metadata || ""

    );

  }

  catch(error){

    console.error(error);

  }

}



function logRootSystemError(
  message,
  metadata = null
){

  try{

    if(
      typeof logError ===
      "function"
    ){

      logError(

        "[RIGO ROOT]",

        {

          message,

          ...(metadata || {})

        }

      );

      return;

    }

    console.error(

      "[RIGO ROOT]",

      message,

      metadata || ""

    );

  }

  catch(error){

    console.error(error);

  }

}



// =====================================
// INITIALIZE SYSTEM
// =====================================

async function initializeSystem(){

  if(
    rootSystemState
    .initialized
  ){

    return true;

  }

  if(
    rootSystemState
    .startupPromise
  ){

    return rootSystemState
    .startupPromise;

  }

  rootSystemState
  .startupPromise =

  (async() => {

    rootSystemState
    .initializing =
    true;

    try{

      // ===============================
      // SHARED
      // ===============================

      if(
        typeof SharedRuntime !==
        "undefined"
      ){

        await SharedRuntime
        .initialize();

      }



      // ===============================
      // SECURITY
      // ===============================

      if(
        typeof Security !==
        "undefined"

        &&

        typeof Security
        .initialize ===
        "function"

      ){

        await Security
        .initialize();

      }



      // ===============================
      // STORAGE
      // ===============================

      if(
        typeof StorageRuntime !==
        "undefined"

        &&

        typeof StorageRuntime
        .initialize ===
        "function"

      ){

        await StorageRuntime
        .initialize();

      }



      // ===============================
      // SETTINGS
      // ===============================

      if(
        typeof SettingsAPI !==
        "undefined"

        &&

        typeof SettingsAPI
        .initialize ===
        "function"

      ){

        await SettingsAPI
        .initialize();

      }



      // ===============================
      // SERVICES
      // ===============================

      if(
        typeof ServicesRuntime !==
        "undefined"
      ){

        await ServicesRuntime
        .initialize();

      }



      // ===============================
      // COMMUNICATION
      // ===============================

      if(
        typeof Communication !==
        "undefined"
      ){

        getCommunicationLayer?.();

      }



      // ===============================
      // BRIDGES
      // ===============================

      if(
  typeof AIRuntimeBridge !==
  "undefined"

  &&

  typeof AIRuntimeBridge
  .initialize ===
  "function"

){

  await AIRuntimeBridge
  .initialize();

}



      // ===============================
      // MEMORY
      // ===============================

      if(
        typeof MemoryAPI !==
        "undefined"

        &&

        typeof MemoryAPI
        .initialize ===
        "function"

      ){

        await MemoryAPI
        .initialize();

      }



      // ===============================
      // SEARCH
      // ===============================

      if(
        typeof SearchAPI !==
        "undefined"

        &&

        typeof SearchAPI
        .rebuildIndexes ===
        "function"

      ){

        await SearchAPI
        .rebuildIndexes();

      }



      // ===============================
      // CHAT
      // ===============================

      if(
        typeof Chat !==
        "undefined"

        &&

        typeof Chat
        .initialize ===
        "function"

      ){

        await Chat
        .initialize();

      }



      // ===============================
      // UI
      // ===============================

      if(
        typeof UI !==
        "undefined"

        &&

        typeof UI
        .initialize ===
        "function"

      ){

        await UI
        .initialize();

      }



      // ===============================
      // BOOTSTRAP
      // ===============================

      if(
        typeof Bootstrap !==
        "undefined"

        &&

        typeof Bootstrap
        .initialize ===
        "function"

      ){

        await Bootstrap
        .initialize();

      }

      rootSystemState
      .initialized =
      true;

      rootSystemState
      .crashed =
      false;

      rootSystemState
      .initializedAt =
      Date.now();

      logRootSystemInfo(
        "RIGO SYSTEM READY"
      );

      return true;

    }

    catch(error){

      rootSystemState
      .crashed =
      true;

      rootSystemState
      .lastError =
      error;

      logRootSystemError(

        "RIGO SYSTEM FAILED",

        {

          error:
          String(error)

        }

      );

      return false;

    }

    finally{

      rootSystemState
      .initializing =
      false;

      rootSystemState
      .startupPromise =
      null;

    }

  })();

  return rootSystemState
  .startupPromise;

}



// =====================================
// SHUTDOWN SYSTEM
// =====================================

async function shutdownSystem(){

  if(
    rootSystemState
    .shuttingDown
  ){

    return false;

  }

  rootSystemState
  .shuttingDown =
  true;

  try{

    if(
      typeof ServicesRuntime !==
      "undefined"
    ){

      await ServicesRuntime
      .shutdown();

    }

    rootSystemState
    .initialized =
    false;

    rootSystemState
    .shutdownAt =
    Date.now();

    logRootSystemInfo(
      "RIGO SYSTEM STOPPED"
    );

    return true;

  }

  catch(error){

    rootSystemState
    .lastError =
    error;

    logRootSystemError(

      "SYSTEM SHUTDOWN FAILED",

      {

        error:
        String(error)

      }

    );

    return false;

  }

  finally{

    rootSystemState
    .shuttingDown =
    false;

  }

}



// =====================================
// RESET SYSTEM
// =====================================

async function resetSystem(){

  await shutdownSystem();

  rootSystemState
  .crashed =
  false;

  rootSystemState
  .lastError =
  null;

  return initializeSystem();

}



// =====================================
// SYSTEM HEALTHCHECK
// =====================================

function runSystemHealthcheck(){

  return (

    rootSystemState
    .initialized ===
    true

    &&

    rootSystemState
    .crashed !==
    true

  );

}



// =====================================
// SYSTEM DIAGNOSTICS
// =====================================

function getSystemDiagnostics(){

  return Object.freeze({

    initialized:
    rootSystemState
    .initialized,

    initializing:
    rootSystemState
    .initializing,

    shuttingDown:
    rootSystemState
    .shuttingDown,

    crashed:
    rootSystemState
    .crashed,

    initializedAt:
    rootSystemState
    .initializedAt,

    shutdownAt:
    rootSystemState
    .shutdownAt,

    healthcheck:
    runSystemHealthcheck(),

    lastError:

      rootSystemState
      .lastError

      ?

      String(
        rootSystemState
        .lastError
      )

      :

      null

  });

}



// =====================================
// ROOT API
// =====================================

const RIGO =
Object.freeze({

  initialize:
  initializeSystem,

  shutdown:
  shutdownSystem,

  reset:
  resetSystem,

  diagnostics:
  getSystemDiagnostics,

  healthcheck:
  runSystemHealthcheck,



  // ===================================
  // SYSTEMS
  // ===================================

  shared:
  globalThis.SharedRuntime || null,

  security:
  globalThis.Security || null,

  storage:
  globalThis.StorageRuntime || null,

  settings:
  globalThis.SettingsAPI || null,

  services:
  globalThis.ServicesRuntime || null,

  communication:
  globalThis.Communication || null,

  memory:
  globalThis.MemoryAPI || null,

  search:
  globalThis.SearchAPI || null,

  chat:
  globalThis.Chat || null,

  ui:
  globalThis.UI || null,

  voice:
  globalThis.Voice || null,

  bootstrap:
  globalThis.Bootstrap || null

});



// =====================================
// EXPORTS
// =====================================

export {

  RIGO,

  initializeSystem,

  shutdownSystem,

  resetSystem,

  runSystemHealthcheck,

  getSystemDiagnostics

};



// =====================================
// DEFAULT EXPORT
// =====================================

export default RIGO;



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  globalThis.RIGO =
  RIGO;

}
