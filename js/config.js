// =====================================
// RIGO AI
// CONFIG
// PRODUCTION FINAL
// =====================================



// =====================================
// APP CONFIG
// =====================================

const APP_CONFIG =
deepFreeze({



  // ===================================
  // APP
  // ===================================

  APP:{

    NAME:
    "RIGO AI",

    VERSION:
    "1.0.0",

    ENVIRONMENT:
    "production"

  },



  // ===================================
  // CHAT
  // ===================================

  CHAT:{

    TITLE_LIMIT:
    30,

    AI_DELAY:
    1200,

    MAX_MESSAGE_LENGTH:
    5000,

    MAX_PENDING_MESSAGES:
    10,

    MAX_CHAT_MESSAGES:
    200,

    VALID_ROLES:[

      "user",

      "assistant",

      "system"

    ]

  },



  // ===================================
  // API
  // ===================================

  API:{

    BASE_URL:
    "",

    REQUEST_TIMEOUT:
    30000,

    MAX_RETRIES:
    2,

    RETRY_DELAY:
    1200

  },



  // ===================================
  // AI
  // ===================================

  AI:{

    DEFAULT_MODEL:
    "gpt-4.1-mini",

    TEMPERATURE:
    0.7,

    MAX_TOKENS:
    4000,

    STREAMING:
    false

  },



  // ===================================
  // STORAGE
  // ===================================

  STORAGE:{

    APP_KEY:
    "rigo-ai",

    CHAT_KEY:
    "rigo-chat-data",

    SETTINGS_KEY:
    "rigo-settings"

  },



  // ===================================
  // FEATURES
  // ===================================

  FEATURES:{

    ENABLE_AI:
    true,

    ENABLE_STORAGE:
    true,

    ENABLE_STREAMING:
    false,

    ENABLE_NOTIFICATIONS:
    false

  },



  // ===================================
  // UI
  // ===================================

  UI:{

    MESSAGE_ANIMATION_MS:
    180,

    TYPING_ANIMATION_MS:
    1000,

    AUTO_SCROLL:
    true

  }

});
