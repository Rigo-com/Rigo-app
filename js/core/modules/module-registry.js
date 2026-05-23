// =====================================
// RIGO AI
// MODULE REGISTRY
// =====================================



// =====================================
// MODULE STATE
// =====================================

const moduleLoaderState =
Object.seal({

  initialized:false,

  modules:
  new Map(),

  instances:
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
// CREATE MODULE DEFINITION
// =====================================

function createModuleDefinition(
  normalizedName,
  factory,
  options = {}
){

  return {

    // ================================
    // IMMUTABLE
    // ================================

    metadata:
    freezeModuleObject({

      name:
      normalizedName,

      dependencies:

        Array.isArray(
          options.dependencies
        )

        ? options.dependencies

        : [],

      lazy:

        options.lazy !==
        false,

      createdAt:
      Date.now()

    }),



    // ================================
    // MUTABLE
    // ================================

    factory,

    retries:0,

    state:
    MODULE_STATES
    .REGISTERED

  };

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

  if(

    moduleLoaderState
    .modules
    .has(
      normalizedName
    )

  ){

    return false;

  }

  const moduleDefinition =
  createModuleDefinition(

    normalizedName,

    factory,

    options

  );

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
    .metadata
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
