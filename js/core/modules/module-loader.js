// =====================================
// RIGO AI
// MODULE LOADER
// PUBLIC FACADE LAYER
// =====================================



// =====================================
// HELPERS
// =====================================

function normalizeModuleLoaderError(
  error
){

  if(
    typeof getSafeErrorMessage ===
    "function"
  ){

    return getSafeErrorMessage(
      error
    );

  }

  return String(
    error || "UNKNOWN ERROR"
  );

}



function isFunction(
  value
){

  return typeof value ===
  "function";

}



// =====================================
// SAFE FREEZE
// =====================================

function safeFreeze(
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

  if(

    value instanceof Promise ||

    value instanceof Date ||

    value instanceof RegExp ||

    value instanceof Map ||

    value instanceof Set ||

    (
      typeof HTMLElement !==
      "undefined" &&

      value instanceof HTMLElement
    )

  ){

    return value;

  }

  visited.add(value);

  Object.freeze(value);

  Object.values(value)
  .forEach((nestedValue) => {

    if(

      nestedValue &&

      typeof nestedValue ===
      "object"

    ){

      safeFreeze(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// SAFE EXECUTOR
// =====================================

async function safelyExecuteModuleOperation(
  label,
  operation,
  fallback = null
){

  try{

    if(
      !isFunction(operation)
    ){

      return fallback;

    }

    return await operation();

  }

  catch(error){

    console.error(

      `[ModuleLoader] ${label} failed:`,

      normalizeModuleLoaderError(
        error
      )

    );

    return fallback;

  }

}



// =====================================
// SNAPSHOT (READ ONLY)
// =====================================

async function createModuleLoaderPublicSnapshot(){

  return safelyExecuteModuleOperation(

    "Snapshot",

    async() => {

      if(

        typeof ModuleRegistry ===
        "undefined" ||

        !isFunction(
          ModuleRegistry.snapshot
        )

      ){

        return null;

      }

      return safeFreeze(
        ModuleRegistry
        .snapshot()
      );

    },

    null

  );

}



// =====================================
// RECOVERY
// =====================================

async function recoverModule(
  moduleName
){

  return safelyExecuteModuleOperation(

    "Recover module",

    async() => {

      const normalizedName =
      normalizeModuleName(
        moduleName
      );

      if(
        !normalizedName
      ){

        return false;

      }

      if(
        !isFunction(
          recoverModuleRuntime
        )
      ){

        return false;

      }

      return await recoverModuleRuntime(
        normalizedName
      );

    },

    false

  );

}



// =====================================
// INSTANCE ACCESS
// =====================================

function getModuleLoaderInstance(
  moduleName
){

  return safelyExecuteModuleOperation(

    "Get module instance",

    () => {

      const normalizedName =
      normalizeModuleName(
        moduleName
      );

      if(
        !normalizedName
      ){

        return null;

      }

      if(

        typeof ModuleRegistry ===
        "undefined" ||

        !isFunction(
          ModuleRegistry
          .getModuleInstance
        )

      ){

        return null;

      }

      return ModuleRegistry
      .getModuleInstance(
        normalizedName
      );

    },

    null

  );

}



// =====================================
// MODULE STATUS
// =====================================

function getModuleStatus(
  moduleName
){

  return safelyExecuteModuleOperation(

    "Get module status",

    () => {

      if(

        typeof ModuleRegistry ===
        "undefined"

      ){

        return null;

      }

      if(

        !isFunction(
          ModuleRegistry
          .getRegisteredModule
        ) ||

        !isFunction(
          ModuleRegistry
          .getModuleRuntimeState
        )

      ){

        return null;

      }

      const normalizedName =
      normalizeModuleName(
        moduleName
      );

      const definition =
      ModuleRegistry
      .getRegisteredModule(
        normalizedName
      );

      const runtime =
      ModuleRegistry
      .getModuleRuntimeState(
        normalizedName
      );

      if(
        !definition ||
        !runtime
      ){

        return null;

      }

      return safeFreeze({

        name:
        definition
        .metadata
        .name,

        state:
        runtime
        .state,

        retries:
        runtime
        .retries,

        dependencies:
        definition
        .metadata
        .dependencies,

        lifecycle:
        definition
        .metadata
        .lifecycle,

        priority:
        definition
        .metadata
        .priority,

        lazy:
        definition
        .metadata
        .lazy,

        createdAt:
        definition
        .metadata
        .createdAt,

        activatedAt:
        runtime
        .activatedAt,

        failedAt:
        runtime
        .failedAt,

        recoveredAt:
        runtime
        .recoveredAt,

        active:

          runtime.state ===
          MODULE_STATES
          .ACTIVE,

        failed:

          runtime.state ===
          MODULE_STATES
          .FAILED

      });

    },

    null

  );

}



// =====================================
// REGISTRY ACCESS
// =====================================

function getModuleRegistrySnapshot(){

  return safelyExecuteModuleOperation(

    "Registry snapshot",

    () => {

      if(

        typeof ModuleRegistry ===
        "undefined" ||

        !isFunction(
          ModuleRegistry.snapshot
        )

      ){

        return null;

      }

      return safeFreeze(
        ModuleRegistry
        .snapshot()
      );

    },

    null

  );

}



function getModuleRegistryDiagnostics(){

  return safelyExecuteModuleOperation(

    "Registry diagnostics",

    () => {

      if(

        typeof ModuleRegistry ===
        "undefined" ||

        !isFunction(
          ModuleRegistry
          .diagnostics
        )

      ){

        return null;

      }

      return safeFreeze(
        ModuleRegistry
        .diagnostics()
      );

    },

    null

  );

}



// =====================================
// SAFE WRAPPERS
// =====================================

async function safeInitializeModuleLoader(){

  return safelyExecuteModuleOperation(

    "Initialize loader",

    async() => {

      if(
        !isFunction(
          initializeModuleLoader
        )
      ){

        return false;

      }

      return await initializeModuleLoader();

    },

    false

  );

}



async function safeRegisterModule(
  ...args
){

  return safelyExecuteModuleOperation(

    "Register module",

    async() => {

      if(
        !isFunction(
          registerModule
        )
      ){

        return false;

      }

      return await registerModule(
        ...args
      );

    },

    false

  );

}



async function safeUnregisterModule(
  moduleName
){

  return safelyExecuteModuleOperation(

    "Unregister module",

    async() => {

      if(

        typeof ModuleRegistry ===
        "undefined" ||

        !isFunction(
          ModuleRegistry
          .unregisterModuleDefinition
        )

      ){

        return false;

      }

      return ModuleRegistry
      .unregisterModuleDefinition(
        moduleName
      );

    },

    false

  );

}



async function safeLoadModule(
  ...args
){

  return safelyExecuteModuleOperation(

    "Load module",

    async() => {

      if(
        !isFunction(
          loadModule
        )
      ){

        return false;

      }

      return await loadModule(
        ...args
      );

    },

    false

  );

}



async function safeUnloadModule(
  ...args
){

  return safelyExecuteModuleOperation(

    "Unload module",

    async() => {

      if(
        !isFunction(
          unloadModule
        )
      ){

        return false;

      }

      return await unloadModule(
        ...args
      );

    },

    false

  );

}



async function safeResetModuleLoader(){

  return safelyExecuteModuleOperation(

    "Reset loader",

    async() => {

      if(
        !isFunction(
          resetModuleLoader
        )
      ){

        return false;

      }

      return await resetModuleLoader();

    },

    false

  );

}



// =====================================
// LOOKUP HELPERS
// =====================================

function hasModule(
  moduleName
){

  return safelyExecuteModuleOperation(

    "Has module",

    () => {

      if(

        typeof ModuleRegistry ===
        "undefined" ||

        !isFunction(
          ModuleRegistry
          .hasRegisteredModule
        )

      ){

        return false;

      }

      return ModuleRegistry
      .hasRegisteredModule(
        moduleName
      );

    },

    false

  );

}



function listModules(){

  return safelyExecuteModuleOperation(

    "List modules",

    () => {

      if(

        typeof ModuleRegistry ===
        "undefined" ||

        !isFunction(
          ModuleRegistry
          .getRegisteredModules
        )

      ){

        return [];

      }

      return safeFreeze(

        ModuleRegistry
        .getRegisteredModules()

      );

    },

    []

  );

}



// =====================================
// PUBLIC API
// =====================================

const ModuleLoader =
Object.freeze({



  // ===================================
  // CORE
  // ===================================

  initialize:
  safeInitializeModuleLoader,

  register:
  safeRegisterModule,

  unregister:
  safeUnregisterModule,

  load:
  safeLoadModule,

  unload:
  safeUnloadModule,

  reset:
  safeResetModuleLoader,



  // ===================================
  // LOOKUP
  // ===================================

  has:
  hasModule,

  list:
  listModules,

  instance:
  getModuleLoaderInstance,

  status:
  getModuleStatus,



  // ===================================
  // REGISTRY
  // ===================================

  registry:
  getModuleRegistrySnapshot,

  diagnostics:
  getModuleRegistryDiagnostics,



  // ===================================
  // HEALTH
  // ===================================

  health:

    typeof getModuleHealth ===
    "function"

    ?

    getModuleHealth

    :

    () => null,



  // ===================================
  // RECOVERY
  // ===================================

  recover:
  recoverModule,



  // ===================================
  // SNAPSHOT
  // ===================================

  snapshot:
  createModuleLoaderPublicSnapshot

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

    "ModuleLoader",

    {

      value:
      ModuleLoader,

      writable:false,

      configurable:false

    }

  );

}
