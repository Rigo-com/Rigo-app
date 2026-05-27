// =====================================
// RIGO AI
// BOOTSTRAP INDEX
// CENTRAL EXPORTS
// FINAL HARDENED EDITION
// =====================================



// =====================================
// IMPORTS
// =====================================

import "./bootstrap-manager.js";



// =====================================
// VALIDATION
// =====================================

function validateBootstrapLayer(){

  return (

    typeof BootstrapManager !==
    "undefined"

    &&

    typeof BootstrapManager
    .boot ===
    "function"

    &&

    typeof BootstrapManager
    .recover ===
    "function"

    &&

    typeof BootstrapManager
    .shutdown ===
    "function"

    &&

    typeof BootstrapManager
    .diagnostics ===
    "function"

  );

}



// =====================================
// SAFE ACCESS
// =====================================

function getBootstrapManager(){

  if(
    !validateBootstrapLayer()
  ){

    return null;

  }

  return BootstrapManager;

}



// =====================================
// INITIALIZE
// =====================================

async function initializeBootstrap(){

  const manager =
  getBootstrapManager();

  if(!manager){

    return false;

  }

  try{

    return await manager
    .boot();

  }

  catch(error){

    return false;

  }

}



// =====================================
// RECOVER
// =====================================

async function recoverBootstrap(){

  const manager =
  getBootstrapManager();

  if(!manager){

    return false;

  }

  try{

    return await manager
    .recover();

  }

  catch(error){

    return false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownBootstrap(){

  const manager =
  getBootstrapManager();

  if(!manager){

    return false;

  }

  try{

    return await manager
    .shutdown();

  }

  catch(error){

    return false;

  }

}



// =====================================
// DIAGNOSTICS
// =====================================

function getBootstrapDiagnostics(){

  const manager =
  getBootstrapManager();

  if(!manager){

    return null;

  }

  try{

    return manager
    .diagnostics();

  }

  catch(error){

    return null;

  }

}



// =====================================
// PUBLIC API
// =====================================

const RIGOBootstrapRuntime =
Object.freeze({

  manager:
  BootstrapManager,

  initialize:
  initializeBootstrap,

  recover:
  recoverBootstrap,

  shutdown:
  shutdownBootstrap,

  diagnostics:
  getBootstrapDiagnostics,

  validate:
  validateBootstrapLayer

});



// =====================================
// EXPORTS
// =====================================

export {

  validateBootstrapLayer,

  getBootstrapManager,

  initializeBootstrap,

  recoverBootstrap,

  shutdownBootstrap,

  getBootstrapDiagnostics,

  RIGOBootstrapRuntime

};

export default
RIGOBootstrapRuntime;



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOBootstrapRuntime",

    {

      value:
      RIGOBootstrapRuntime,

      writable:false,

      configurable:false

    }

  );

}
