// =====================================
// RIGO AI
// RIGO STUDIO
// ROOT EXPORTS
// =====================================

import StudioKernel
from "./kernel/studio-kernel.js";



// =====================================
// API
// =====================================

async function initialize(){

  return StudioKernel
  .initialize();

}



async function boot(){

  return StudioKernel
  .boot();

}



async function shutdown(){

  return StudioKernel
  .shutdown();

}



async function reset(){

  return StudioKernel
  .reset();

}



function snapshot(){

  return StudioKernel
  .snapshot();

}



// =====================================
// ROOT API
// =====================================

const Studio =
Object.freeze({

  id:
  "rigo-studio",

  priority:
  100,

  initialize,

  boot,

  shutdown,

  reset,

  snapshot,

  kernel:
  StudioKernel

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

  Studio

};

export default
Studio;
