// =====================================
// RIGO AI
// STORAGE CONFIG
// ENTERPRISE STORAGE FOUNDATION
// =====================================



// =====================================
// STORAGE CONFIG
// =====================================

const STORAGE_RUNTIME_CONFIG =
Object.freeze({

  VERSION:
  "1.0.0",



  // ================================
  // STORAGE LIMITS
  // ================================

  MAX_STORAGE_SIZE:
  5 * 1024 * 1024,

  MAX_CACHE_CHATS:
  200,



  // ================================
  // PERFORMANCE
  // ================================

  WRITE_DEBOUNCE_MS:
  120,



  // ================================
  // FEATURES
  // ================================

  ENABLE_ENCRYPTION:false,

  ENABLE_COMPRESSION:false,

  ENABLE_CACHE:true,

  ENABLE_RECOVERY:true,

  ENABLE_DIAGNOSTICS:true

});



// =====================================
// SAFE APP CONFIG ACCESS
// =====================================

function getStorageConfigValue(
  key,
  fallback
){

  try{

    if(

      typeof APP_CONFIG ===
      "undefined"

      ||

      !APP_CONFIG

      ||

      typeof APP_CONFIG !==
      "object"

    ){

      return fallback;

    }

    const storageConfig =
    APP_CONFIG.STORAGE;

    if(

      !storageConfig ||

      typeof storageConfig !==
      "object"

    ){

      return fallback;

    }

    const value =
    storageConfig[key];

    if(
      typeof value !==
      "string"
    ){

      return fallback;

    }

    const normalized =
    value.trim();

    return (
      normalized ||
      fallback
    );

  }

  catch(error){

    return fallback;

  }

}



// =====================================
// STORAGE KEYS
// =====================================

const STORAGE_KEYS =
Object.freeze({

  CHATS:
  getStorageConfigValue(

    "CHAT_KEY",

    "rigo-ai:v1:chat-data"

  ),



  MEMORY:
  getStorageConfigValue(

    "APP_KEY",

    "rigo-ai:v1:memory"

  ),



  SETTINGS:
  getStorageConfigValue(

    "SETTINGS_KEY",

    "rigo-ai:v1:settings"

  ),



  VERSION:
  getStorageConfigValue(

    "VERSION_KEY",

    "rigo-ai:v1:version"

  )

});



// =====================================
// STORAGE NAMESPACES
// =====================================

const STORAGE_NAMESPACES =
Object.freeze({

  CHAT:"chat",

  MEMORY:"memory",

  SETTINGS:"settings",

  CACHE:"cache",

  RUNTIME:"runtime"

});
