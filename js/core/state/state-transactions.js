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
      emitSystemEvent,
      STATE_EVENTS,
      getStateValue,
      updateState,
      removeStateValue
    } = dependencies;

    if(
      typeof emitSystemEvent ===
      "function"
    ){

      await emitSystemEvent(
        STATE_EVENTS
        .TRANSACTION_START
      );

    }

    const result =
    await callback({

      get:
      getStateValue,

      set:
      updateState,

      remove:
      removeStateValue

    });

    if(
      typeof emitSystemEvent ===
      "function"
    ){

      await emitSystemEvent(
        STATE_EVENTS
        .TRANSACTION_END
      );

    }

    return result;

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
