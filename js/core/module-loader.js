// =====================================
// RIGO AI
// MODULE LOADER
// ENTERPRISE RUNTIME FINAL
// =====================================



// =====================================
// MODULE CONFIG
// =====================================

const MODULE_LOADER_CONFIG =
Object.freeze({

  ENABLE_LAZY_LOADING:true,

  ENABLE_HEALTH_CHECKS:true,

  ENABLE_RETRY_LOADING:true,

  ENABLE_DEPENDENCY_GRAPH:true,

  ENABLE_FAILURE_ISOLATION:true,

  ENABLE_DIAGNOSTICS:true,

  MAX_MODULES:
  1000,

  MAX_RETRIES:
  3,

  MAX_BOOT_DEPTH:
  50

});



// =====================================
// MODULE STATES
// =====================================

const MODULE_STATES =
Object.freeze({

  REGISTERED:"registered",

  LOADING:"loading",

  ACTIVE:"active",

  FAILED:"failed",

  DISABLED:"disabled"

});



// =====================================
// MODULE EVENTS
// =====================================

const MODULE_EVENTS =
Object.freeze({

  REGISTERED:
  "module.registered",

  LOADED:
  "module.loaded",

  ACTIVATED:
  "module.activated",

  FAILED:
  "module.failed",

  UNLOADED:
  "module.unloaded"

});



// =====================================
// MODULE STATE
// =====================================

const moduleLoaderState =
Object.seal({

  initialized:false,

  modules:
  new Map(),

  activeModules:
  new Set(),

  failedModules:
  new Set(),

  dependencyGraph:
  new Map(),

  loadingStack:[],

  diagnostics:{

    registered:0,

    loaded:0,

    activated:0,

    failed:0,

    retries:0

  },

  lastLoadedAt:null

});



// =====================================
// HELPERS
// =====================================

function normalizeModuleName(
  moduleName
){

  return String(
    moduleName || ""
  )
  .trim()
  .toLowerCase();

}



function isValidModuleFactory(
  factory
){

  return (
    typeof factory ===
    "function"
  );

}



function freezeModuleObject(
  value,
  visited = new WeakSet()
){

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

      freezeModuleObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// REGISTER MODULE
// =====================================

async function registerModule(
  moduleName,
  factory,
  options = {}
){

  const normalizedName =
  normalizeModuleName(
    moduleName
  );

  if(!normalizedName){

    return false;

  }

  if(
    !isValidModuleFactory(
      factory
    )
  ){

    return false;

  }

  if(

    moduleLoaderState
    .modules
    .size >=

    MODULE_LOADER_CONFIG
    .MAX_MODULES

  ){

    return false;

  }

  const moduleDefinition =
  freezeModuleObject({

    name:
    normalizedName,

    factory,

    dependencies:

      Array.isArray(
        options.dependencies
      )

      ? options.dependencies

      : [],

    lazy:

      options.lazy !==
      false,

    retries:0,

    state:
    MODULE_STATES
    .REGISTERED,

    createdAt:
    Date.now()

  });

  moduleLoaderState
  .modules
  .set(

    normalizedName,

    moduleDefinition

  );

  moduleLoaderState
  .dependencyGraph
  .set(

    normalizedName,

    moduleDefinition
    .dependencies

  );

  moduleLoaderState
  .diagnostics
  .registered++;

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(

      MODULE_EVENTS
      .REGISTERED,

      {

        module:
        normalizedName

      }

    );

  }

  return true;

}



// =====================================
// CIRCULAR CHECK
// =====================================

function detectModuleCircularDependency(
  moduleName
){

  return (

    moduleLoaderState
    .loadingStack
    .includes(
      moduleName
    )

  );

}



// =====================================
// LOAD DEPENDENCIES
// =====================================

async function loadModuleDependencies(
  dependencies = []
){

  for(
    const dependency
    of dependencies
  ){

    const loaded =
    await loadModule(
      dependency
    );

    if(!loaded){

      return false;

    }

  }

  return true;

}



// =====================================
// ACTIVATE MODULE
// =====================================

async function activateModule(
  moduleDefinition
){

  try{

    const moduleInstance =
    await moduleDefinition
    .factory({

      container:
      DependencyContainer,

      state:
      StateManager,

      diagnostics:
      diagnosticsState,

      events:
      SystemEvents

    });

    moduleLoaderState
    .activeModules
    .add(
      moduleDefinition
      .name
    );

    moduleLoaderState
    .diagnostics
    .activated++;

    return moduleInstance;

  }

  catch(error){

    moduleLoaderState
    .failedModules
    .add(
      moduleDefinition
      .name
    );

    moduleLoaderState
    .diagnostics
    .failed++;

    if(
      typeof logDiagnosticError ===
      "function"
    ){

      logDiagnosticError(

        "MODULE ACTIVATION FAILED",

        {

          module:
          moduleDefinition
          .name,

          error:
          String(error)

        }

      );

    }

    return null;

  }

}



// =====================================
// LOAD MODULE
// =====================================

