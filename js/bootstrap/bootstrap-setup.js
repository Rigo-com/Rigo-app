// =====================================
// RIGO AI
// BOOTSTRAP SETUP
// SYSTEM REGISTRATION
// =====================================

import Core from "../core/index.js";
import AI from "../ai/index.js";
import ChatRuntime from "../chat/chat-runtime/chat-runtime.js";
import ServiceManager from "../services/service-manager.js";
import { registerBootstrapSystem } from "./bootstrap-registry.js";

async function initializeCoreSystem(){
  if(!ServiceManager.has("events")){
    await ServiceManager.register("events",async () => Core.events);
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

function bootChatSystem(){
  return ChatRuntime.boot();
}

function registerChatSystem(){
  return registerBootstrapSystem({
    id:ChatRuntime.id,
    priority:ChatRuntime.priority,
    initialize:ChatRuntime.initialize,
    boot:ChatRuntime.boot,
    shutdown:ChatRuntime.shutdown,
    reset:ChatRuntime.reset,
    snapshot:ChatRuntime.snapshot
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
  if(typeof window === "undefined") return true;
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
  if(!shouldRegisterAdminSystem()) return true;
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

function registerBootstrapSystems(){
  const results = [
    registerCoreSystem(),
    registerAISystem(),
    registerChatSystem(),
    registerAdminSystem()
  ];
  return results.every(Boolean);
}

export {
  initializeCoreSystem,
  registerCoreSystem,
  registerAISystem,
  bootChatSystem,
  registerChatSystem,
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
