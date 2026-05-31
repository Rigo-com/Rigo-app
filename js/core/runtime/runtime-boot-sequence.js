// =====================================
// RIGO AI
// RUNTIME BOOT SEQUENCE
// =====================================



// =====================================
// IMPORTS
// =====================================

import ModuleRuntime
from "../modules/module-runtime.js";



// =====================================
// INTERNAL STATE
// =====================================

const runtimeBootSequenceState =
Object.seal({

  bootSteps:
  [],

  shutdownSteps:
  []

});



// =====================================
// REGISTRATION
// =====================================

function registerBootStep(
  name,
  handler
){

  runtimeBootSequenceState
  .bootSteps
  .push({

    name,

    handler

  });

  return true;

}



function registerShutdownStep(
  name,
  handler
){

  runtimeBootSequenceState
  .shutdownSteps
  .push({

    name,

    handler

  });

  return true;

}



// =====================================
// BOOT EXECUTION
// =====================================

async function executeBootSequence(){

  for(
    const step
    of runtimeBootSequenceState
    .bootSteps
  ){

    await step
    .handler();

  }

  return true;

}



// =====================================
// SHUTDOWN EXECUTION
// =====================================

async function executeShutdownSequence(){

  const steps =

    [...runtimeBootSequenceState
    .shutdownSteps]
    .reverse();

  for(
    const step
    of steps
  ){

    await step
    .handler();

  }

  return true;

}



// =====================================
// DEFAULT RUNTIME STEP
// =====================================

registerBootStep(

  "modules-runtime",

  async() => {

    await ModuleRuntime
    .boot();

  }

);



registerShutdownStep(

  "modules-runtime",

  async() => {

    await ModuleRuntime
    .shutdown();

  }

);



// =====================================
// SNAPSHOT
// =====================================

function createBootSequenceSnapshot(){

  return Object.freeze({

    bootSteps:

      runtimeBootSequenceState
      .bootSteps
      .map((step) => {

        return step.name;

      }),

    shutdownSteps:

      runtimeBootSequenceState
      .shutdownSteps
      .map((step) => {

        return step.name;

      }),

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const RuntimeBootSequence =
Object.freeze({

  registerBootStep,

  registerShutdownStep,

  executeBootSequence,

  executeShutdownSequence,

  snapshot:
  createBootSequenceSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  registerBootStep,

  registerShutdownStep,

  executeBootSequence,

  executeShutdownSequence,

  createBootSequenceSnapshot,

  RuntimeBootSequence

};

export default
RuntimeBootSequence;
