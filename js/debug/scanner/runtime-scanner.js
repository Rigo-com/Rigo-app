import Diagnostics from "../diagnostics/index.js";

const MAX_RUNTIME_RECORDS = 250;

const runtimeScannerState = Object.seal({
  initialized:false,
  monitoring:false,
  runtimeErrors:[],
  promiseRejections:[],
  crashes:[],
  startedAt:null,
  lastError:null,
  diagnostics:{ errors:0,rejections:0,crashes:0 }
});

function trim(list){
  if(list.length > MAX_RUNTIME_RECORDS){
    list.splice(0,list.length-MAX_RUNTIME_RECORDS);
  }
}

function handleRuntimeError(event){
  const error={
    type:"runtime-error",
    message:event?.message,
    filename:event?.filename,
    line:event?.lineno,
    column:event?.colno,
    stack:event?.error?.stack,
    timestamp:Date.now()
  };
  runtimeScannerState.runtimeErrors.push(error);
  trim(runtimeScannerState.runtimeErrors);
  runtimeScannerState.lastError=error;
  runtimeScannerState.diagnostics.errors++;
  Diagnostics.addError(error.message||"Runtime Error");
  Diagnostics.recordEvent("runtime:error",error);
}

function handlePromiseRejection(event){
  const rejection={
    type:"promise-rejection",
    reason:String(event?.reason),
    stack:event?.reason?.stack,
    timestamp:Date.now()
  };
  runtimeScannerState.promiseRejections.push(rejection);
  trim(runtimeScannerState.promiseRejections);
  runtimeScannerState.lastError=rejection;
  runtimeScannerState.diagnostics.rejections++;
  Diagnostics.addError(rejection.reason);
  Diagnostics.recordEvent("runtime:rejection",rejection);
}

function startRuntimeMonitoring(){
  if(runtimeScannerState.monitoring) return true;
  if(typeof window === "undefined" || typeof window.addEventListener !== "function"){
    runtimeScannerState.initialized=true;
    return true;
  }
  window.addEventListener("error",handleRuntimeError);
  window.addEventListener("unhandledrejection",handlePromiseRejection);
  runtimeScannerState.initialized=true;
  runtimeScannerState.monitoring=true;
  runtimeScannerState.startedAt=Date.now();
  return true;
}

function stopRuntimeMonitoring(){
  if(!runtimeScannerState.monitoring) return true;
  if(typeof window !== "undefined" && typeof window.removeEventListener === "function"){
    window.removeEventListener("error",handleRuntimeError);
    window.removeEventListener("unhandledrejection",handlePromiseRejection);
  }
  runtimeScannerState.monitoring=false;
  return true;
}

function registerCrash(crash){
  runtimeScannerState.crashes.push({ ...crash,timestamp:Date.now() });
  trim(runtimeScannerState.crashes);
  runtimeScannerState.diagnostics.crashes++;
  Diagnostics.addCriticalIssue(crash?.message||"Runtime Crash");
  Diagnostics.recordEvent("runtime:crash",crash||null);
  return true;
}

function createRuntimeSnapshot(){
  return Object.freeze({
    initialized:runtimeScannerState.initialized,
    monitoring:runtimeScannerState.monitoring,
    runtimeErrors:runtimeScannerState.runtimeErrors.length,
    promiseRejections:runtimeScannerState.promiseRejections.length,
    crashes:runtimeScannerState.crashes.length,
    recentRuntimeErrors:[...runtimeScannerState.runtimeErrors].slice(-25),
    recentPromiseRejections:[...runtimeScannerState.promiseRejections].slice(-25),
    recentCrashes:[...runtimeScannerState.crashes].slice(-25),
    lastError:runtimeScannerState.lastError,
    diagnostics:{...runtimeScannerState.diagnostics},
    timestamp:Date.now()
  });
}

export const RuntimeScanner=Object.freeze({
  start:startRuntimeMonitoring,
  stop:stopRuntimeMonitoring,
  registerCrash,
  snapshot:createRuntimeSnapshot
});

export default RuntimeScanner;
