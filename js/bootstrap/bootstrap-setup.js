// =====================================
// RIGO AI
// BOOTSTRAP SETUP
// SYSTEM REGISTRATION
// =====================================

import Core
from "../core/index.js";

import AI
from "../ai/index.js";

import ChatRuntime
from "../chat/chat-runtime/chat-runtime.js";

import Debug
from "../debug/index.js";

import Admin
from "../admin/index.js";

import {
  registerBootstrapSystem
}
from "./bootstrap-registry.js";



// =====================================
// REGISTER CORE
// =====================================

function registerCoreSystem(){

  return registerBootstrapSystem({
    id:"core",
    priority:0,
    initialize:Core.initialize,
    boot:Core.boot,
    shutdown:Core.shutdown
  });

}



// =====================================
// REGISTER AI
// =====================================

function registerAISystem(){

  return registerBootstrapSystem({
    id:"ai",
    priority:10,
    initialize:AI.initialize,
    shutdown:AI.shutdown
  });

}



function registerChatSystem(){

  return registerBootstrapSystem({
    id:"chat",
    priority:20,
    initialize:ChatRuntime.initialize,
    shutdown:ChatRuntime.destroy
  });

}



function registerDebugSystem(){

  return registerBootstrapSystem({
    id:"debug",
    priority:30,
    initialize:Debug.initialize,
    shutdown:Debug.stop
  });

}



function registerAdminSystem(){

  return registerBootstrapSystem({
    id:"admin",
    priority:40,
    initialize:Admin.initialize,
    boot:Admin.boot,
    shutdown:Admin.shutdown
  });

}



// =====================================
// REGISTER ALL
// =====================================

function registerBootstrapSystems(){

  registerCoreSystem();
  registerAISystem();
  registerChatSystem();
  registerDebugSystem();
  registerAdminSystem();

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {
  registerCoreSystem,
  registerAISystem,
  registerChatSystem,
  registerDebugSystem,
  registerAdminSystem,
  registerBootstrapSystems
};

export default registerBootstrapSystems;
