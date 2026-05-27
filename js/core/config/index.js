// =====================================
// RIGO AI
// CONFIG INDEX
// CLEAN CONFIG COMPOSITION LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// CONFIG FILES
// =====================================

import "./app-config.js";
import "./config-runtime.js";



// =====================================
// INTERNAL HELPERS
// =====================================

function getGlobalConfig(
  configName
){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return null;

    }

    return window[
      configName
    ] || null;

  }

  catch(error){

    console.warn(

      `[Config] Failed resolving config: ${configName}`,

      error

    );

    return null;

  }

}



// =====================================
// CONFIG API
// =====================================

const Config =
Object.freeze({



  // ===================================
  // SAFE ACCESSORS
  // ===================================

  get Info(){

    return getGlobalConfig(
      "APP_INFO"
    );

  },



  get Environment(){

    return getGlobalConfig(
      "CURRENT_ENVIRONMENT"
    );

  },



  get Debug(){

    return getGlobalConfig(
      "DEBUG_MODE"
    );

  },



  get Features(){

    return getGlobalConfig(
      "FEATURE_FLAGS"
    );

  },



  get Platform(){

    return getGlobalConfig(
      "PLATFORM_CAPABILITIES"
    );

  },



  get Core(){

    return getGlobalConfig(
      "APP_CORE_CONFIG"
    );

  },



  get Runtime(){

    return getGlobalConfig(
      "ConfigRuntime"
    );

  }

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "Config",

    {

      value:
      Config,

      writable:
      false,

      configurable:
      false

    }

  );

}
