// =====================================
// RIGO AI
// AUTH INDEX
// =====================================



// =====================================
// VALIDATION
// =====================================

function validateAuthSystems(){

  return (

    typeof AuthRuntime !==
    "undefined"

  );

}



// =====================================
// INITIALIZE
// =====================================

async function initializeAuth(){

  if(
    !validateAuthSystems()
  ){

    return false;

  }

  try{

    if(
      typeof AuthRuntime
      ?.initialize ===
      "function"
    ){

      await AuthRuntime
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

async function resetAuth(){

  try{

    if(
      typeof AuthRuntime
      ?.reset ===
      "function"
    ){

      await AuthRuntime
      .reset();

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

function getAuthHealth(){

  return Object.freeze({

    valid:
    validateAuthSystems(),

    runtime:

      typeof AuthRuntime
      ?.status ===
      "function"

      ?

      AuthRuntime
      .status()

      :

      null,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC EXPORTS
// =====================================

const Auth =
Object.freeze({

  runtime:
  AuthRuntime,

  initialize:
  initializeAuth,

  reset:
  resetAuth,

  health:
  getAuthHealth

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.Auth =
  Auth;

}



if(
  typeof globalThis !==
  "undefined"
){

  globalThis.Auth =
  Auth;

}
