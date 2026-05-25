// =====================================
// RIGO AI
// LIFECYCLE INDEX
// SAFE LIFECYCLE COMPOSITION LAYER
// =====================================



// =====================================
// HELPERS
// =====================================

function getLifecycleDependency(
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
        `[LifecycleIndex] Missing dependency: ${dependencyName}`
      );

      return null;

    }

    return dependency;

  }

  catch(error){

    console.warn(
      `[LifecycleIndex] Failed resolving dependency: ${dependencyName}`,
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

    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Map ||
    value instanceof Set ||
    value instanceof HTMLElement

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



async function safelyExecuteLifecycleOperation(
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
      `[LifecycleIndex] ${label} failed`,
      error
    );

    return fallback;

  }

}



// =====================================
// READONLY ACCESS
// =====================================

function createReadonlyAccessor(
  dependencyName
){

  return async() => {

    return safelyExecuteLifecycleOperation(

      `Readonly access: ${dependencyName}`,

      async() => {

        const dependency =
          getLifecycleDependency(
            dependencyName
          );

        if(!dependency){
          return null;
        }

        if(
          isFunction(
            dependency.snapshot
          )
        ){

          return safeFreeze(
            await dependency.snapshot()
          );

        }

        if(
          isFunction(
            dependency.getSnapshot
          )
        ){

          return safeFreeze(
            await dependency.getSnapshot()
          );

        }

        if(
          isFunction(
            dependency.diagnostics
          )
        ){

          return safeFreeze({

            diagnostics:
            await dependency
            .diagnostics()

          });

        }

        return safeFreeze(
          dependency
        );

      },

      null

    );

  };

}



// =====================================
// LIFECYCLE OPERATIONS
// =====================================

async function bootLifecycle(){

  return safelyExecuteLifecycleOperation(

    "Lifecycle boot",

    async() => {

      const startup =
        getLifecycleDependency(
          "AppStartup"
        );

      if(
        !startup
      ){

        return false;

      }

      if(
        isFunction(
          startup.start
        )
      ){

        return await startup.start();

      }

      if(
        isFunction(
          startup.boot
        )
      ){

        return await startup.boot();

      }

      return false;

    },

    false

  );

}



async function shutdownLifecycle(){

  return safelyExecuteLifecycleOperation(

    "Lifecycle shutdown",

    async() => {

      const shutdown =
        getLifecycleDependency(
          "AppShutdown"
        );

      if(
        !shutdown
      ){

        return false;

      }

      if(
        isFunction(
          shutdown.execute
        )
      ){

        return await shutdown.execute();

      }

      if(
        isFunction(
          shutdown.shutdown
        )
      ){

        return await shutdown.shutdown();

      }

      return false;

    },

    false

  );

}



async function bootstrapLifecycle(){

  return safelyExecuteLifecycleOperation(

    "Lifecycle bootstrap",

    async() => {

      const bootstrap =
        getLifecycleDependency(
          "AppBootstrap"
        );

      if(
        !bootstrap
      ){

        return false;

      }

      if(
        isFunction(
          bootstrap.initialize
        )
      ){

        return await bootstrap.initialize();

      }

      if(
        isFunction(
          bootstrap.bootstrap
        )
      ){

        return await bootstrap.bootstrap();

      }

      return false;

    },

    false

  );

}



// =====================================
// DIAGNOSTICS
// =====================================

async function getLifecycleDiagnostics(){

  return safelyExecuteLifecycleOperation(

    "Lifecycle diagnostics",

    async() => {

      const lifecycle =
        await LifecycleIndex
        .lifecycle();

      const startup =
        await LifecycleIndex
        .startup();

      const bootstrap =
        await LifecycleIndex
        .bootstrap();

      const shutdown =
        await LifecycleIndex
        .shutdown();

      const environment =
        await LifecycleIndex
        .environment();

      const messages =
        await LifecycleIndex
        .messages();

      const diagnostics =
        await LifecycleIndex
        .diagnosticsRuntime();

      const health =
        await LifecycleIndex
        .health();

      return safeFreeze({

        lifecycle,
        startup,
        bootstrap,
        shutdown,
        environment,
        messages,
        diagnostics,
        health,

        timestamp:
        Date.now()

      });

    },

    null

  );

}



// =====================================
// LIFECYCLE API
// =====================================

const LifecycleIndex =
safeFreeze({



  // ===================================
  // CORE
  // ===================================

  lifecycle:
  createReadonlyAccessor(
    "AppLifecycle"
  ),



  startup:
  createReadonlyAccessor(
    "AppStartup"
  ),



  bootstrap:
  createReadonlyAccessor(
    "AppBootstrap"
  ),



  shutdown:
  createReadonlyAccessor(
    "AppShutdown"
  ),



  environment:
  createReadonlyAccessor(
    "AppEnvironment"
  ),



  messages:
  createReadonlyAccessor(
    "MessageRuntime"
  ),



  diagnosticsRuntime:
  createReadonlyAccessor(
    "AppDiagnostics"
  ),



  health:
  createReadonlyAccessor(
    "HealthSystem"
  ),



  // ===================================
  // ORCHESTRATION
  // ===================================

  boot:
  bootLifecycle,



  bootstrapApplication:
  bootstrapLifecycle,



  shutdownApplication:
  shutdownLifecycle,



  // ===================================
  // DIAGNOSTICS
  // ===================================

  diagnostics:
  getLifecycleDiagnostics

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "LifecycleIndex",

    {

      value:
      LifecycleIndex,

      writable:
      false,

      configurable:
      false

    }

  );

}
