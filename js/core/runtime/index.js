// =====================================
// RIGO AI
// RUNTIME INDEX
// SAFE RUNTIME COMPOSITION LAYER
// =====================================



// =====================================
// HELPERS
// =====================================

function getRuntimeDependency(
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
        `[RuntimeAPI] Missing dependency: ${dependencyName}`
      );

      return null;

    }

    return dependency;

  }

  catch(error){

    console.warn(
      `[RuntimeAPI] Failed resolving dependency: ${dependencyName}`,
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



async function safelyExecuteRuntimeOperation(
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
      `[RuntimeAPI] ${label} failed`,
      error
    );

    return fallback;

  }

}



// =====================================
// READONLY ACCESS
// =====================================

async function getReadonlyRuntimeManager(){

  return safelyExecuteRuntimeOperation(

    "Readonly runtime manager access",

    async() => {

      const manager =
        getRuntimeDependency(
          "RuntimeManager"
        );

      if(!manager){
        return null;
      }

      if(
        isFunction(manager.snapshot)
      ){

        return safeFreeze(
          await manager.snapshot()
        );

      }

      return safeFreeze(
        manager
      );

    },

    null

  );

}



async function getReadonlyRuntimeState(){

  return safelyExecuteRuntimeOperation(

    "Readonly runtime state",

    async() => {

      const runtimeState =
        getRuntimeDependency(
          "RuntimeState"
        );

      if(!runtimeState){
        return null;
      }

      if(
        isFunction(runtimeState.get)
      ){

        return safeFreeze(
          await runtimeState.get()
        );

      }

      return safeFreeze(
        runtimeState
      );

    },

    null

  );

}



async function getRuntimeHealth(){

  return safelyExecuteRuntimeOperation(

    "Runtime health",

    async() => {

      const runtimeManager =
        getRuntimeDependency(
          "RuntimeManager"
        );

      if(
        !runtimeManager ||
        !isFunction(
          runtimeManager.health
        )
      ){

        return null;

      }

      return safeFreeze(
        await runtimeManager.health()
      );

    },

    null

  );

}



// =====================================
// SYSTEM ACCESS
// =====================================

function createRuntimeSystemAccessor(
  dependencyName
){

  return async() => {

    return safelyExecuteRuntimeOperation(

      `Runtime system access: ${dependencyName}`,

      async() => {

        const runtime =
          getRuntimeDependency(
            dependencyName
          );

        if(!runtime){
          return null;
        }

        if(
          isFunction(runtime.snapshot)
        ){

          return safeFreeze(
            await runtime.snapshot()
          );

        }

        return safeFreeze(
          runtime
        );

      },

      null

    );

  };

}



// =====================================
// RUNTIME CONTROL
// =====================================

async function bootRuntime(){

  return safelyExecuteRuntimeOperation(

    "Runtime boot",

    async() => {

      const manager =
        getRuntimeDependency(
          "RuntimeManager"
        );

      if(
        !manager ||
        !isFunction(
          manager.boot
        )
      ){

        return false;

      }

      return await manager.boot();

    },

    false

  );

}



async function shutdownRuntime(){

  return safelyExecuteRuntimeOperation(

    "Runtime shutdown",

    async() => {

      const manager =
        getRuntimeDependency(
          "RuntimeManager"
        );

      if(
        !manager ||
        !isFunction(
          manager.shutdown
        )
      ){

        return false;

      }

      return await manager.shutdown();

    },

    false

  );

}



async function recoverRuntime(){

  return safelyExecuteRuntimeOperation(

    "Runtime recovery",

    async() => {

      const manager =
        getRuntimeDependency(
          "RuntimeManager"
        );

      if(
        !manager ||
        !isFunction(
          manager.recover
        )
      ){

        return false;

      }

      return await manager.recover();

    },

    false

  );

}



// =====================================
// DIAGNOSTICS
// =====================================

async function getRuntimeDiagnostics(){

  return safelyExecuteRuntimeOperation(

    "Runtime diagnostics",

    async() => {

      const runtimeHealth =
        await getRuntimeHealth();

      const runtimeState =
        await getReadonlyRuntimeState();

      return safeFreeze({

        state:
        runtimeState,

        health:
        runtimeHealth,

        timestamp:
        Date.now()

      });

    },

    null

  );

}



// =====================================
// RUNTIME API
// =====================================

const RuntimeAPI =
safeFreeze({



  // ===================================
  // CORE
  // ===================================

  manager:
  getReadonlyRuntimeManager,



  state:
  getReadonlyRuntimeState,



  health:
  getRuntimeHealth,



  diagnostics:
  getRuntimeDiagnostics,



  // ===================================
  // RUNTIME CONTROL
  // ===================================

  boot:
  bootRuntime,



  shutdown:
  shutdownRuntime,



  recover:
  recoverRuntime,



  // ===================================
  // SYSTEMS
  // ===================================

  systems:{

    language:
    createRuntimeSystemAccessor(
      "LanguageRuntime"
    ),

    files:
    createRuntimeSystemAccessor(
      "FileRuntime"
    ),

    analytics:
    createRuntimeSystemAccessor(
      "AnalyticsRuntime"
    )

  },



  // ===================================
  // BOOT SEQUENCE
  // ===================================

  bootSequence:
  async() => {

    return safelyExecuteRuntimeOperation(

      "Runtime boot sequence",

      async() => {

        const bootSequence =
          getRuntimeDependency(
            "RuntimeBootSequence"
          );

        if(!bootSequence){
          return null;
        }

        if(
          isFunction(
            bootSequence.snapshot
          )
        ){

          return safeFreeze(
            await bootSequence.snapshot()
          );

        }

        return safeFreeze(
          bootSequence
        );

      },

      null

    );

  }

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

    "RuntimeAPI",

    {

      value:
      RuntimeAPI,

      writable:
      false,

      configurable:
      false

    }

  );

}
