// =====================================
// RIGO AI
// BOOTSTRAP LIFECYCLE
// =====================================

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

  try{

    const systems =
    listBootstrapSystems();

    for(
      const system
      of systems
    ){

      try{

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

  bootstrapState
  .recovering =
  true;

  bootstrapState
  .diagnostics
  .recoveries++;

  try{

    await shutdownBootstrapSystems();

    return bootBootstrapSystems();

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

  return true;

}
