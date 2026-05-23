// =====================================
// STORAGE CONFIG
// =====================================

const STORAGE_RUNTIME_CONFIG =
Object.freeze({

  MAX_STORAGE_SIZE:
  5 * 1024 * 1024,

  WRITE_DEBOUNCE_MS:
  120,

  MAX_CACHE_CHATS:
  200

});



// =====================================
// STORAGE KEYS
// =====================================

const STORAGE_KEYS =
Object.freeze({

  CHATS:
  APP_CONFIG
  ?.STORAGE
  ?.CHAT_KEY ||

  "rigo-ai:v1:chat-data",

  MEMORY:
  APP_CONFIG
  ?.STORAGE
  ?.APP_KEY ||

  "rigo-ai:v1:memory",

  SETTINGS:
  APP_CONFIG
  ?.STORAGE
  ?.SETTINGS_KEY ||

  "rigo-ai:v1:settings",

  VERSION:
  "rigo-ai:v1:version"

});
