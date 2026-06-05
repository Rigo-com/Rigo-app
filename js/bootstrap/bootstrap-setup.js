// =====================================
// RIGO AI
// BOOTSTRAP SETUP
// SYSTEM REGISTRATION
// =====================================

import Core
from "../core/index.js";

import {
  registerBootstrapSystem
}
from "./bootstrap-registry.js";



// =====================================
// REGISTER CORE
// =====================================

function registerCoreSystem(){

  return registerBootstrapSystem({

    id:
    "core",

    priority:
    0,

    initialize:
    Core.initialize,

    boot:
    Core.boot,

    shutdown:
    Core.shutdown

  });

}



// =====================================
// REGISTER ALL
// =====================================

function registerBootstrapSystems(){

  registerCoreSystem();

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  registerCoreSystem,

  registerBootstrapSystems

};

export default
registerBootstrapSystems;
