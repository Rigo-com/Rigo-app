// =====================================
// RIGO AI
// DIAGNOSTICS INDEX
// PUBLIC API
// =====================================



// =====================================
// IMPORTS
// =====================================

import {
  diagnosticsState
}
from "./diagnostics-state.js";

import {
  DiagnosticsEvents,
  on,
  off,
  emit,
  clear
}
from "./diagnostics-events.js";

import {
  saveDiagnostics,
  loadDiagnostics,
  clearDiagnostics
}
from "./diagnostics-storage.js";

import {
  DiagnosticsManager
}
from "./diagnostics-manager.js";



// =====================================
// EXPORTS
// =====================================

export {

  diagnosticsState,

  DiagnosticsEvents,

  on,

  off,

  emit,

  clear,

  saveDiagnostics,

  loadDiagnostics,

  clearDiagnostics,

  DiagnosticsManager

};



// =====================================
// DEFAULT API
// =====================================

const Diagnostics =
Object.freeze({

  state:
  diagnosticsState,

  events:
  DiagnosticsEvents,

  on,

  off,

  emit,

  clear,

  save:
  saveDiagnostics,

  load:
  loadDiagnostics,

  clearStorage:
  clearDiagnostics,

  initialize:
  DiagnosticsManager
  .initialize,

  start:
  DiagnosticsManager
  .start,

  stop:
  DiagnosticsManager
  .stop,

  recordEvent:
  DiagnosticsManager
  .recordEvent,
  
  snapshot:
  DiagnosticsManager
  .snapshot,

  addWarning:
  DiagnosticsManager
  .addWarning,

  addError:
  DiagnosticsManager
  .addError,

  addCriticalIssue:
  DiagnosticsManager
  .addCriticalIssue
  
});



// =====================================
// EXPORTS
// =====================================

export default
Diagnostics;
