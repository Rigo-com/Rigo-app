// =====================================
// RIGO AI
// MODULES INDEX
// =====================================



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  // ===================================
  // CONSTANTS
  // ===================================

  window.MODULE_LOADER_CONFIG =
  MODULE_LOADER_CONFIG;

  window.MODULE_STATES =
  MODULE_STATES;

  window.MODULE_EVENTS =
  MODULE_EVENTS;



  // ===================================
  // STATE
  // ===================================

  window.moduleLoaderState =
  moduleLoaderState;



  // ===================================
  // REGISTRY
  // ===================================

  window.registerModule =
  registerModule;

  window.normalizeModuleName =
  normalizeModuleName;



  // ===================================
  // ACTIVATION
  // ===================================

  window.loadModule =
  loadModule;

  window.unloadModule =
  unloadModule;

  window.activateModule =
  activateModule;

  window.loadModuleDependencies =
  loadModuleDependencies;

  window.detectModuleCircularDependency =
  detectModuleCircularDependency;



  // ===================================
  // HEALTH
  // ===================================

  window.getModuleHealth =
  getModuleHealth;

  window.resetModuleLoader =
  resetModuleLoader;

  window.initializeModuleLoader =
  initializeModuleLoader;

  window.createModuleLoaderSnapshot =
  createModuleLoaderSnapshot;

  window.calculateModuleHealthScore =
  calculateModuleHealthScore;



  // ===================================
  // PUBLIC API
  // ===================================

  window.ModuleLoader =
  ModuleLoader;

}
