// =====================================
// RIGO AI
// STATE TRANSACTIONS
// =====================================



// =====================================
// IMPORTS
// =====================================

import STATE_MANAGER_CONFIG
from "./state-config.js";



// =====================================
// TRANSACTION
// =====================================

async function runStateTransaction(
  stateManagerState,
  callback,
  dependencies
){

  if(
    typeof callback !==
    "function"
  ){

    return false;

  }

  if(

    !STATE_MANAGER_CONFIG
    .ENABLE_TRANSACTIONS

  ){

    return callback();

  }

  if(
    stateManagerState
    .activeTransaction
  ){

    return false;

  }

  stateManagerState
  .activeTransaction =
  true;

  stateManagerState
  .diagnostics
  .transactions++;

  try{

    const {

      getStateValue,

      updateState,

      removeStateValue

    } = dependencies;

    return await callback({

      get:
      getStateValue,

      set:
      updateState,

      remove:
      removeStateValue

    });

  }

  finally{

    stateManagerState
    .activeTransaction =
    false;

  }

}



// =====================================
// EXPORTS
// =====================================

export {

  runStateTransaction

};
