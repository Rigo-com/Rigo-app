// =====================================
// RIGO AI
// CONFIG INDEX
// CLEAN CONFIG COMPOSITION LAYER
// =====================================



// =====================================
// CONFIG FILES
// =====================================

import "./app-config.js";
import "./config-runtime.js";



// =====================================
// CONFIG API
// =====================================

const Config =
Object.freeze({

  Info:
  APP_INFO,

  Environment:
  CURRENT_ENVIRONMENT,

  Debug:
  DEBUG_MODE,

  Features:
  FEATURE_FLAGS,

  Platform:
  PLATFORM_CAPABILITIES,

  Core:
  APP_CORE_CONFIG,

  Runtime:
  ConfigRuntime

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
