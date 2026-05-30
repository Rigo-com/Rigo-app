// =====================================
// RIGO AI
// SYSTEM EVENT TYPES
// =====================================



// =====================================
// SYSTEM EVENT TYPES
// =====================================

const SYSTEM_EVENT_TYPES =
Object.freeze({



  // ===================================
  // APPLICATION
  // ===================================

  APP_INITIALIZED:
  "app.initialized",

  APP_READY:
  "app.ready",

  APP_SHUTDOWN:
  "app.shutdown",

  APP_ERROR:
  "app.error",



  // ===================================
  // AUTHENTICATION
  // ===================================

  AUTH_LOGIN:
  "auth.login",

  AUTH_LOGOUT:
  "auth.logout",

  AUTH_EXPIRED:
  "auth.expired",



  // ===================================
  // MEMORY
  // ===================================

  MEMORY_CREATED:
  "memory.created",

  MEMORY_UPDATED:
  "memory.updated",

  MEMORY_DELETED:
  "memory.deleted",

  MEMORY_SYNCED:
  "memory.synced",

  MEMORY_SYNC_FAILED:
  "memory.sync.failed",



  // ===================================
  // AI
  // ===================================

  AI_REQUEST_STARTED:
  "ai.request.started",

  AI_RESPONSE_COMPLETED:
  "ai.response.completed",

  AI_REQUEST_FAILED:
  "ai.request.failed",



  // ===================================
  // UI
  // ===================================

  UI_UPDATED:
  "ui.updated",

  UI_THEME_CHANGED:
  "ui.theme.changed",

  UI_LANGUAGE_CHANGED:
  "ui.language.changed",



  // ===================================
  // NETWORK
  // ===================================

  NETWORK_ONLINE:
  "network.online",

  NETWORK_OFFLINE:
  "network.offline",

  NETWORK_CHANGED:
  "network.changed"

});



// =====================================
// EXPORTS
// =====================================

export default
SYSTEM_EVENT_TYPES;
