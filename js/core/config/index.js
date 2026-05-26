// =====================================
// RIGO AI
// CONFIG INDEX
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



if(
  typeof window !==
  "undefined"
){

  window.Config =
  Config;

}
