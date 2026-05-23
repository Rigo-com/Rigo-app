// =====================================
// RIGO AI
// CORE CONFIG INDEX
// =====================================



const ConfigAPI =
Object.freeze({

  info:
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
  ConfigRuntime,

  runtimeState:
  configRuntimeState,

  get:
  getConfigValue,

  update:
  updateRuntimeConfig,

  updateFeature:
  updateFeatureFlag,

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
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.ConfigAPI =
  ConfigAPI;

}
