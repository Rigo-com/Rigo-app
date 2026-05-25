// =====================================
// RIGO AI
// CORE CONFIG INDEX
// SAFE CONFIGURATION COMPOSITION LAYER
// =====================================



// =====================================
// HELPERS
// =====================================

function getConfigDependency(
  dependencyName
){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return null;

    }

    const dependency =
      window[dependencyName];

    if(
      typeof dependency ===
      "undefined"
    ){

      console.warn(
        `[ConfigAPI] Missing dependency: ${dependencyName}`
      );

      return null;

    }

    return dependency;

  }

  catch(error){

    console.warn(
      `[ConfigAPI] Failed resolving dependency: ${dependencyName}`,
      error
    );

    return null;

  }

}



function isFunction(value){

  return typeof value === "function";

}



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

    value instanceof Map ||
    value instanceof Set ||
    value instanceof Date ||
    value instanceof RegExp

  ){

    return value;

  }

  visited.add(value);

  Object.freeze(value);

  Object.values(value).forEach((nestedValue) => {

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



function safelyExecuteConfigOperation(
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

    return operation();

  }

  catch(error){

    console.warn(
      `[ConfigAPI] ${label} failed`,
      error
    );

    return fallback;

  }

}



// =====================================
// CONFIG API
// =====================================

const ConfigAPI =
safeFreeze({



  // ===================================
  // STATIC CONFIG
  // ===================================

  info:
  getConfigDependency(
    "APP_INFO"
  ),

  environment:
  getConfigDependency(
    "CURRENT_ENVIRONMENT"
  ),

  debug:
  getConfigDependency(
    "DEBUG_MODE"
  ),

  features:
  getConfigDependency(
    "FEATURE_FLAGS"
  ),

  platform:
  getConfigDependency(
    "PLATFORM_CAPABILITIES"
  ),

  core:
  getConfigDependency(
    "APP_CORE_CONFIG"
  ),



  // ===================================
  // RUNTIME
  // ===================================

  runtime:
  safeFreeze({

    snapshot:
    safelyExecuteConfigOperation(

      "Runtime snapshot",

      getConfigDependency(
        "createConfigSnapshot"
      )

    ),

    diagnostics:
    safelyExecuteConfigOperation(

      "Runtime diagnostics",

      getConfigDependency(
        "getConfigRuntimeDiagnostics"
      )

    )

  }),



  // ===================================
  // HELPERS
  // ===================================

  get(key){

    return safelyExecuteConfigOperation(

      "Get config value",

      () => {

        const getter =
          getConfigDependency(
            "getConfigValue"
          );

        return getter
          ? getter(key)
          : null;

      }

    );

  },



  update(key, value){

    return safelyExecuteConfigOperation(

      "Update runtime config",

      () => {

        const updater =
          getConfigDependency(
            "updateRuntimeConfig"
          );

        return updater
          ? updater(key, value)
          : false;

      },

      false

    );

  },



  updateFeature(
    featureName,
    enabled
  ){

    return safelyExecuteConfigOperation(

      "Update feature flag",

      () => {

        const updater =
          getConfigDependency(
            "updateFeatureFlag"
          );

        return updater
          ? updater(
              featureName,
              enabled
            )
          : false;

      },

      false

    );

  },



  validate(){

    return safelyExecuteConfigOperation(

      "Validate config",

      getConfigDependency(
        "validateAppConfig"
      ),

      false

    );

  },



  snapshot(){

    return safelyExecuteConfigOperation(

      "Create config snapshot",

      getConfigDependency(
        "createConfigSnapshot"
      ),

      null

    );

  },



  diagnostics(){

    return safelyExecuteConfigOperation(

      "Get diagnostics",

      getConfigDependency(
        "getConfigRuntimeDiagnostics"
      ),

      null

    );

  },



  reset(){

    return safelyExecuteConfigOperation(

      "Reset runtime config",

      getConfigDependency(
        "resetRuntimeConfig"
      ),

      false

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

    "ConfigAPI",

    {

      value:
      ConfigAPI,

      writable:
      false,

      configurable:
      false

    }

  );

}
