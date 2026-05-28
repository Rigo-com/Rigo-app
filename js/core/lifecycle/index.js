// =====================================
// RIGO AI
// LIFECYCLE INDEX
// SAFE LIFECYCLE COMPOSITION LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// LIFECYCLE FILES
// =====================================

import "./app-bootstrap.js";
import "./app-diagnostics.js";
import "./app-environment.js";
import "./app-lifecycle.js";
import "./app-message-runtime.js";
import "./app-shutdown.js";
import "./app-startup.js";



// =====================================
// HELPERS
// =====================================

function resolveLifecycleDependency(
  dependencyName
){

  try{

    if(
      typeof globalThis ===
      "undefined"
    ){

      return null;

    }

    const container =
    globalThis
    .RIGOContainer;

    if(
      !container
    ){

      return null;

    }

    if(
      typeof container.resolve !==
      "function"
    ){

      return null;

    }

    const dependency =
    container.resolve(
      dependencyName
    );

    if(
      typeof dependency ===
      "undefined"
    ){

      console.warn(

        `[RIGOLifecycle] Missing dependency: ${dependencyName}`

      );

      return null;

    }

    return dependency;

  }

  catch(error){

    console.warn(

      `[RIGOLifecycle] Failed resolving dependency: ${dependencyName}`,

      error

    );

    return null;

  }

}



function isFunction(
  value
){

  return (
    typeof value ===
    "function"
  );

}



function isPlainObject(
  value
){

  if(
    !value ||
    typeof value !==
    "object"
  ){

    return false;

  }

  const prototype =
  Object.getPrototypeOf(
    value
  );

  return (

    prototype ===
    Object.prototype ||

    prototype ===
    null

  );

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

  if(

    !Array.isArray(value) &&

    !isPlainObject(value)

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
      !isFunction(
        operation
      )
    ){

      return fallback;

    }

    return await operation();

  }

  catch(error){

    console.warn(

      `[RIGOLifecycle] ${label} failed`,

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
        resolveLifecycleDependency(
          dependencyName
        );

        if(
          !dependency
        ){

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
      resolveLifecycleDependency(
        "RIGOAppLifecycle"
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
      resolveLifecycleDependency(
        "RIGOAppLifecycle"
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
      resolveLifecycleDependency(
        "RIGOAppLifecycle"
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
      resolveLifecycleDependency(
        "RIGOAppLifecycle"
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
      resolveLifecycleDependency(
        "RIGOAppLifecycle"
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
      resolveLifecycleDependency(
        "RIGOAppLifecycle"
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
      await RIGOLifecycleRuntime
      .lifecycle();

      const startup =
      await RIGOLifecycleRuntime
      .startup();

      const bootstrap =
      await RIGOLifecycleRuntime
      .bootstrap();

      const shutdown =
      await RIGOLifecycleRuntime
      .shutdown();

      const environment =
      await RIGOLifecycleRuntime
      .environment();

      const messages =
      await RIGOLifecycleRuntime
      .messages();

      const diagnostics =
      await RIGOLifecycleRuntime
      .appDiagnostics();

      const health =
      await RIGOLifecycleRuntime
      .health();

      const runtime =
      await RIGOLifecycleRuntime
      .runtime();

      const config =
      await RIGOLifecycleRuntime
      .config();

      const dependencies =
      await RIGOLifecycleRuntime
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

const RIGOLifecycleRuntime =
safeFreeze({



  // ===================================
  // CORE
  // ===================================

  lifecycle:
  createReadonlyAccessor(
    "RIGOAppLifecycle"
  ),



  startup:
  createReadonlyAccessor(
    "RIGOAppStartup"
  ),



  bootstrap:
  createReadonlyAccessor(
    "RIGOAppBootstrap"
  ),



  shutdown:
  createReadonlyAccessor(
    "RIGOAppShutdown"
  ),



  environment:
  createReadonlyAccessor(
    "RIGOAppEnvironment"
  ),



  messages:
  createReadonlyAccessor(
    "RIGOMessageRuntime"
  ),



  appDiagnostics:
  createReadonlyAccessor(
    "RIGOAppDiagnostics"
  ),



  health:
  createReadonlyAccessor(
    "RIGOHealthIndex"
  ),



  runtime:
  createReadonlyAccessor(
    "RIGORuntimeManager"
  ),



  config:
  createReadonlyAccessor(
    "RIGOConfigRuntime"
  ),



  dependencies:
  createReadonlyAccessor(
    "RIGOContainerRuntime"
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

  diagnostics:
  getLifecycleDiagnostics,



  snapshot:
  getLifecycleDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export {

  resolveLifecycleDependency,

  safelyExecuteLifecycleOperation,

  createReadonlyAccessor,

  lifecycleStart,

  lifecycleShutdown,

  lifecycleBootstrap,

  lifecycleCleanup,

  lifecycleRecover,

  lifecycleStatus,

  getLifecycleDiagnostics,

  RIGOLifecycleRuntime

};

export default
RIGOLifecycleRuntime;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOLifecycleRuntime",

    {

      value:
      RIGOLifecycleRuntime,

      writable:false,

      configurable:false

    }

  );

}
