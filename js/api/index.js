// =====================================
// RIGO AI
// API INDEX
// =====================================



// =====================================
// VALIDATION
// =====================================

function validateAPISystems(){

  return (

    typeof APIRuntime !==
    "undefined"

  );

}



// =====================================
// INITIALIZE
// =====================================

async function initializeAPI(){

  if(
    !validateAPISystems()
  ){

    return false;

  }

  try{

    if(
      typeof APIRuntime
      ?.initialize ===
      "function"
    ){

      await APIRuntime
      .initialize();

    }

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// RESET
// =====================================

async function resetAPI(){

  try{

    if(
      typeof APIRuntime
      ?.reset ===
      "function"
    ){

      await APIRuntime
      .reset();

    }

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownAPI(){

  try{

    if(
      typeof APIRuntime
      ?.shutdown ===
      "function"
    ){

      await APIRuntime
      .shutdown();

    }

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// HEALTH
// =====================================

function getAPIHealth(){

  return Object.freeze({

    valid:
    validateAPISystems(),

    runtime:

      typeof APIRuntime
      ?.health ===
      "function"

      ?

      APIRuntime
      .health()

      :

      null,

    timestamp:
    Date.now()

  });

}



// =====================================
// SNAPSHOT
// =====================================

function createAPISnapshot(){

  return Object.freeze({

    valid:
    validateAPISystems(),

    snapshot:

      typeof APIRuntime
      ?.snapshot ===
      "function"

      ?

      APIRuntime
      .snapshot()

      :

      null,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC EXPORTS
// =====================================

const API =
Object.freeze({

  runtime:
  APIRuntime,

  initialize:
  initializeAPI,

  reset:
  resetAPI,

  shutdown:
  shutdownAPI,

  health:
  getAPIHealth,

  snapshot:
  createAPISnapshot

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.API =
  API;

}



if(
  typeof globalThis !==
  "undefined"
){

  globalThis.API =
  API;

}
