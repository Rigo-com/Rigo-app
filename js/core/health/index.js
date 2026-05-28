// =====================================
// RIGO AI
// HEALTH INDEX
// SAFE HEALTH COMPOSITION LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// HEALTH FILES
// =====================================

import "./diagnostics-runtime.js";
import "./health-diagnostics.js";
import "./health-monitor.js";
import "./health-runtime.js";
import "./health-system.js";



// =====================================
// HELPERS
// =====================================

function getHealthDependency(
  dependencyName
){

  try{

    if(
      typeof globalThis ===
      "undefined"
    ){

      return null;

    }

    const dependency =
    globalThis[
      dependencyName
    ];

    if(
      typeof dependency ===
      "undefined"
    ){

      console.warn(

        `[RIGOHealth] Missing dependency: ${dependencyName}`

      );

      return null;

    }

    return dependency;

  }

  catch(error){

    console.warn(

      `[RIGOHealth] Failed resolving dependency: ${dependencyName}`,

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



async function safelyExecuteHealthOperation(
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

      `[RIGOHealth] ${label} failed`,

      error

    );

    return fallback;

  }

}



// =====================================
// READONLY ACCESS
// =====================================

function createReadonlyHealthAccessor(
  dependencyName
){

  return async() => {

    return safelyExecuteHealthOperation(

      `Readonly access: ${dependencyName}`,

      async() => {

        const dependency =
        getHealthDependency(
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

        return safeFreeze({

          ...dependency

        });

      },

      null

    );

  };

}



// =====================================
// OPERATIONS
// =====================================

async function runHealthChecks(){

  return safelyExecuteHealthOperation(

    "Run health checks",

    async() => {

      const runtime =
      getHealthDependency(
        "RIGOHealthRuntime"
      );

      if(
        !runtime
      ){

        return false;

      }

      if(
        isFunction(
          runtime.run
        )
      ){

        return await runtime.run();

      }

      return false;

    },

    false

  );

}



async function startHealthSystem(){

  return safelyExecuteHealthOperation(

    "Start health system",

    async() => {

      const system =
      getHealthDependency(
        "RIGOHealthSystem"
      );

      if(
        !system
      ){

        return false;

      }

      if(
        isFunction(
          system.start
        )
      ){

        return await system.start();

      }

      return false;

    },

    false

  );

}



async function stopHealthSystem(){

  return safelyExecuteHealthOperation(

    "Stop health system",

    async() => {

      const system =
      getHealthDependency(
        "RIGOHealthSystem"
      );

      if(
        !system
      ){

        return false;

      }

      if(
        isFunction(
          system.stop
        )
      ){

        return await system.stop();

      }

      return false;

    },

    false

  );

}



async function initializeHealthSystem(){

  return safelyExecuteHealthOperation(

    "Initialize health system",

    async() => {

      const system =
      getHealthDependency(
        "RIGOHealthSystem"
      );

      if(
        !system
      ){

        return false;

      }

      if(
        isFunction(
          system.initialize
        )
      ){

        return await system.initialize();

      }

      return false;

    },

    false

  );

}



async function resetHealthSystem(){

  return safelyExecuteHealthOperation(

    "Reset health system",

    async() => {

      const system =
      getHealthDependency(
        "RIGOHealthSystem"
      );

      if(
        !system
      ){

        return false;

      }

      if(
        isFunction(
          system.reset
        )
      ){

        return await system.reset();

      }

      return false;

    },

    false

  );

}



// =====================================
// HEALTH REPORT
// =====================================

async function getUnifiedHealthReport(){

  return safelyExecuteHealthOperation(

    "Unified health report",

    async() => {

      const system =
      await RIGOHealthIndex
      .system();

      const runtime =
      await RIGOHealthIndex
      .runtime();

      const monitor =
      await RIGOHealthIndex
      .monitor();

      const diagnostics =
      await RIGOHealthIndex
      .healthDiagnostics();

      let runtimeHealth =
      null;

      const runtimeDependency =
      getHealthDependency(
        "RIGOHealthRuntime"
      );

      if(

        runtimeDependency &&

        isFunction(
          runtimeDependency.run
        )

      ){

        runtimeHealth =
        await runtimeDependency
        .run();

      }

      return safeFreeze({

        system,
        runtime,
        monitor,
        diagnostics,

        runtimeHealth,

        timestamp:
        Date.now()

      });

    },

    null

  );

}



// =====================================
// HEALTH API
// =====================================

const RIGOHealthIndex =
safeFreeze({



  // ===================================
  // SUBSYSTEMS
  // ===================================

  system:
  createReadonlyHealthAccessor(
    "RIGOHealthSystem"
  ),



  runtime:
  createReadonlyHealthAccessor(
    "RIGOHealthRuntime"
  ),



  monitor:
  createReadonlyHealthAccessor(
    "RIGOHealthMonitor"
  ),



  healthDiagnostics:
  createReadonlyHealthAccessor(
    "RIGOHealthDiagnostics"
  ),



  // ===================================
  // OPERATIONS
  // ===================================

  run:
  runHealthChecks,



  start:
  startHealthSystem,



  stop:
  stopHealthSystem,



  initialize:
  initializeHealthSystem,



  reset:
  resetHealthSystem,



  // ===================================
  // DIAGNOSTICS
  // ===================================

  diagnostics:
  getUnifiedHealthReport,



  snapshot:
  getUnifiedHealthReport

});



// =====================================
// EXPORTS
// =====================================

export {

  getHealthDependency,

  safelyExecuteHealthOperation,

  createReadonlyHealthAccessor,

  runHealthChecks,

  startHealthSystem,

  stopHealthSystem,

  initializeHealthSystem,

  resetHealthSystem,

  getUnifiedHealthReport,

  RIGOHealthIndex

};

export default
RIGOHealthIndex;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOHealthIndex",

    {

      value:
      RIGOHealthIndex,

      writable:false,

      configurable:false

    }

  );

}
