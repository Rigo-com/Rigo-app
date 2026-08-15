// =====================================
// RIGO AI
// CONTEXT MANAGER
// PUBLIC EXPORTS
// =====================================

import {

  initializeContextManager,
  shutdownContextManager,
  resetContextManager,
  evictExpiredContexts

}
from "./context-lifecycle.js";

import {

  registerContext,
  updateContext,
  removeContext

}
from "./context-store.js";

import {

  rankContexts,
  compressContext,
  buildContextWindow

}
from "./context-window.js";

import {

  getContextDiagnostics,
  createContextSnapshot,
  getContextHealthReport

}
from "./context-diagnostics.js";



export const ContextManager =
Object.freeze({

  initialize:
  initializeContextManager,

  shutdown:
  shutdownContextManager,

  register:
  registerContext,

  update:
  updateContext,

  remove:
  removeContext,

  evictExpired:
  evictExpiredContexts,

  rank:
  rankContexts,

  compress:
  compressContext,

  buildWindow:
  buildContextWindow,

  diagnostics:
  getContextDiagnostics,

  health:
  getContextHealthReport,

  snapshot:
  createContextSnapshot,

  reset:
  resetContextManager

});



export default
ContextManager;
