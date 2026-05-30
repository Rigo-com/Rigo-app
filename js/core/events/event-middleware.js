// =====================================
// RIGO AI
// EVENT MIDDLEWARE
// =====================================



// =====================================
// IMPORTS
// =====================================

import {
  systemEventsState
}
from "./event-state.js";



// =====================================
// USE
// =====================================

function useSystemEventMiddleware(
  middleware
){

  if(
    typeof middleware !==
    "function"
  ){

    return null;

  }

  systemEventsState
  .middleware
  .add(
    middleware
  );

  return () => {

    removeSystemEventMiddleware(
      middleware
    );

  };

}



// =====================================
// REMOVE
// =====================================

function removeSystemEventMiddleware(
  middleware
){

  return systemEventsState
  .middleware
  .delete(
    middleware
  );

}



// =====================================
// EXECUTE
// =====================================

async function executeEventMiddleware(
  event
){

  for(

    const middleware

    of

    systemEventsState
    .middleware

  ){

    try{

      const result =
      await middleware(
        event
      );

      if(
        result === false
      ){

        systemEventsState
        .diagnostics
        .cancelled++;

        return false;

      }

    }

    catch(error){

      systemEventsState
      .failedEvents++;

      systemEventsState
      .diagnostics
      .failed++;

      console.warn(
        "[SystemEvents] Middleware failed",
        error
      );

    }

  }

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  useSystemEventMiddleware,

  removeSystemEventMiddleware,

  executeEventMiddleware

};
