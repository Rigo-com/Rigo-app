// =====================================
// RIGO AI
// STATE INDEX
// SAFE STATE COMPOSITION LAYER
// =====================================



// =====================================
// HELPERS
// =====================================

function getStateDependency(
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
        `[StateAPI] Missing dependency: ${dependencyName}`
      );

      return null;

    }

    return dependency;

  }

  catch(error){

    console.warn(
      `[StateAPI] Failed resolving dependency: ${dependencyName}`,
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



function safelyExecuteStateOperation(
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
      `[StateAPI] ${label} failed`,
      error
    );

    return fallback;

  }

}



// =====================================
// STATE SNAPSHOTS
// =====================================

function getReadonlyAppState(){

  return safelyExecuteStateOperation(

    "Readonly app state",

    () => {

      const getter =
        getStateDependency(
          "getAppState"
        );

      if(
        !isFunction(getter)
      ){
        return null;
      }

      return safeFreeze(
        getter()
      );

    },

    null

  );

}



function getReadonlyStateManager(){

  return safelyExecuteStateOperation(

    "Readonly state manager",

    () => {

      const manager =
        getStateDependency(
          "StateManager"
        );

      if(!manager){
        return null;
      }

      if(
        isFunction(manager.snapshot)
      ){

        return safeFreeze(
          manager.snapshot()
        );

      }

      return safeFreeze(
        manager
      );

    },

    null

  );

}



// =====================================
// STATE API
// =====================================

const StateAPI =
safeFreeze({



  // ===================================
  // READONLY STATE
  // ===================================

  app(){

    return getReadonlyAppState();

  },



  manager(){

    return getReadonlyStateManager();

  },



  // ===================================
  // HELPERS
  // ===================================

  get(){

    return safelyExecuteStateOperation(

      "Get app state",

      () => {

        const getter =
          getStateDependency(
            "getAppState"
          );

        return getter
          ? getter()
          : null;

      },

      null

    );

  },



  update(
    phase
  ){

    return safelyExecuteStateOperation(

      "Update app phase",

      () => {

        const updater =
          getStateDependency(
            "updateAppPhase"
          );

        return updater
          ? updater(phase)
          : false;

      },

      false

    );

  },



  reset(){

    return safelyExecuteStateOperation(

      "Reset app state",

      () => {

        const resetter =
          getStateDependency(
            "resetAppState"
          );

        return resetter
          ? resetter()
          : false;

      },

      false

    );

  },



  diagnostics(){

    return safelyExecuteStateOperation(

      "State diagnostics",

      () => {

        const diagnostics =
          getStateDependency(
            "getStateDiagnostics"
          );

        return diagnostics
          ? safeFreeze(
              diagnostics()
            )
          : null;

      },

      null

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

    "StateAPI",

    {

      value:
      StateAPI,

      writable:
      false,

      configurable:
      false

    }

  );

}
