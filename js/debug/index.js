import Diagnostics from "./diagnostics/index.js";
import Scanner from "./scanner/index.js";
import Monitor from "./monitor/index.js";
import Reporter from "./reporter/index.js";
import UI from "./ui/index.js";
import Utils from "./utils/index.js";

const debugState = Object.seal({
  initialized:false,
  running:false,
  telemetryBound:false,
  scanRunning:false,
  startedAt:null,
  stoppedAt:null,
  lastScanAt:null,
  lastError:null,
  eventUnsubscribe:null
});

const CORE_MODULE_PATHS = Object.freeze([
  "../shared/index.js",
  "../security/index.js",
  "../storage/index.js",
  "../auth/index.js",
  "../settings/index.js",
  "../memory/index.js",
  "../search/index.js",
  "../communication/index.js",
  "../api/index.js",
  "../services/index.js",
  "../ui/index.js",
  "../voice/index.js",
  "../ai/index.js",
  "../chat/index.js"
]);

function browserAvailable(){
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function safeCall(target, method, ...args){
  try{
    if(target && typeof target[method] === "function") return target[method](...args);
  }catch(error){
    Diagnostics.addWarning(`DEBUG ${method} FAILED: ${error?.message || error}`);
  }
  return false;
}

function startMonitors(){
  safeCall(Monitor.memory,"start");
  safeCall(Monitor.performance,"start");
  safeCall(Monitor.services,"start");
  safeCall(Monitor.events,"start");
  if(browserAvailable()){
    safeCall(Monitor.network,"start");
    safeCall(Scanner.runtime,"start");
  }
  return true;
}

function stopMonitors(){
  safeCall(Monitor.memory,"stop");
  safeCall(Monitor.performance,"stop");
  safeCall(Monitor.network,"stop");
  safeCall(Monitor.events,"stop");
  safeCall(Monitor.services,"stop");
  safeCall(Scanner.runtime,"stop");
  return true;
}

async function bindApplicationTelemetry(){
  if(debugState.telemetryBound) return true;
  try{
    const [{ default:ServiceManager }, { default:ModuleRegistry }] = await Promise.all([
      import("../services/service-manager.js"),
      import("../core/modules/module-registry.js")
    ]);

    for(const serviceName of ServiceManager.list?.() || []){
      Monitor.services.register(String(serviceName));
    }

    for(const moduleName of ModuleRegistry.getRegisteredModules?.() || []){
      if(!Monitor.services.get(`module:${moduleName}`)){
        Monitor.services.register(`module:${moduleName}`);
      }
    }

    if(ServiceManager.has?.("events")){
      const events = await ServiceManager.resolve("events");
      if(events && typeof events.onAny === "function"){
        const listener = event => {
          const type = event?.type || event?.name || "system-event";
          Monitor.events.record(type,0,true);
        };
        const result = events.onAny(listener);
        debugState.eventUnsubscribe = typeof result === "function"
          ? result
          : () => { try{ events.offAny?.(listener); }catch{} };
      }
    }

    debugState.telemetryBound = true;
    Diagnostics.recordEvent("debug:telemetry-bound");
    return true;
  }catch(error){
    Diagnostics.addWarning(`DEBUG TELEMETRY BIND FAILED: ${error?.message || error}`);
    return false;
  }
}

async function runDeepScan(){
  if(debugState.scanRunning) return { ok:false, error:"DEBUG_SCAN_ALREADY_RUNNING" };
  debugState.scanRunning = true;
  try{
    const modules = [...CORE_MODULE_PATHS];
    const [moduleResults, importResults, dependencyResults] = await Promise.all([
      Scanner.module.scanMany(modules),
      Scanner.imports.scanMany(modules),
      Scanner.dependency.checkMany(modules)
    ]);

    const graph = {};
    try{
      const { default:ModuleRegistry } = await import("../core/modules/module-registry.js");
      for(const name of ModuleRegistry.getRegisteredModules?.() || []){
        const definition = ModuleRegistry.getRegisteredModule?.(name);
        graph[name] = [...(definition?.metadata?.dependencies || [])];
      }
    }catch{}

    const circular = Scanner.circular.scan(graph);
    Scanner.syntax.scan("return true;");
    debugState.lastScanAt = Date.now();
    Diagnostics.recordEvent("debug:deep-scan-completed",{
      modules:moduleResults.length,
      imports:importResults.length,
      dependencies:dependencyResults.length,
      circular:circular?.cycles?.length || 0
    });
    Diagnostics.save();

    return Object.freeze({
      ok:true,
      modules:moduleResults,
      imports:importResults,
      dependencies:dependencyResults,
      circular,
      snapshots:{
        module:Scanner.module.snapshot(),
        imports:Scanner.imports.snapshot(),
        dependency:Scanner.dependency.snapshot(),
        syntax:Scanner.syntax.snapshot(),
        circular:Scanner.circular.snapshot()
      },
      timestamp:Date.now()
    });
  }catch(error){
    Diagnostics.addError(error?.message || String(error));
    debugState.lastError = String(error?.message || error);
    return { ok:false, error:debugState.lastError };
  }finally{
    debugState.scanRunning = false;
  }
}

function initializeDebugSystem(){
  if(debugState.initialized) return true;
  Diagnostics.initialize();
  const persisted = Diagnostics.load();
  if(persisted) Diagnostics.recordEvent("debug:persisted-diagnostics-found",{timestamp:persisted.timestamp || null});
  debugState.initialized = true;
  debugState.lastError = null;
  return true;
}

async function bootDebugSystem(){
  if(debugState.running) return true;
  try{
    initializeDebugSystem();
    Diagnostics.start();
    Diagnostics.recordEvent("debug:initialized");
    startMonitors();
    await bindApplicationTelemetry();
    debugState.running = true;
    debugState.startedAt = Date.now();
    debugState.stoppedAt = null;
    return true;
  }catch(error){
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
    if(typeof debugState.eventUnsubscribe === "function") debugState.eventUnsubscribe();
    debugState.eventUnsubscribe = null;
    debugState.telemetryBound = false;
    stopMonitors();
    Diagnostics.save();
    Diagnostics.stop();
    debugState.running = false;
    debugState.stoppedAt = Date.now();
    return true;
  }catch(error){
    debugState.lastError = String(error?.message || error);
    return false;
  }
}

function resetDebugSystem(){
  const stopped = stopDebugSystem();
  if(!stopped) return false;
  Diagnostics.clear();
  Diagnostics.clearStorage();
  Object.assign(debugState,{
    initialized:false,running:false,telemetryBound:false,scanRunning:false,
    startedAt:null,stoppedAt:null,lastScanAt:null,lastError:null,eventUnsubscribe:null
  });
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
    system:Object.freeze({
      initialized:debugState.initialized,
      running:debugState.running,
      telemetryBound:debugState.telemetryBound,
      scanRunning:debugState.scanRunning,
      startedAt:debugState.startedAt,
      stoppedAt:debugState.stoppedAt,
      lastScanAt:debugState.lastScanAt,
      lastError:debugState.lastError
    }),
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
  if(!browserAvailable()) return false;
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
  utils:Utils,
  initialize:initializeDebugSystem,
  boot:bootDebugSystem,
  start:bootDebugSystem,
  shutdown:stopDebugSystem,
  stop:stopDebugSystem,
  reset:resetDebugSystem,
  scan:runDeepScan,
  report:createSystemReport,
  snapshot:createDebugSnapshot,
  dashboard:openDashboard
});

export {
  debugState,
  initializeDebugSystem,
  bootDebugSystem,
  stopDebugSystem,
  resetDebugSystem,
  bindApplicationTelemetry,
  runDeepScan,
  createSystemReport,
  createDebugSnapshot,
  Debug
};
export default Debug;
