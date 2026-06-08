// =====================================
// RIGO AI
// BOOTSTRAP LIFECYCLE
// =====================================

import Diagnostics
from "../debug/diagnostics/index.js";

import {
  bootstrapState
}
from "./bootstrap-state.js";

import {
  listBootstrapSystems
}
from "./bootstrap-registry.js";



// =====================================
// BOOT
// =====================================

export async function bootBootstrapSystems(){

  if(
    bootstrapState.booting
  ){

    return false;

  }

  bootstrapState.state =
  "booting";

  bootstrapState
  .booting =
  true;

  bootstrapState
  .startedAt =
  Date.now();

  bootstrapState
  .diagnostics
  .boots++;
  
  Diagnostics.recordEvent(
  "bootstrap:boot-started"
);
  
  try{

    const systems =
    listBootstrapSystems();

    for(
      const system
      of systems
    ){

      try{

        Diagnostics.recordEvent(
          "bootstrap:system-started",
          {
            system:
            system.id
          }
        );

        if(
          typeof system
          .initialize ===
          "function"
        ){

          await system
          .initialize();

        }

        if(
          typeof system
          .boot ===
          "function"
        ){

          await system
          .boot();

        }

        bootstrapState
        .initializedSystems
        .add(
          system.id
        );

        bootstrapState
        .failedSystems
        .delete(
          system.id
        );

        bootstrapState
        .diagnostics
        .initializedSystems++;

        Diagnostics.recordEvent(
        "bootstrap:system-success",
       {
          system:
          system.id
       }
    );
        
      }

      catch(error){

        bootstrapState
        .failedSystems
        .add(
          system.id
        );

        bootstrapState
        .lastError =
        error;

        Diagnostics.recordEvent(
       "bootstrap:system-failed",
     {

         system:
         system.id,

        error:
        String(error)

     }
   );
        
        throw error;

      }

    }

    bootstrapState
    .initialized =
    true;

    bootstrapState
    .completedAt =
    Date.now();

    bootstrapState.state =
    "ready";

    Diagnostics.recordEvent(
   "bootstrap:boot-completed"
);
    
    return true;

  }

  catch(error){

    bootstrapState
    .diagnostics
    .failures++;

    bootstrapState
    .lastError =
    error;

    bootstrapState.state =
    "failed";

    Diagnostics.recordEvent(
      "bootstrap:boot-failed",
   {
       error:
       String(error)
   }
 );

    return false;

  }

  finally{

    bootstrapState
    .booting =
    false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

export async function shutdownBootstrapSystems(){

  if(
    bootstrapState
    .shuttingDown
  ){

    return false;

  }

  bootstrapState.state =
  "shutdown";
  
  bootstrapState
  .shuttingDown =
  true;

  bootstrapState
  .diagnostics
  .shutdowns++;

  try{

    const systems =

      listBootstrapSystems()
      .reverse();

    for(
      const system
      of systems
    ){

      try{

        if(
          typeof system
          .shutdown ===
          "function"
        ){

          await system
          .shutdown();

        }

      }

      catch(error){}

    }

    bootstrapState
    .initializedSystems
    .clear();

    bootstrapState
    .failedSystems
    .clear();

    bootstrapState
    .initialized =
    false;

    bootstrapState
    .completedAt =
    null;

    bootstrapState.state =
    "idle";
    
    return true;

  }

  finally{

    bootstrapState
    .shuttingDown =
    false;

  }

}



// =====================================
// RECOVER
// =====================================

export async function recoverBootstrapSystems(){

  if(
    bootstrapState
    .recovering
  ){

    return false;

  }

  bootstrapState.state =
  "recovering";

  bootstrapState
  .recovering =
  true;

  bootstrapState
  .diagnostics
  .recoveries++;

  bootstrapState
  .recoveryAttempts++;

  try{

    if(

      bootstrapState
      .recoveryAttempts >

      3

    ){

      bootstrapState.state =
      "failed";

      return false;

    }

    await shutdownBootstrapSystems();

    return await
    bootBootstrapSystems();

  }

  finally{

    bootstrapState
    .recovering =
    false;

  }

}



// =====================================
// RESET
// =====================================

export async function resetBootstrapSystems(){

  await shutdownBootstrapSystems();

  bootstrapState
  .initializedSystems
  .clear();

  bootstrapState
  .failedSystems
  .clear();

  bootstrapState
  .lastError =
  null;

  bootstrapState
  .startedAt =
  null;

  bootstrapState
  .completedAt =
  null;

  bootstrapState
  .initialized =
  false;

  bootstrapState
  .booting =
  false;

  bootstrapState
  .shuttingDown =
  false;

  bootstrapState
  .recovering =
  false;

  bootstrapState
  .recoveryAttempts =
  0;

  bootstrapState
  .state =
  "idle";

  return true;

}
