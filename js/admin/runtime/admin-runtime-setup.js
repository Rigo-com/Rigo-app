// =====================================
// RIGO AI
// ADMIN RUNTIME SETUP
// MODULE REGISTRATION
// =====================================

import AdminAgent
from "../admin-agent/index.js";

import Studio
from "../studio/index.js";

import {
  registerModule
}
from "./admin-runtime-registry.js";



// =====================================
// REGISTER AGENT
// =====================================

function registerAgentModule(){

  return registerModule({

    id:
    "admin-agent",

    priority:
    0,

    initialize:
    AdminAgent.initialize,

    boot:
    AdminAgent.boot,

    shutdown:
    AdminAgent.shutdown,

    reset:
    AdminAgent.reset,

    snapshot:
    AdminAgent.snapshot

  });

}



// =====================================
// REGISTER STUDIO
// =====================================

function registerStudioModule(){

  return registerModule({

    id:
    "studio",

    priority:
    10,

    initialize:
    Studio.initialize,

    boot:
    Studio.boot,

    shutdown:
    Studio.shutdown,

    reset:
    Studio.reset,

    snapshot:
    Studio.snapshot

  });

}



// =====================================
// REGISTER ALL
// =====================================

function registerRuntimeModules(){

  registerAgentModule();

  registerStudioModule();

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  registerAgentModule,

  registerStudioModule,

  registerRuntimeModules

};

export default
registerRuntimeModules;
