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
// ORCHESTRATION
// =====================================

async function lifecycleStart(){

  return safelyExecuteLifecycleOperation(

    "Lifecycle start",

    async() => {

      const lifecycle =
        getLifecycleDependency(
          "AppLifecycle"
        );

      if(
        !lifecycle ||
        !isFunction(
          lifecycle.start
        )
      ){

        return false;

      }

      return await lifecycle
      .start();

    },

    false

  );

}



async function lifecycleShutdown(){

  return safelyExecuteLifecycleOperation(

    "Lifecycle shutdown",

    async() => {

      const lifecycle =
        getLifecycleDependency(
          "AppLifecycle"
        );

      if(
        !lifecycle ||
        !isFunction(
          lifecycle.shutdown
        )
      ){

        return false;

      }

      return await lifecycle
      .shutdown();

    },

    false

  );

}



async function lifecycleBootstrap(){

  return safelyExecuteLifecycleOperation(

    "Lifecycle bootstrap",

    async() => {

      const lifecycle =
        getLifecycleDependency(
          "AppLifecycle"
        );

      if(
        !lifecycle ||
        !isFunction(
          lifecycle.initialize
        )
      ){

        return false;

      }

      return await lifecycle
      .initialize();

    },

    false

  );

}



async function lifecycleCleanup(){

  return safelyExecuteLifecycleOperation(

    "Lifecycle cleanup",

    async() => {

      const lifecycle =
        getLifecycleDependency(
          "AppLifecycle"
        );

      if(
        !lifecycle ||
        !isFunction(
          lifecycle.cleanup
        )
      ){

        return false;

      }

      return await lifecycle
      .cleanup();

    },

    false

  );

}



async function lifecycleRecover(){

  return safelyExecuteLifecycleOperation(

    "Lifecycle recover",

    async() => {

      const lifecycle =
        getLifecycleDependency(
          "AppLifecycle"
        );

      if(
        !lifecycle ||
        !isFunction(
          lifecycle.recover
        )
      ){

        return false;

      }

      return await lifecycle
      .recover();

    },

    false

  );

}



async function lifecycleStatus(){

  return safelyExecuteLifecycleOperation(

    "Lifecycle status",

    async() => {

      const lifecycle =
        getLifecycleDependency(
          "AppLifecycle"
        );

      if(
        !lifecycle ||
        !isFunction(
          lifecycle.status
        )
      ){

        return null;

      }

      return await lifecycle
      .status();

    },

    null

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
        await LifecycleAPI
        .lifecycle();

      const startup =
        await LifecycleAPI
        .startup();

      const bootstrap =
        await LifecycleAPI
        .bootstrap();

      const shutdown =
        await LifecycleAPI
        .shutdown();

      const environment =
        await LifecycleAPI
        .environment();

      const messages =
        await LifecycleAPI
        .messages();

      const diagnostics =
        await LifecycleAPI
        .diagnostics();

      const health =
        await LifecycleAPI
        .health();

      const runtime =
        await LifecycleAPI
        .runtime();

      const config =
        await LifecycleAPI
        .config();

      const dependencies =
        await LifecycleAPI
        .dependencies();

      return safeFreeze({

        lifecycle,
        startup,
        bootstrap,
        shutdown,
        environment,
        messages,
        diagnostics,
        health,
        runtime,
        config,
        dependencies,

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

const LifecycleAPI =
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



  diagnostics:
  createReadonlyAccessor(
    "AppDiagnostics"
  ),



  health:
  createReadonlyAccessor(
    "HealthAPI"
  ),



  runtime:
  createReadonlyAccessor(
    "RuntimeManager"
  ),



  config:
  createReadonlyAccessor(
    "ConfigAPI"
  ),



  dependencies:
  createReadonlyAccessor(
    "DependencySystem"
  ),



  // ===================================
  // ORCHESTRATION
  // ===================================

  start:
  lifecycleStart,



  boot:
  lifecycleStart,



  initialize:
  lifecycleBootstrap,



  bootstrapApplication:
  lifecycleBootstrap,



  shutdown:
  lifecycleShutdown,



  shutdownApplication:
  lifecycleShutdown,



  cleanup:
  lifecycleCleanup,



  recover:
  lifecycleRecover,



  status:
  lifecycleStatus,



  // ===================================
  // SNAPSHOT
  // ===================================

  snapshot:
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

    "LifecycleAPI",

    {

      value:
      LifecycleAPI,

      writable:
      false,

      configurable:
      false

    }

  );

}
