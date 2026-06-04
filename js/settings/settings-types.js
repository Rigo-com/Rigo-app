// =====================================
// RIGO AI
// SETTINGS TYPES
// TYPE DEFINITIONS LAYER
// =====================================



// =====================================
// SETTINGS STATES
// =====================================

const SETTINGS_STATES =
Object.freeze({

  READY:
  "ready",

  LOADING:
  "loading",

  SAVING:
  "saving",

  SYNCING:
  "syncing",

  ERROR:
  "error"

});



// =====================================
// SETTINGS SECTIONS
// =====================================

const SETTINGS_SECTIONS =
Object.freeze({

  GENERAL:
  "general",

  AI:
  "ai",

  MEMORY:
  "memory",

  SEARCH:
  "search",

  VOICE:
  "voice",

  UI:
  "ui",

  SECURITY:
  "security",

  NOTIFICATIONS:
  "notifications",

  AGENTS:
  "agents",

  DEVELOPER:
  "developer"

});



// =====================================
// SETTINGS OPERATIONS
// =====================================

const SETTINGS_OPERATIONS =
Object.freeze({

  LOAD:
  "load",

  SAVE:
  "save",

  SYNC:
  "sync",

  RESET:
  "reset",

  IMPORT:
  "import",

  EXPORT:
  "export"

});



// =====================================
// SETTINGS STATUS
// =====================================

const SETTINGS_STATUS =
Object.freeze({

  SUCCESS:
  "success",

  FAILED:
  "failed",

  PENDING:
  "pending"

});



// =====================================
// PUBLIC API
// =====================================

const SettingsTypes =
Object.freeze({

  states:
  SETTINGS_STATES,

  sections:
  SETTINGS_SECTIONS,

  operations:
  SETTINGS_OPERATIONS,

  status:
  SETTINGS_STATUS

});



// =====================================
// EXPORTS
// =====================================

export {

  SETTINGS_STATES,

  SETTINGS_SECTIONS,

  SETTINGS_OPERATIONS,

  SETTINGS_STATUS,

  SettingsTypes

};

export default
SettingsTypes;
