// =====================================
// RIGO AI
// ADMIN RUNTIME LIFECYCLE
// =====================================

import AdminRuntimeState
from "./admin-runtime-state.js";

import {
  listModules
}
from "./admin-runtime-registry.js";



// =====================================
// BOOT
// =====================================

export async function
bootRuntimeModules(){

  if(
    AdminRuntimeState
    .state
    .running
  ){

    return false;

  }

  try{

    const modules =
    listModules();

    for(
      const module
      of modules
    ){

      if(
        typeof module
        .initialize ===
        "function"
      ){

        await module
        .initialize();

      }

      if(
        typeof module
        .boot ===
        "function"
      ){

        await module
        .boot();

      }

      AdminRuntimeState
      .setModuleState(
        module.id,
        true
      );

    }

    AdminRuntimeState
    .state
    .initialized =
    true;

    AdminRuntimeState
    .state
    .booted =
    true;

    AdminRuntimeState
    .state
    .running =
    true;

    AdminRuntimeState
    .state
    .startedAt =
    Date.now();

    AdminRuntimeState
    .state
    .diagnostics
    .boots++;

    AdminRuntimeState
    .log(
      "runtime",
      "ADMIN RUNTIME BOOTED"
    );

    return true;

  }
  catch(error){

    AdminRuntimeState
    .setError(
      error
    );

    return false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

export async function
shutdownRuntimeModules(){

  const modules =

    listModules()
    .reverse();

  for(
    const module
    of modules
  ){

    if(
      typeof module
      .shutdown ===
      "function"
    ){

      await module
      .shutdown();

    }

    AdminRuntimeState
    .setModuleState(
      module.id,
      false
    );

  }

  AdminRuntimeState
  .state
  .booted =
  false;

  AdminRuntimeState
  .state
  .running =
  false;

  AdminRuntimeState
  .state
  .diagnostics
  .shutdowns++;

  AdminRuntimeState
  .log(
    "runtime",
    "ADMIN RUNTIME SHUTDOWN"
  );

  return true;

}



// =====================================
// RESET
// =====================================

export async function
resetRuntimeModules(){

  const modules =

    listModules()
    .reverse();

  for(
    const module
    of modules
  ){

    if(
      typeof module
      .reset ===
      "function"
    ){

      await module
      .reset();

    }

  }

  AdminRuntimeState
  .reset();

  return true;

}



// =====================================
// RECOVER
// =====================================

export async function
recoverRuntimeModules(){

  await shutdownRuntimeModules();

  return
  bootRuntimeModules();

}
