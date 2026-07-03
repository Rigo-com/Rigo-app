// =====================================
// RIGO AI
// RIGO STUDIO
// STUDIO KERNEL
// =====================================

import StudioState
from "./studio-state.js";

import StudioEvents
from "./studio-events.js";

import PluginManager
from "../managers/plugin-manager.js";



// =====================================
// INITIALIZE
// =====================================

async function initialize(){

  try{

    if(
      StudioState
      .state
      .initialized
    ){

      return true;

    }

    StudioState
    .setInitialized(
      true
    );

    StudioState
    .log(
      "system",
      "STUDIO INITIALIZED"
    );

    await StudioEvents
    .emit(
      "studio:initialized"
    );

    return true;

  }
  catch(error){

    StudioState
    .setError(
      error
    );

    return false;

  }

}



// =====================================
// BOOT
// =====================================

async function boot(){

  try{

    if(
      !StudioState
      .state
      .initialized
    ){

      await initialize();

    }

    StudioState
    .setBooted(
      true
    );

    StudioState
    .setMounted(
      true
    );

    StudioState
    .log(
      "system",
      "STUDIO BOOTED"
    );

    await StudioEvents
    .emit(
      "studio:booted"
    );

    return true;

  }
  catch(error){

    StudioState
    .setError(
      error
    );

    return false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdown(){

  await StudioEvents
  .emit(
    "studio:shutdown"
  );

  StudioState
  .setMounted(
    false
  );

  StudioState
  .setBooted(
    false
  );

  StudioState
  .log(
    "system",
    "STUDIO SHUTDOWN"
  );

  return true;

}



// =====================================
// RESET
// =====================================

async function reset(){

  await shutdown();

  StudioEvents
  .clear();

  StudioState
  .reset();

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    state:
    StudioState
    .snapshot(),

    events:
    StudioEvents
    .snapshot()

  };

}



// =====================================
// API
// =====================================

const StudioKernel =
Object.freeze({

  id:
  "studio-kernel",

  priority:
  100,

  initialize,

  boot,

  shutdown,

  reset,

  snapshot,

  events:
  StudioEvents

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  boot,

  shutdown,

  reset,

  snapshot,

  StudioKernel

};

export default
StudioKernel;
