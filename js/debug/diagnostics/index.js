// =====================================
// RIGO AI
// DIAGNOSTICS INDEX
// PUBLIC API
// =====================================

import { diagnosticsState } from "./diagnostics-state.js";
import { DiagnosticsEvents,on,off,emit,clear } from "./diagnostics-events.js";
import { saveDiagnostics,loadDiagnostics,restoreDiagnostics,clearDiagnostics } from "./diagnostics-storage.js";
import { DiagnosticsManager } from "./diagnostics-manager.js";

export {
  diagnosticsState,
  DiagnosticsEvents,
  on,
  off,
  emit,
  clear,
  saveDiagnostics,
  loadDiagnostics,
  restoreDiagnostics,
  clearDiagnostics,
  DiagnosticsManager
};

const Diagnostics=Object.freeze({
  state:diagnosticsState,
  events:DiagnosticsEvents,
  on,
  off,
  emit,
  clear,
  save:saveDiagnostics,
  load:loadDiagnostics,
  restore:restoreDiagnostics,
  clearStorage:clearDiagnostics,
  initialize:DiagnosticsManager.initialize,
  start:DiagnosticsManager.start,
  stop:DiagnosticsManager.stop,
  recordEvent:DiagnosticsManager.recordEvent,
  snapshot:DiagnosticsManager.snapshot,
  addWarning:DiagnosticsManager.addWarning,
  addError:DiagnosticsManager.addError,
  addCriticalIssue:DiagnosticsManager.addCriticalIssue
});

export default Diagnostics;