async function loadModule(
  moduleName
){

  const normalizedName =
  normalizeModuleName(
    moduleName
  );

  if(!normalizedName){

    return false;

  }

  if(

    moduleLoaderState
    .loadingStack
    .length >

    MODULE_LOADER_CONFIG
    .MAX_BOOT_DEPTH

  ){

    return false;

  }

  if(

    detectModuleCircularDependency(
      normalizedName
    )

  ){

    return false;

  }

  const moduleDefinition =

    moduleLoaderState
    .modules
    .get(
      normalizedName
    );

  if(!moduleDefinition){

    return false;

  }

  if(

    moduleLoaderState
    .activeModules
    .has(
      normalizedName
    )

  ){

    return true;

  }

  moduleLoaderState
  .loadingStack
  .push(
    normalizedName
  );

  try{

    moduleDefinition.state =
    MODULE_STATES
    .LOADING;



    // ================================
    // LOAD DEPENDENCIES
    // ================================

    const dependenciesLoaded =
    await loadModuleDependencies(

      moduleDefinition
      .dependencies

    );

    if(!dependenciesLoaded){

      throw new Error(
        "DEPENDENCY LOAD FAILED"
      );

    }



    // ================================
    // ACTIVATE
    // ================================

    const activated =
    await activateModule(
      moduleDefinition
    );

    if(!activated){

      throw new Error(
        "MODULE ACTIVATION FAILED"
      );

    }

    moduleDefinition.state =
    MODULE_STATES
    .ACTIVE;

    moduleLoaderState
    .diagnostics
    .loaded++;

    moduleLoaderState
    .lastLoadedAt =
    Date.now();

    if(
      typeof emitSystemEvent ===
      "function"
    ){

      await emitSystemEvent(

        MODULE_EVENTS
        .LOADED,

        {

          module:
          normalizedName

        }

      );

    }

    return true;

  }

  catch(error){

    moduleDefinition.retries++;

    moduleDefinition.state =
    MODULE_STATES
    .FAILED;

    moduleLoaderState
    .failedModules
    .add(
      normalizedName
    );

    if(

      MODULE_LOADER_CONFIG
      .ENABLE_RETRY_LOADING &&

      moduleDefinition.retries <

      MODULE_LOADER_CONFIG
      .MAX_RETRIES

    ){

      moduleLoaderState
      .diagnostics
      .retries++;

      return loadModule(
        normalizedName
      );

    }

    if(
      typeof emitSystemEvent ===
      "function"
    ){

      await emitSystemEvent(

        MODULE_EVENTS
        .FAILED,

        {

          module:
          normalizedName,

          error:
          String(error)

        }

      );

    }

    return false;

  }

  finally{

    moduleLoaderState
    .loadingStack =

    moduleLoaderState
    .loadingStack
    .filter((item) => {

      return (
        item !==
        normalizedName
      );

    });

  }

}



// =====================================
// UNLOAD MODULE
// =====================================

async function unloadModule(
  moduleName
){

  const normalizedName =
  normalizeModuleName(
    moduleName
  );

  if(!normalizedName){

    return false;

  }

  if(

    !moduleLoaderState
    .modules
    .has(
      normalizedName
    )

  ){

    return false;

  }

  moduleLoaderState
  .activeModules
  .delete(
    normalizedName
  );

  moduleLoaderState
  .failedModules
  .delete(
    normalizedName
  );

  const moduleDefinition =

    moduleLoaderState
    .modules
    .get(
      normalizedName
    );

  moduleDefinition.state =
  MODULE_STATES
  .DISABLED;

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(

      MODULE_EVENTS
      .UNLOADED,

      {

        module:
        normalizedName

      }

    );

  }

  return true;

}



// =====================================
// HEALTH CHECK
// =====================================

function getModuleHealth(){

  return freezeModuleObject({

    totalModules:

      moduleLoaderState
      .modules
      .size,

    activeModules:

      moduleLoaderState
      .activeModules
      .size,

    failedModules:

      moduleLoaderState
      .failedModules
      .size,

    diagnostics:

      moduleLoaderState
      .diagnostics,

    lastLoadedAt:

      moduleLoaderState
      .lastLoadedAt

  });

}



// =====================================
// RESET
// =====================================

async function resetModuleLoader(){

  moduleLoaderState
  .modules
  .clear();

  moduleLoaderState
  .activeModules
  .clear();

  moduleLoaderState
  .failedModules
  .clear();

  moduleLoaderState
  .dependencyGraph
  .clear();

  moduleLoaderState
  .loadingStack = [];

  moduleLoaderState
  .diagnostics = {

    registered:0,

    loaded:0,

    activated:0,

    failed:0,

    retries:0

  };

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initializeModuleLoader(){

  if(
    moduleLoaderState
    .initialized
  ){

    return true;

  }

  moduleLoaderState
  .initialized =
  true;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const ModuleLoader =
Object.freeze({

  initialize:
  initializeModuleLoader,

  register:
  registerModule,

  load:
  loadModule,

  unload:
  unloadModule,

  reset:
  resetModuleLoader,

  health:
  getModuleHealth

});
