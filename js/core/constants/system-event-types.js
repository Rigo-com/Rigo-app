// =====================================
// RIGO AI
// SYSTEM EVENT TYPES
// =====================================

const SYSTEM_EVENT_TYPES =
Object.freeze({



  // ===================================
  // APP
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
  // AUTH
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



  // ===================================
  // AI
  // ===================================

  AI_REQUEST:
  "ai.request",

  AI_RESPONSE:
  "ai.response",

  AI_ERROR:
  "ai.error",



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
  "network.offline"

});
