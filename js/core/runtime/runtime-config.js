// =====================================
// RIGO AI
// CONFIG RUNTIME SYSTEM
// =====================================



// =====================================
// SAFE FREEZE
// =====================================

function safeDeepFreeze(
  value,
  visited = new WeakSet()
){

  try{

    if(

      !value ||

      typeof value !==
      "object"

    ){

      return value;

    }

    if(
      visited.has(value)
    ){

      return value;

    }

    visited.add(
      value
    );

    Object.freeze(
      value
    );

    Object.values(value)
    .forEach((nestedValue) => {

      if(

        nestedValue &&

        typeof nestedValue ===
        "object"

      ){

        safeDeepFreeze(
          nestedValue,
          visited
        );

      }

    });

    return value;

  }

  catch(error){

    return value;

  }

}



// =====================================
// SAFE CLONE
// =====================================

function safeConfigClone(
  value
){

  try{

    return structuredClone(
      value
    );

  }

  catch(error){

    try{

      return JSON.parse(
        JSON.stringify(
          value
        )
      );

    }

    catch(cloneError){

      return null;

    }

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
// CONFIG EVENTS
// =====================================

const CONFIG_RUNTIME_EVENTS =
Object.freeze({

  CONFIG_UPDATED:
  "config.updated",

  CONFIG_RESET:
  "config.reset",

  CONFIG_VALIDATED:
  "config.validated"

});



// =====================================
// BASE CONFIG
// =====================================

const BASE_APP_CONFIG =
safeDeepFreeze({



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
// CONFIG STATE
// =====================================

const configRuntimeState =
Object.seal({

  initialized:false,

  runtimeOverrides:{},

  lastUpdatedAt:null,

  diagnostics:{

    updates:0,

    validations:0,

    resets:0,

    errors:0

  }

});



// =====================================
// HELPERS
// =====================================

async function emitConfigRuntimeEvent(
  eventName,
  payload = {}
){

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    return false;

  }

  try{

    await emitSystemEvent(

      eventName,

      {

        source:
        "runtime-config",

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



function mergeConfigObjects(
  target,
  source
){

  const output =
  safeConfigClone(
    target
  ) || {};

  Object.keys(
    source || {}
  )
  .forEach((key) => {

    const sourceValue =
    source[key];

    const targetValue =
    output[key];

    if(

      sourceValue &&

      typeof sourceValue ===
      "object" &&

      !Array.isArray(
        sourceValue
      )

    ){

      output[key] =
      mergeConfigObjects(

        targetValue || {},

        sourceValue

      );

    }

    else{

      output[key] =
      sourceValue;

    }

  });

  return output;

}



// =====================================
// GET CONFIG
// =====================================

function getAppConfig(){

  return {

    APP_INFO,

    CURRENT_ENVIRONMENT,

    FEATURE_FLAGS,

    PLATFORM_CAPABILITIES,

    APP_CORE_CONFIG,

    ...mergeConfigObjects(

      BASE_APP_CONFIG,

      configRuntimeState
      .runtimeOverrides

    )

  };

}



// =====================================
// GET CONFIG VALUE
// =====================================

function getConfigValue(
  path = ""
){

  try{

    const normalizedPath =
    String(path)
    .trim();

    if(!normalizedPath){

      return null;

    }

    const config =
    getAppConfig();

    return normalizedPath
    .split(".")
    .reduce((current,key) => {

      return current?.[key];

    },config);

  }

  catch(error){

    return null;

  }

}



// =====================================
// UPDATE CONFIG
// =====================================

async function updateRuntimeConfig(
  updates = {}
){

  try{

    if(

      !updates ||

      typeof updates !==
      "object"

    ){

      return false;

    }

    configRuntimeState
    .runtimeOverrides =

    mergeConfigObjects(

      configRuntimeState
      .runtimeOverrides,

      updates

    );

    configRuntimeState
    .lastUpdatedAt =
    Date.now();

    configRuntimeState
    .diagnostics
    .updates++;

    await emitConfigRuntimeEvent(

      CONFIG_RUNTIME_EVENTS
      .CONFIG_UPDATED,

      {

        updates

      }

    );

    return true;

  }

  catch(error){

    configRuntimeState
    .diagnostics
    .errors++;

    return false;

  }

}



// =====================================
// VALIDATION
// =====================================

function validateAppConfig(){

  try{

    const config =
    getAppConfig();

    if(

      !Number.isFinite(

        config
        .CHAT
        .MAX_MESSAGE_LENGTH

      )

      ||

      config
      .CHAT
      .MAX_MESSAGE_LENGTH <= 0

    ){

      return false;

    }

    if(

      !Number.isFinite(

        config
        .API
        .REQUEST_TIMEOUT

      )

      ||

      config
      .API
      .REQUEST_TIMEOUT < 1000

    ){

      return false;

    }

    if(

      !Number.isFinite(

        config
        .API
        .MAX_RETRIES

      )

      ||

      config
      .API
      .MAX_RETRIES < 0

    ){

      return false;

    }

    if(

      !Array.isArray(

        config
        .CHAT
        .VALID_ROLES

      )

      ||

      config
      .CHAT
      .VALID_ROLES
      .length <= 0

    ){

      return false;

    }

    configRuntimeState
    .diagnostics
    .validations++;

    emitConfigRuntimeEvent(

      CONFIG_RUNTIME_EVENTS
      .CONFIG_VALIDATED

    );

    return true;

  }

  catch(error){

    configRuntimeState
    .diagnostics
    .errors++;

    return false;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createConfigSnapshot(){

  return Object.freeze({

    timestamp:
    Date.now(),

    config:
    getAppConfig(),

    diagnostics:{

      ...configRuntimeState
      .diagnostics

    }

  });

}



// =====================================
// RESET
// =====================================

async function resetRuntimeConfig(){

  configRuntimeState
  .runtimeOverrides =
  {};

  configRuntimeState
  .lastUpdatedAt =
  Date.now();

  configRuntimeState
  .diagnostics
  .resets++;

  await emitConfigRuntimeEvent(

    CONFIG_RUNTIME_EVENTS
    .CONFIG_RESET

  );

  return true;

}



// =====================================
// INITIALIZE
// =====================================

function initializeConfigRuntime(){

  if(
    configRuntimeState
    .initialized
  ){

    return true;

  }

  const valid =
  validateAppConfig();

  if(!valid){

    configRuntimeState
    .diagnostics
    .errors++;

    return false;

  }

  configRuntimeState
  .initialized =
  true;

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getConfigRuntimeDiagnostics(){

  return safeConfigClone({

    initialized:

      configRuntimeState
      .initialized,

    lastUpdatedAt:

      configRuntimeState
      .lastUpdatedAt,

    diagnostics:{

      ...configRuntimeState
      .diagnostics

    }

  });

}



// =====================================
// PUBLIC API
// =====================================

const RIGORuntimeConfig =
Object.freeze({

  initialize:
  initializeConfigRuntime,

  get:
  getAppConfig,

  getValue:
  getConfigValue,

  update:
  updateRuntimeConfig,

  validate:
  validateAppConfig,

  snapshot:
  createConfigSnapshot,

  diagnostics:
  getConfigRuntimeDiagnostics,

  reset:
  resetRuntimeConfig

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis !==
  "undefined" &&

  !globalThis
  .RIGORuntimeConfig
){

  globalThis
  .RIGORuntimeConfig =

  RIGORuntimeConfig;

}



// =====================================
// DEFAULT EXPORT
// =====================================

export default
RIGORuntimeConfig;
