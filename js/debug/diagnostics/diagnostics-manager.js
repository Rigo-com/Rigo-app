import { diagnosticsState } from "./diagnostics-state.js";
import { DiagnosticsEvents, emit } from "./diagnostics-events.js";
import { saveDiagnostics, restoreDiagnostics } from "./diagnostics-storage.js";

const LIMITS=Object.freeze({warnings:200,errors:200,critical:100,events:500});

function trim(list,max){
  if(list.length>max)list.splice(0,list.length-max);
}

function initializeDiagnostics(){
  if(diagnosticsState.initialized)return true;
  restoreDiagnostics();
  diagnosticsState.initialized=true;
  diagnosticsState.startedAt=Date.now();
  recordEvent(DiagnosticsEvents.INITIALIZED);
  emit(DiagnosticsEvents.INITIALIZED);
  return true;
}

function startDiagnostics(){
  initializeDiagnostics();
  diagnosticsState.active=true;
  diagnosticsState.monitoring=true;
  recordEvent(DiagnosticsEvents.STARTED);
  emit(DiagnosticsEvents.STARTED);
  return true;
}

function stopDiagnostics(){
  diagnosticsState.active=false;
  diagnosticsState.scanning=false;
  diagnosticsState.monitoring=false;
  recordEvent(DiagnosticsEvents.STOPPED);
  emit(DiagnosticsEvents.STOPPED);
  saveDiagnostics();
  return true;
}

function updateHealthScore(){
  let score=100;
  score-=diagnosticsState.criticalIssues.length*20;
  score-=diagnosticsState.errors.length*5;
  score-=diagnosticsState.warnings.length*2;
  diagnosticsState.healthScore=Math.max(0,score);
  return diagnosticsState.healthScore;
}

function recordEvent(type,payload=null){
  diagnosticsState.eventHistory.push({type,payload,timestamp:Date.now()});
  trim(diagnosticsState.eventHistory,LIMITS.events);
  return true;
}

function addWarning(warning){
  diagnosticsState.warnings.push(warning);
  trim(diagnosticsState.warnings,LIMITS.warnings);
  diagnosticsState.diagnostics.warnings++;
  updateHealthScore();
  recordEvent(DiagnosticsEvents.WARNING,warning);
  emit(DiagnosticsEvents.WARNING,warning);
  saveDiagnostics();
  return true;
}

function addError(error){
  diagnosticsState.errors.push(error);
  trim(diagnosticsState.errors,LIMITS.errors);
  diagnosticsState.diagnostics.errors++;
  updateHealthScore();
  recordEvent(DiagnosticsEvents.ERROR,error);
  emit(DiagnosticsEvents.ERROR,error);
  saveDiagnostics();
  return true;
}

function addCriticalIssue(issue){
  diagnosticsState.criticalIssues.push(issue);
  trim(diagnosticsState.criticalIssues,LIMITS.critical);
  diagnosticsState.diagnostics.critical++;
  updateHealthScore();
  recordEvent(DiagnosticsEvents.CRITICAL,issue);
  emit(DiagnosticsEvents.CRITICAL,issue);
  saveDiagnostics();
  return true;
}

function createDiagnosticsSnapshot(){
  return Object.freeze({
    initialized:diagnosticsState.initialized,
    active:diagnosticsState.active,
    scanning:diagnosticsState.scanning,
    monitoring:diagnosticsState.monitoring,
    healthScore:diagnosticsState.healthScore,
    diagnostics:{...diagnosticsState.diagnostics},
    errors:diagnosticsState.errors.length,
    warnings:diagnosticsState.warnings.length,
    critical:diagnosticsState.criticalIssues.length,
    eventCount:diagnosticsState.eventHistory.length,
    lastEvent:diagnosticsState.eventHistory.at(-1)||null,
    recentErrors:[...diagnosticsState.errors].slice(-25),
    recentWarnings:[...diagnosticsState.warnings].slice(-25),
    recentCritical:[...diagnosticsState.criticalIssues].slice(-25),
    recentEvents:[...diagnosticsState.eventHistory].slice(-50),
    timestamp:Date.now()
  });
}

const DiagnosticsManager=Object.freeze({
  initialize:initializeDiagnostics,
  start:startDiagnostics,
  stop:stopDiagnostics,
  recordEvent,
  addWarning,
  addError,
  addCriticalIssue,
  updateHealthScore,
  snapshot:createDiagnosticsSnapshot
});

export {DiagnosticsManager};
export default DiagnosticsManager;
