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

import ServiceManager
from "../services/service-manager.js";

import {
  registerBootstrapSystem
}
from "./bootstrap-registry.js";



// =====================================
// REGISTER CORE
// =====================================

async function initializeCoreSystem(){

  if(!ServiceManager.has("events")){

    await ServiceManager.register(
      "events",
      async () => Core.events
    );

  }

  return Core.initialize();

}

function registerCoreSystem(){

  return registerBootstrapSystem({
    id:"core",
    priority:0,
    initialize:initializeCoreSystem,
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



let adminModulePromise = null;

function loadAdminSystem(){

  if(!adminModulePromise){
    adminModulePromise = import("../admin/index.js").then(module => module.default);
  }

  return adminModulePromise;

}

function shouldRegisterAdminSystem(){

  if(typeof window === "undefined"){
    return true;
  }

  const path = String(window.location?.pathname || "").toLowerCase();
  return path.endsWith("/admin.html") || path.endsWith("/admin");

}

function registerAdminSystem(){

  if(!shouldRegisterAdminSystem()){
    return true;
  }

  return registerBootstrapSystem({
    id:"admin",
    priority:40,
    initialize:async () => (await loadAdminSystem()).initialize(),
    boot:async () => (await loadAdminSystem()).boot(),
    shutdown:async () => (await loadAdminSystem()).shutdown()
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
  initializeCoreSystem,
  registerCoreSystem,
  registerAISystem,
  registerChatSystem,
  registerDebugSystem,
  loadAdminSystem,
  shouldRegisterAdminSystem,
  registerAdminSystem,
  registerBootstrapSystems
};

export default registerBootstrapSystems;
