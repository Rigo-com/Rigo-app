// =====================================
// RIGO AI
// STATE MIDDLEWARE
// =====================================



// =====================================
// IMPORTS
// =====================================

import STATE_MANAGER_CONFIG
from "./state-config.js";

import {
  createImmutableState
}
from "./state-utils.js";



// =====================================
// USE
// =====================================

function useStateMiddleware(
  stateManagerState,
  middleware
){

  if(
    typeof middleware !==
    "function"
  ){

    return false;

  }

  stateManagerState
  .middleware
  .add(
    middleware
  );

  return true;

}



// =====================================
// REMOVE
// =====================================

function removeStateMiddleware(
  stateManagerState,
  middleware
){

  return stateManagerState
  .middleware
  .delete(
    middleware
  );

}



// =====================================
// EXECUTE
// =====================================

async function executeStateMiddleware(
  stateManagerState,
  context
){

  if(

    !STATE_MANAGER_CONFIG
    .ENABLE_MIDDLEWARE

  ){

    return true;

  }

  const immutableContext =
  createImmutableState(
    context
  );

  for(

    const middleware

    of

    stateManagerState
    .middleware

  ){

    try{

      const result =
      await middleware(
        immutableContext
      );

      if(
        result === false
      ){

        return false;

      }

    }

    catch(error){}

  }

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  useStateMiddleware,

  removeStateMiddleware,

  executeStateMiddleware

};
