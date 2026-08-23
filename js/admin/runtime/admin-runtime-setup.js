// =====================================
// RIGO AI
// ADMIN RUNTIME SETUP
// MODULE REGISTRATION
// =====================================

import AdminAgent from "../admin-agent/index.js";
import DebugAgent from "../admin-agent/subagents/debug-agent/index.js";
import Studio from "../studio/index.js";
import { registerModule } from "./admin-runtime-registry.js";

function registerAgentModule(){
  return registerModule(AdminAgent);
}

function registerDebugAgentModule(){
  return registerModule(DebugAgent);
}

function registerStudioModule(){
  return registerModule(Studio);
}

function registerRuntimeModules(){
  const results = [
    registerAgentModule(),
    registerDebugAgentModule(),
    registerStudioModule()
  ];
  return results.every(Boolean);
}

export {
  registerAgentModule,
  registerDebugAgentModule,
  registerStudioModule,
  registerRuntimeModules
};

export default registerRuntimeModules;
