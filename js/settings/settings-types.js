// =====================================
// RIGO AI
// SETTINGS TYPES
// ENTERPRISE ULTRA FINAL
// =====================================



// =====================================
// SETTINGS VERSION
// =====================================

const SETTINGS_VERSION =
"1.0.0";



// =====================================
// SETTINGS CONFIG
// =====================================

const SETTINGS_CONFIG =
Object.freeze({

  MAX_KEY_LENGTH:100,

  MAX_VALUE_SIZE:
  1024 * 100,

  MAX_SETTINGS_SIZE:
  1024 * 1024 * 5,

  ENABLE_ENCRYPTION:true,

  ENABLE_SYNC:true,

  ENABLE_EVENTS:true,

  ENABLE_VALIDATION:true,

  ENABLE_BACKUPS:true

});



// =====================================
// SETTINGS CATEGORIES
// =====================================

const SETTINGS_CATEGORIES =
Object.freeze({

  GENERAL:"general",

  AI:"ai",

  MEMORY:"memory",

  SEARCH:"search",

  VOICE:"voice",

  UI:"ui",

  SECURITY:"security",

  NOTIFICATIONS:"notifications",

  AGENTS:"agents",

  SYSTEM:"system",

  DEVELOPER:"developer"

});



// =====================================
// SETTINGS STATES
// =====================================

const SETTINGS_STATES =
Object.freeze({

  READY:"ready",

  LOADING:"loading",

  SAVING:"saving",

  FAILED:"failed"

});



// =====================================
// SETTINGS DEFAULTS
// =====================================

const SETTINGS_DEFAULTS =
Object.freeze({

  general:{

    language:"en",

    timezone:"auto",

    offlineMode:false

  },

  ai:{

    enabled:true,

    autoSuggestions:true,

    contextualAwareness:true

  },

  memory:{

    autoCleanup:true,

    autoSummary:true,

    semanticSearch:true

  },

  search:{

    semanticSearch:true,

    fuzzySearch:true,

    resultLimit:20

  },

  voice:{

    enabled:false,

    autoListen:false

  },

  ui:{

    theme:"dark",

    animations:true,

    compactMode:false

  },

  security:{

    encryption:true,

    integrityChecks:true,

    secureExports:true

  },

  notifications:{

    enabled:true,

    sounds:true,

    vibration:true

  },

  agents:{

    enabled:true,

    autonomousMode:false

  },

  developer:{

    debugMode:false,

    diagnostics:false

  }

});



// =====================================
// CREATE SETTINGS OBJECT
// =====================================

function createSettingsObject(){

  return deepFreeze({

    version:
    SETTINGS_VERSION,

    settings:
    cloneMemoryObject(
      SETTINGS_DEFAULTS
    ),

    createdAt:
    Date.now(),

    updatedAt:
    Date.now()

  });

}
