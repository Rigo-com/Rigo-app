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

  return registerModule(
    AdminAgent
  );

}



// =====================================
// REGISTER STUDIO
// =====================================

function registerStudioModule(){

  return registerModule(
    Studio
  );

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
