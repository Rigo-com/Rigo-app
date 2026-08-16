import Diagnostics from "./diagnostics/index.js";
import Scanner from "./scanner/index.js";
import Monitor from "./monitor/index.js";
import Reporter from "./reporter/index.js";
import UI from "./ui/index.js";

const debugState = Object.seal({
  initialized:false,
  running:false,
  startedAt:null,
  stoppedAt:null,
  lastError:null
});

function startMonitors(){
  Monitor.memory.start();
  Monitor.performance.start();
  Monitor.network.start();
  Monitor.events.start();
  Monitor.services.start();
  Scanner.runtime.start();
}

function stopMonitors(){
  Monitor.memory.stop();
  Monitor.performance.stop();
  Monitor.network.stop();
  Monitor.events.stop();
  Monitor.services.stop();
  Scanner.runtime.stop();
}

function initializeDebugSystem(){
  if(debugState.initialized) return true;
  debugState.initialized = true;
  debugState.lastError = null;
  return true;
}

function bootDebugSystem(){
  if(debugState.running) return true;
  try{
    initializeDebugSystem();
    Diagnostics.start();
    Diagnostics.recordEvent("debug:initialized");
    startMonitors();
    debugState.running = true;
    debugState.startedAt = Date.now();
    debugState.stoppedAt = null;
    return true;
  }
  catch(error){
    stopMonitors();
    Diagnostics.stop();
    debugState.running = false;
    debugState.lastError = String(error?.message || error);
    return false;
  }
}

function stopDebugSystem(){
  if(!debugState.running) return true;
  try{
    stopMonitors();
    Diagnostics.stop();
    debugState.running = false;
    debugState.stoppedAt = Date.now();
    return true;
  }
  catch(error){
    debugState.lastError = String(error?.message || error);
    return false;
  }
}

function resetDebugSystem(){
  const stopped = stopDebugSystem();
  if(!stopped) return false;
  Object.assign(debugState, { initialized:false, running:false, startedAt:null, stoppedAt:null, lastError:null });
  return true;
}

function createSystemReport(){
  const diagnostics = Diagnostics.snapshot();
  const runtime = Scanner.runtime.snapshot();
  const circular = Scanner.circular.snapshot();
  return Reporter.builder.health({
    healthScore:diagnostics.healthScore,
    warnings:diagnostics.warnings,
    errors:diagnostics.errors,
    critical:diagnostics.critical,
    events:diagnostics.eventCount || 0,
    runtimeErrors:runtime.runtimeErrors || 0,
    circularDependencies:circular.circularFound || 0
  });
}

function createDebugSnapshot(){
  return Object.freeze({
    system:Object.freeze({ ...debugState }),
    diagnostics:Diagnostics.snapshot(),
    memory:Monitor.memory.snapshot(),
    performance:Monitor.performance.snapshot(),
    network:Monitor.network.snapshot(),
    events:Monitor.events.snapshot(),
    services:Monitor.services.snapshot(),
    runtime:Scanner.runtime.snapshot(),
    module:Scanner.module.snapshot(),
    dependency:Scanner.dependency.snapshot(),
    imports:Scanner.imports.snapshot(),
    syntax:Scanner.syntax.snapshot(),
    circular:Scanner.circular.snapshot(),
    timestamp:Date.now()
  });
}

function openDashboard(){
  UI.dashboard.render(createDebugSnapshot());
  UI.dashboard.show();
  return true;
}

const Debug = Object.freeze({
  id:"debug",
  priority:8,
  diagnostics:Diagnostics,
  scanner:Scanner,
  monitor:Monitor,
  reporter:Reporter,
  ui:UI,
  initialize:initializeDebugSystem,
  boot:bootDebugSystem,
  start:bootDebugSystem,
  shutdown:stopDebugSystem,
  stop:stopDebugSystem,
  reset:resetDebugSystem,
  report:createSystemReport,
  snapshot:createDebugSnapshot,
  dashboard:openDashboard
});

export { debugState, initializeDebugSystem, bootDebugSystem, stopDebugSystem, resetDebugSystem, createSystemReport, createDebugSnapshot, Debug };
export default Debug;
