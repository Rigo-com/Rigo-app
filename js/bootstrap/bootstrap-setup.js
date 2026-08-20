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
    shutdown:Core.shutdown,
    reset:Core.reset,
    snapshot:Core.snapshot
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
    boot:AI.boot,
    shutdown:AI.shutdown,
    reset:AI.reset,
    snapshot:AI.snapshot
  });

}



// =====================================
// REGISTER CHAT
// =====================================

async function bootChatSystem(){

  // Chat runtime performs its boot work during initialize().
  // Keep a dedicated boot hook so every bootstrap system
  // follows the common lifecycle contract.
  return true;

}

function registerChatSystem(){

  return registerBootstrapSystem({
    id:"chat",
    priority:20,
    initialize:ChatRuntime.initialize,
    boot:bootChatSystem,
    shutdown:ChatRuntime.destroy,
    reset:ChatRuntime.reset,
    snapshot:ChatRuntime.snapshot
  });

}



// =====================================
// REGISTER DEBUG
// =====================================

function registerDebugSystem(){

  return registerBootstrapSystem({
    id:"debug",
    priority:30,
    initialize:Debug.initialize,
    boot:Debug.boot,
    shutdown:Debug.shutdown,
    reset:Debug.reset,
    snapshot:Debug.snapshot
  });

}



// =====================================
// REGISTER ADMIN
// =====================================

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

async function initializeAdminSystem(){

  return (await loadAdminSystem()).initialize();

}

async function bootAdminSystem(){

  return (await loadAdminSystem()).boot();

}

async function shutdownAdminSystem(){

  return (await loadAdminSystem()).shutdown();

}

async function resetAdminSystem(){

  return (await loadAdminSystem()).reset();

}

async function snapshotAdminSystem(){

  return (await loadAdminSystem()).snapshot();

}

function registerAdminSystem(){

  if(!shouldRegisterAdminSystem()){
    return true;
  }

  return registerBootstrapSystem({
    id:"admin",
    priority:40,
    initialize:initializeAdminSystem,
    boot:bootAdminSystem,
    shutdown:shutdownAdminSystem,
    reset:resetAdminSystem,
    snapshot:snapshotAdminSystem
  });

}



// =====================================
// REGISTER ALL
// =====================================

function registerBootstrapSystems(){

  const results = [
    registerCoreSystem(),
    registerAISystem(),
    registerChatSystem(),
    registerDebugSystem(),
    registerAdminSystem()
  ];

  return results
  .every(Boolean);

}



// =====================================
// EXPORTS
// =====================================

export {
  initializeCoreSystem,
  registerCoreSystem,
  registerAISystem,
  bootChatSystem,
  registerChatSystem,
  registerDebugSystem,
  loadAdminSystem,
  shouldRegisterAdminSystem,
  initializeAdminSystem,
  bootAdminSystem,
  shutdownAdminSystem,
  resetAdminSystem,
  snapshotAdminSystem,
  registerAdminSystem,
  registerBootstrapSystems
};

export default registerBootstrapSystems;
