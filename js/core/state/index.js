// =====================================
// RIGO AI
// STATE INDEX
// SAFE STATE COMPOSITION LAYER
// ENTERPRISE FINAL
// =====================================



// =====================================
// STATE FILES
// =====================================

import "./app-state.js";
import "./state-manager.js";



// =====================================
// INTERNAL STATE
// =====================================

const stateIndexRuntime =
Object.seal({

  initialized:false,

  initializing:false,

  lastInitializedAt:null,

  lastError:null

});



// =====================================
// HELPERS
// =====================================

function getStateDependency(
  dependencyName
){

  try{

    if(
      typeof DependencySystem ===
      "undefined"
    ){

      return null;

    }

    if(
      typeof DependencySystem
      .resolve !==
      "function"
    ){

      return null;

    }

    return DependencySystem
    .resolve(
      dependencyName
    );

  }

  catch(error){

    console.warn(

      `[StateAPI] Failed resolving dependency: ${dependencyName}`,

      error

    );

    return null;

  }

}



function isFunction(
  value
){

  return typeof value ===
  "function";

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



function safelyExecuteStateOperation(
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



function normalizeStateError(
  error
){

  if(
    typeof getSafeErrorMessage ===
    "function"
  ){

    return getSafeErrorMessage(
      error
    );

  }

  return String(
    error || "UNKNOWN ERROR"
  );

}



function emitStateWarning(
  message,
  error = null
){

  console.warn(

    `[StateIndex] ${message}`,

    error || ""

  );

}



// =====================================
// VALIDATION
// =====================================

function validateStateLayer(){

  if(
    typeof window ===
    "undefined"
  ){

    return false;

  }

  const requiredSystems = [

    "AppState",

    "StateManager"

  ];

  const missingSystems =

    requiredSystems.filter((systemName) => {

      return (

        typeof window[
          systemName
        ] ===

        "undefined"

      );

    });

  if(
    missingSystems.length > 0
  ){

    emitStateWarning(

      `Missing systems: ${missingSystems.join(", ")}`

    );

    return false;

  }

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initializeStateLayer(){

  if(
    stateIndexRuntime
    .initialized
  ){

    return true;

  }

  if(
    stateIndexRuntime
    .initializing
  ){

    return false;

  }

  stateIndexRuntime
  .initializing =
  true;

  stateIndexRuntime
  .lastError =
  null;

  try{

    if(
      !validateStateLayer()
    ){

      throw new Error(
        "STATE LAYER VALIDATION FAILED"
      );

    }

    stateIndexRuntime
    .initialized =
    true;

    stateIndexRuntime
    .lastInitializedAt =
    Date.now();

    window.__RIGO_STATE_READY__ =
    true;

    console.info(
      "[StateIndex] State layer initialized"
    );

    return true;

  }

  catch(error){

    stateIndexRuntime
    .lastError =
    normalizeStateError(
      error
    );

    emitStateWarning(

      "State initialization failed",

      error

    );

    return false;

  }

  finally{

    stateIndexRuntime
    .initializing =
    false;

  }

}



// =====================================
// READONLY APP STATE
// =====================================

function getReadonlyAppState(){

  return safelyExecuteStateOperation(

    "Readonly app state",

    () => {

      const appStateAPI =
      getStateDependency(
        "AppState"
      );

      if(
        !appStateAPI
      ){

        return null;

      }

      if(
        !isFunction(
          appStateAPI.get
        )
      ){

        return null;

      }

      return safeFreeze(
        appStateAPI.get()
      );

    },

    null

  );

}



// =====================================
// READONLY STATE MANAGER
// =====================================

function getReadonlyStateManager(){

  return safelyExecuteStateOperation(

    "Readonly state manager",

    () => {

      const manager =
      getStateDependency(
        "StateManager"
      );

      if(
        !manager
      ){

        return null;

      }

      if(
        isFunction(
          manager.diagnostics
        )
      ){

        return safeFreeze(
          manager
          .diagnostics()
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
// STATE DIAGNOSTICS
// =====================================

function getReadonlyStateDiagnostics(){

  return safelyExecuteStateOperation(

    "State diagnostics",

    () => {

      const manager =
      getStateDependency(
        "StateManager"
      );

      if(
        !manager
      ){

        return null;

      }

      if(
        !isFunction(
          manager.diagnostics
        )
      ){

        return null;

      }

      return safeFreeze(
        manager
        .diagnostics()
      );

    },

    null

  );

}



// =====================================
// STATE SNAPSHOT
// =====================================

function createStateSnapshot(){

  return safeFreeze({

    initialized:
    stateIndexRuntime
    .initialized,

    initializing:
    stateIndexRuntime
    .initializing,

    lastInitializedAt:
    stateIndexRuntime
    .lastInitializedAt,

    lastError:
    stateIndexRuntime
    .lastError,

    timestamp:
    Date.now()

  });

}



// =====================================
// STATE API
// =====================================

const StateAPI =
safeFreeze({



  // ===================================
  // LAYER
  // ===================================

  initialize:
  initializeStateLayer,



  snapshot:
  createStateSnapshot,



  // ===================================
  // READONLY
  // ===================================

  app(){

    return getReadonlyAppState();

  },



  manager(){

    return getReadonlyStateManager();

  },



  diagnostics(){

    return getReadonlyStateDiagnostics();

  },



  // ===================================
  // APP STATE
  // ===================================

  get(){

    return safelyExecuteStateOperation(

      "Get app state",

      () => {

        const appStateAPI =
        getStateDependency(
          "AppState"
        );

        if(
          !appStateAPI
        ){

          return null;

        }

        if(
          !isFunction(
            appStateAPI.get
          )
        ){

          return null;

        }

        return safeFreeze(
          appStateAPI.get()
        );

      },

      null

    );

  },



  setPhase(
    phase
  ){

    return safelyExecuteStateOperation(

      "Update app phase",

      () => {

        const appStateAPI =
        getStateDependency(
          "AppState"
        );

        if(
          !appStateAPI
        ){

          return false;

        }

        if(
          !isFunction(
            appStateAPI
            .setPhase
          )
        ){

          return false;

        }

        return appStateAPI
        .setPhase(
          phase
        );

      },

      false

    );

  },



  reset(){

    return safelyExecuteStateOperation(

      "Reset app state",

      () => {

        const appStateAPI =
        getStateDependency(
          "AppState"
        );

        if(
          !appStateAPI
        ){

          return false;

        }

        if(
          !isFunction(
            appStateAPI
            .reset
          )
        ){

          return false;

        }

        return appStateAPI
        .reset();

      },

      false

    );

  },



  // ===================================
  // STATE MANAGER
  // ===================================

  state(){

    return safelyExecuteStateOperation(

      "Get manager state",

      () => {

        const manager =
        getStateDependency(
          "StateManager"
        );

        if(
          !manager
        ){

          return null;

        }

        if(
          !isFunction(
            manager.getAll
          )
        ){

          return null;

        }

        return safeFreeze(
          manager
          .getAll()
        );

      },

      null

    );

  },



  update(
    path,
    value,
    metadata = {}
  ){

    return safelyExecuteStateOperation(

      "Update manager state",

      () => {

        const manager =
        getStateDependency(
          "StateManager"
        );

        if(
          !manager
        ){

          return false;

        }

        if(
          !isFunction(
            manager.update
          )
        ){

          return false;

        }

        return manager
        .update(

          path,
          value,
          metadata

        );

      },

      false

    );

  },



  remove(
    path
  ){

    return safelyExecuteStateOperation(

      "Remove manager state",

      () => {

        const manager =
        getStateDependency(
          "StateManager"
        );

        if(
          !manager
        ){

          return false;

        }

        if(
          !isFunction(
            manager.remove
          )
        ){

          return false;

        }

        return manager
        .remove(
          path
        );

      },

      false

    );

  },



  rollback(
    version
  ){

    return safelyExecuteStateOperation(

      "Rollback manager state",

      () => {

        const manager =
        getStateDependency(
          "StateManager"
        );

        if(
          !manager
        ){

          return false;

        }

        if(
          !isFunction(
            manager.rollback
          )
        ){

          return false;

        }

        return manager
        .rollback(
          version
        );

      },

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



// =====================================
// SAFE AUTO INITIALIZATION
// =====================================

if(
  typeof window !==
  "undefined"
){

  queueMicrotask(async() => {

    try{

      await initializeStateLayer();

    }

    catch(error){

      emitStateWarning(

        "Queued state initialization failed",

        error

      );

    }

  });

}
