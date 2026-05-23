// =====================================
// RIGO AI
// CORE CONFIG INDEX
// =====================================



const ConfigAPI =
Object.freeze({

  app:
  APP_INFO,

  environment:
  CURRENT_ENVIRONMENT,

  debug:
  DEBUG_MODE,

  features:
  FEATURE_FLAGS,

  platform:
  PLATFORM_CAPABILITIES,

  core:
  APP_CORE_CONFIG,

  runtime:
  configRuntimeState,

  get:
  getConfigValue,

  set:
  setConfigValue,

  has:
  hasConfigValue,

  reset:
  resetRuntimeConfig

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.ConfigAPI =
  ConfigAPI;

}
