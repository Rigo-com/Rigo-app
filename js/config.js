// =====================================
// SAFE DEEP FREEZE
// =====================================

function safeDeepFreeze(
  value
){

  try{

    if(
      typeof deepFreeze ===
      "function"
    ){

      return deepFreeze(
        value
      );

    }

    return Object.freeze(
      value
    );

  }

  catch(error){

    return value;

  }

}



// =====================================
// ENVIRONMENT DETECTION
// =====================================

function detectEnvironment(){

  try{

    if(
      typeof location ===
      "undefined"
    ){

      return "production";

    }

    const hostname =
    String(
      location.hostname || ""
    )
    .toLowerCase();

    const isDevelopment =

      hostname ===
      "localhost"

      ||

      hostname ===
      "127.0.0.1"

      ||

      hostname.endsWith(
        ".local"
      );

    return (

      isDevelopment

      ?

      "development"

      :

      "production"

    );

  }

  catch(error){

    return "production";

  }

}



// =====================================
// SHARED CONSTANTS
// =====================================

const SHARED_TIMEOUT =
30000;

const SHARED_RETRIES =
2;

const SHARED_RETRY_DELAY =
1200;

const STORAGE_NAMESPACE =
"rigo-ai:v1";



// =====================================
// APP CONFIG
// =====================================

const APP_CONFIG =
safeDeepFreeze({



  // ===================================
  // APP
  // ===================================

  APP:{

    NAME:
    "RIGO AI",

    VERSION:
    "1.0.0",

    ENVIRONMENT:
    detectEnvironment()

  },



  // ===================================
  // CHAT
  // ===================================

  CHAT:{

    TITLE_LIMIT:
    30,

    AI_DELAY:
    1200,

    MESSAGE_TIMEOUT:
    SHARED_TIMEOUT,

    MAX_MESSAGE_LENGTH:
    5000,

    MAX_PENDING_MESSAGES:
    10,

    MAX_CHAT_MESSAGES:
    200,

    VALID_ROLES:
    safeDeepFreeze([

      "user",

      "assistant",

      "system"

    ])

  },



  // ===================================
  // API
  // ===================================

  API:{

    BASE_URL:
    "",

    REQUEST_TIMEOUT:
    SHARED_TIMEOUT,

    MAX_RETRIES:
    SHARED_RETRIES,

    RETRY_DELAY:
    SHARED_RETRY_DELAY

  },



  // ===================================
  // AI
  // ===================================

  AI:{

    DEFAULT_MODEL:
    "gpt-4.1-mini",

    TEMPERATURE:
    0.7,

    MAX_RESPONSE_CHARS:
    4000,

    STREAMING:
    false

  },



  // ===================================
  // STORAGE
  // ===================================

  STORAGE:{

    APP_KEY:

    STORAGE_NAMESPACE +

    ":app",

    CHAT_KEY:

    STORAGE_NAMESPACE +

    ":chat-data",

    SETTINGS_KEY:

    STORAGE_NAMESPACE +

    ":settings",

    AUTH_KEY:

    STORAGE_NAMESPACE +

    ":auth-session"

  },



  // ===================================
  // FEATURES
  // ===================================

  FEATURES:{

    ENABLE_AI:
    true,

    ENABLE_AUTH:
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

    LOADING_FADE_DURATION:
    300,

    AUTO_SCROLL:
    true

  }

});



// =====================================
// CONFIG VALIDATION
// =====================================

function validateAppConfig(){

  try{

    const validEnvironment =

      [

        "development",

        "production"

      ]

      .includes(

        APP_CONFIG
        .APP
        .ENVIRONMENT

      );

    if(
      !validEnvironment
    ){

      return false;

    }

    if(

      !Number.isFinite(

        APP_CONFIG
        .CHAT
        .MAX_MESSAGE_LENGTH

      )

      ||

      APP_CONFIG
      .CHAT
      .MAX_MESSAGE_LENGTH <= 0

    ){

      return false;

    }

    if(

      !Number.isFinite(

        APP_CONFIG
        .API
        .REQUEST_TIMEOUT

      )

      ||

      APP_CONFIG
      .API
      .REQUEST_TIMEOUT < 1000

    ){

      return false;

    }

    if(

      !Number.isFinite(

        APP_CONFIG
        .API
        .MAX_RETRIES

      )

      ||

      APP_CONFIG
      .API
      .MAX_RETRIES < 0

    ){

      return false;

    }

    if(

      !Array.isArray(

        APP_CONFIG
        .CHAT
        .VALID_ROLES

      )

      ||

      APP_CONFIG
      .CHAT
      .VALID_ROLES
      .length <= 0

    ){

      return false;

    }

    return true;

  }

  catch(error){

    return false;

  }

}
