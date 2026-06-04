// =====================================
// RIGO AI
// SETTINGS DEFAULTS
// ENTERPRISE ULTRA FINAL
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



export {
  SETTINGS_DEFAULTS
};

export default
SETTINGS_DEFAULTS;
