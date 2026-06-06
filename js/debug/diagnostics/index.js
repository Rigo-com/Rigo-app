// =====================================
// RIGO AI
// DIAGNOSTICS INDEX
// PUBLIC API
// =====================================



// =====================================
// STATE
// =====================================

export {
  diagnosticsState
}
from "./diagnostics-state.js";



// =====================================
// EVENTS
// =====================================

export {
  DiagnosticsEvents,
  on,
  off,
  emit,
  clear
}
from "./diagnostics-events.js";



// =====================================
// STORAGE
// =====================================

export {
  saveDiagnostics,
  loadDiagnostics,
  clearDiagnostics
}
from "./diagnostics-storage.js";



// =====================================
// MANAGER
// =====================================

export {
  DiagnosticsManager
}
from "./diagnostics-manager.js";

export {
  default
}
from "./diagnostics-manager.js";
