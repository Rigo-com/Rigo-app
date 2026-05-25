// =====================================
// RIGO AI
// DEPENDENCIES INDEX
// SAFE DEPENDENCY COMPOSITION LAYER
// =====================================



// =====================================
// HELPERS
// =====================================

function getDependencyAPI(
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
        `[DependenciesAPI] Missing dependency: ${dependencyName}`
      );

      return null;

    }

    return dependency;

  }

  catch(error){

    console.warn(
      `[DependenciesAPI] Failed resolving dependency: ${dependencyName}`,
      error
    );

    return null;

  }

}



function isFunction(value){

  return typeof value ===
  "function";

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



async function safelyExecuteDependencyOperation(
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

    console.warn(
      `[DependenciesAPI] ${label} failed`,
      error
    );

    return fallback;

  }

}



// =====================================
// READONLY SYSTEM ACCESS
// =====================================

function getReadonlyDependencySystem(){

  return safelyExecuteDependencyOperation(

    "Readonly dependency system",

    async() => {

      const system =
        getDependencyAPI(
          "DependencySystem"
        );

      if(!system){
        return null;
      }

      if(
        isFunction(system.snapshot)
      ){

        return safeFreeze(
          await system.snapshot()
        );

      }

      return safeFreeze(
        system
      );

    },

    null

  );

}



// =====================================
// DEPENDENCIES API
// =====================================

const DependenciesAPI =
safeFreeze({



  // ===================================
  // SYSTEM
  // ===================================

  system(){

    return getReadonlyDependencySystem();

  },



  // ===================================
  // REGISTRY
  // ===================================

  registry:{

    register:
    async(...args) => {

      return safelyExecuteDependencyOperation(

        "Register dependency",

        async() => {

          const register =
            getDependencyAPI(
              "registerDependency"
            );

          return register
            ? await register(...args)
            : false;

        },

        false

      );

    },



    resolve:
    async(...args) => {

      return safelyExecuteDependencyOperation(

        "Resolve dependency",

        async() => {

          const resolve =
            getDependencyAPI(
              "resolveDependency"
            );

          return resolve
            ? await resolve(...args)
            : null;

        },

        null

      );

    },



    fail:
    async(...args) => {

      return safelyExecuteDependencyOperation(

        "Fail dependency",

        async() => {

          const fail =
            getDependencyAPI(
              "failDependency"
            );

          return fail
            ? await fail(...args)
            : false;

        },

        false

      );

    },



    remove:
    async(...args) => {

      return safelyExecuteDependencyOperation(

        "Remove dependency",

        async() => {

          const remove =
            getDependencyAPI(
              "removeDependency"
            );

          return remove
            ? await remove(...args)
            : false;

        },

        false

      );

    },



    get:
    async(...args) => {

      return safelyExecuteDependencyOperation(

        "Get dependency",

        async() => {

          const getter =
            getDependencyAPI(
              "getDependency"
            );

          return getter
            ? await getter(...args)
            : null;

        },

        null

      );

    },



    getAll:
    async(...args) => {

      return safelyExecuteDependencyOperation(

        "Get all dependencies",

        async() => {

          const getter =
            getDependencyAPI(
              "getAllDependencies"
            );

          return getter
            ? safeFreeze(
                await getter(...args)
              )
            : [];

        },

        []

      );

    }

  },



  // ===================================
  // STATUS
  // ===================================

  status:{

    isResolved:
    async(...args) => {

      return safelyExecuteDependencyOperation(

        "Dependency resolution status",

        async() => {

          const checker =
            getDependencyAPI(
              "isDependencyResolved"
            );

          return checker
            ? await checker(...args)
            : false;

        },

        false

      );

    }

  },



  // ===================================
  // VALIDATION
  // ===================================

  validation:{

    validate:
    async() => {

      return safelyExecuteDependencyOperation(

        "Validate dependency registry",

        getDependencyAPI(
          "validateDependencyRegistry"
        ),

        false

      );

    },



    circular:
    async() => {

      return safelyExecuteDependencyOperation(

        "Validate circular dependencies",

        getDependencyAPI(
          "validateCircularDependencies"
        ),

        false

      );

    },



    missing:
    async() => {

      return safelyExecuteDependencyOperation(

        "Validate missing dependencies",

        getDependencyAPI(
          "validateMissingDependencies"
        ),

        false

      );

    },



    resolvers:
    async() => {

      return safelyExecuteDependencyOperation(

        "Validate dependency resolvers",

        getDependencyAPI(
          "validateDependencyResolvers"
        ),

        false

      );

    }

  },



  // ===================================
  // WAITERS
  // ===================================

  waiters:{

    wait:
    async(...args) => {

      return safelyExecuteDependencyOperation(

        "Wait for dependency",

        async() => {

          const waiter =
            getDependencyAPI(
              "waitForDependency"
            );

          return waiter
            ? await waiter(...args)
            : null;

        },

        null

      );

    },



    waitAll:
    async(...args) => {

      return safelyExecuteDependencyOperation(

        "Wait for dependencies",

        async() => {

          const waiter =
            getDependencyAPI(
              "waitForDependencies"
            );

          return waiter
            ? await waiter(...args)
            : []

        },

        []

      );

    }

  },



  // ===================================
  // DIAGNOSTICS
  // ===================================

  diagnostics:{

    report:
    async() => {

      return safelyExecuteDependencyOperation(

        "Dependency diagnostics",

        async() => {

          const diagnostics =
            getDependencyAPI(
              "getDependencyDiagnostics"
            );

          return diagnostics
            ? safeFreeze(
                await diagnostics()
              )
            : null;

        },

        null

      );

    },



    health:
    async() => {

      return safelyExecuteDependencyOperation(

        "Dependency health report",

        async() => {

          const health =
            getDependencyAPI(
              "getDependencyHealthReport"
            );

          return health
            ? safeFreeze(
                await health()
              )
            : null;

        },

        null

      );

    },



    snapshot:
    async() => {

      return safelyExecuteDependencyOperation(

        "Dependency snapshot",

        async() => {

          const snapshot =
            getDependencyAPI(
              "createDependencySnapshot"
            );

          return snapshot
            ? safeFreeze(
                await snapshot()
              )
            : null;

        },

        null

      );

    }

  },



  // ===================================
  // LIFECYCLE
  // ===================================

  lifecycle:{

    initialize:
    async() => {

      return safelyExecuteDependencyOperation(

        "Initialize dependency system",

        getDependencyAPI(
          "initializeDependencySystem"
        ),

        false

      );

    },



    reset:
    async() => {

      return safelyExecuteDependencyOperation(

        "Reset dependency system",

        getDependencyAPI(
          "resetDependencySystem"
        ),

        false

      );

    }

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

    "DependenciesAPI",

    {

      value:
      DependenciesAPI,

      writable:
      false,

      configurable:
      false

    }

  );

}
