// =====================================
// RIGO AI
// CONTAINER INDEX
// SAFE CONTAINER COMPOSITION LAYER
// =====================================



// =====================================
// HELPERS
// =====================================

function getContainerDependency(
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
        `[ContainerAPI] Missing dependency: ${dependencyName}`
      );

      return null;

    }

    return dependency;

  }

  catch(error){

    console.warn(
      `[ContainerAPI] Failed resolving dependency: ${dependencyName}`,
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



async function safelyExecuteContainerOperation(
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
      `[ContainerAPI] ${label} failed`,
      error
    );

    return fallback;

  }

}



// =====================================
// READONLY CONTAINER ACCESS
// =====================================

function getReadonlyContainer(){

  return safelyExecuteContainerOperation(

    "Readonly container access",

    async() => {

      const container =
        getContainerDependency(
          "DependencyContainer"
        );

      if(!container){
        return null;
      }

      if(
        isFunction(container.snapshot)
      ){

        return safeFreeze(
          await container.snapshot()
        );

      }

      return safeFreeze(
        container
      );

    },

    null

  );

}



// =====================================
// CONTAINER API
// =====================================

const ContainerAPI =
safeFreeze({



  // ===================================
  // CONTAINER
  // ===================================

  container(){

    return getReadonlyContainer();

  },



  // ===================================
  // CONSTANTS
  // ===================================

  constants:{

    config:
    getContainerDependency(
      "DEPENDENCY_CONTAINER_CONFIG"
    ),

    lifecycles:
    getContainerDependency(
      "SERVICE_LIFECYCLE"
    ),

    events:
    getContainerDependency(
      "CONTAINER_EVENTS"
    )

  },



  // ===================================
  // REGISTRY
  // ===================================

  registry:{

    register:
    async(...args) => {

      return safelyExecuteContainerOperation(

        "Register service",

        async() => {

          const register =
            getContainerDependency(
              "registerService"
            );

          return register
            ? await register(...args)
            : false;

        },

        false

      );

    },



    remove:
    async(...args) => {

      return safelyExecuteContainerOperation(

        "Remove service",

        async() => {

          const remove =
            getContainerDependency(
              "removeService"
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

      return safelyExecuteContainerOperation(

        "Get registered service",

        async() => {

          const getter =
            getContainerDependency(
              "getRegisteredService"
            );

          return getter
            ? await getter(...args)
            : null;

        },

        null

      );

    },



    has:
    async(...args) => {

      return safelyExecuteContainerOperation(

        "Check registered service",

        async() => {

          const checker =
            getContainerDependency(
              "hasRegisteredService"
            );

          return checker
            ? await checker(...args)
            : false;

        },

        false

      );

    },



    services:
    async(...args) => {

      return safelyExecuteContainerOperation(

        "Get registered services",

        async() => {

          const services =
            getContainerDependency(
              "getRegisteredServices"
            );

          return services
            ? safeFreeze(
                await services(...args)
              )
            : [];

        },

        []

      );

    }

  },



  // ===================================
  // RESOLUTION
  // ===================================

  resolution:{

    resolve:
    async(...args) => {

      return safelyExecuteContainerOperation(

        "Resolve service",

        async() => {

          const resolve =
            getContainerDependency(
              "resolveService"
            );

          return resolve
            ? await resolve(...args)
            : null;

        },

        null

      );

    },



    resolveDependencies:
    async(...args) => {

      return safelyExecuteContainerOperation(

        "Resolve dependencies",

        async() => {

          const resolve =
            getContainerDependency(
              "resolveDependencies"
            );

          return resolve
            ? await resolve(...args)
            : []

        },

        []

      );

    },



    createInstance:
    async(...args) => {

      return safelyExecuteContainerOperation(

        "Create service instance",

        async() => {

          const creator =
            getContainerDependency(
              "createServiceInstance"
            );

          return creator
            ? await creator(...args)
            : null;

        },

        null

      );

    }

  },



  // ===================================
  // SCOPES
  // ===================================

  scopes:{

    get:
    async(...args) => {

      return safelyExecuteContainerOperation(

        "Get scope container",

        async() => {

          const getter =
            getContainerDependency(
              "getScopeContainer"
            );

          return getter
            ? await getter(...args)
            : null;

        },

        null

      );

    },



    remove:
    async(...args) => {

      return safelyExecuteContainerOperation(

        "Remove scope container",

        async() => {

          const remove =
            getContainerDependency(
              "removeScopeContainer"
            );

          return remove
            ? await remove(...args)
            : false;

        },

        false

      );

    },



    clear:
    async(...args) => {

      return safelyExecuteContainerOperation(

        "Clear scope containers",

        async() => {

          const clear =
            getContainerDependency(
              "clearScopeContainers"
            );

          return clear
            ? await clear(...args)
            : false;

        },

        false

      );

    },



    detectCircular:
    async(...args) => {

      return safelyExecuteContainerOperation(

        "Detect circular dependencies",

        async() => {

          const detect =
            getContainerDependency(
              "detectCircularDependency"
            );

          return detect
            ? await detect(...args)
            : false;

        },

        false

      );

    }

  },



  // ===================================
  // HEALTH
  // ===================================

  health:{

    report:
    async() => {

      return safelyExecuteContainerOperation(

        "Container health report",

        async() => {

          const report =
            getContainerDependency(
              "getContainerHealthReport"
            );

          return report
            ? safeFreeze(
                await report()
              )
            : null;

        },

        null

      );

    },



    diagnostics:
    async() => {

      return safelyExecuteContainerOperation(

        "Container diagnostics",

        async() => {

          const diagnostics =
            getContainerDependency(
              "getContainerDiagnostics"
            );

          return diagnostics
            ? safeFreeze(
                await diagnostics()
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

      return safelyExecuteContainerOperation(

        "Initialize dependency container",

        getContainerDependency(
          "initializeDependencyContainer"
        ),

        false

      );

    },



    reset:
    async() => {

      return safelyExecuteContainerOperation(

        "Reset dependency container",

        getContainerDependency(
          "resetDependencyContainer"
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

    "ContainerAPI",

    {

      value:
      ContainerAPI,

      writable:
      false,

      configurable:
      false

    }

  );

}
