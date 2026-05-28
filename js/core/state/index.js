// =====================================
// RIGO AI
// STATE INDEX
// SAFE STATE COMPOSITION LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// STATE FILES
// =====================================

import "./app-state.js";
import "./state-manager.js";



// =====================================
// INTERNAL STATE
// =====================================

const stateIndexState =
Object.seal({

  initialized:false,

  initializing:false,

  lastInitializedAt:null,

  lastError:null

});



// =====================================
// INTERNAL HELPERS
// =====================================

function getContainerService(
  serviceName
){

  try{

    if(
      typeof globalThis ===
      "undefined"
    ){

      return null;

    }

    const container =
      globalThis.RIGOContainer;

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

    return container.resolve(
      serviceName
    );

  }

  catch(error){

    console.warn(

      `[StateAPI] Failed resolving service: ${serviceName}`,

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
    typeof globalThis ===
    "undefined"
  ){

    return false;

  }

  const requiredSystems = [

    "RIGOAppState",
    "RIGOStateManager"

  ];

  const missingSystems =

    requiredSystems.filter((systemName) => {

      return (

        typeof globalThis[
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
// INITIALIZATION
// =====================================

async function initializeStateLayer(){

  if(
    stateIndexState
    .initialized
  ){

    return true;

  }

  if(
    stateIndexState
    .initializing
  ){

    return false;

  }

  stateIndexState
  .initializing =
  true;

  stateIndexState
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

    stateIndexState
    .initialized =
    true;

    stateIndexState
    .lastInitializedAt =
    Date.now();

    globalThis.__RIGO_STATE_READY__ =
    true;

    console.info(
      "[StateIndex] State layer initialized"
    );

    return true;

  }

  catch(error){

    stateIndexState
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

    stateIndexState
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
      getContainerService(
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
      getContainerService(
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
      getContainerService(
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
    stateIndexState
    .initialized,

    initializing:
    stateIndexState
    .initializing,

    lastInitializedAt:
    stateIndexState
    .lastInitializedAt,

    lastError:
    stateIndexState
    .lastError,

    timestamp:
    Date.now()

  });

}



// =====================================
// STATE API
// =====================================

const RIGOStateRuntime =
safeFreeze({



  // ===================================
  // LAYER
  // ===================================

  initialize:
  initializeStateLayer,



  snapshot:
  createStateSnapshot,



  validate:
  validateStateLayer,



  // ===================================
  // SAFE ACCESSORS
  // ===================================

  get appState(){

    return globalThis.RIGOAppState;

  },



  get stateManager(){

    return globalThis.RIGOStateManager;

  },



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
        getContainerService(
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
        getContainerService(
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
        getContainerService(
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
        getContainerService(
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
        getContainerService(
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

        return manager.update(

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
        getContainerService(
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

        return manager.remove(
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
        getContainerService(
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

        return manager.rollback(
          version
        );

      },

      false

    );

  }

});



// =====================================
// EXPORTS
// =====================================

export {

  stateIndexState,

  validateStateLayer,

  initializeStateLayer,

  createStateSnapshot,

  RIGOStateRuntime

};

export default
RIGOStateRuntime;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOStateRuntime",

    {

      value:
      RIGOStateRuntime,

      writable:false,

      configurable:false

    }

  );

}



// =====================================
// SAFE AUTO INITIALIZATION
// =====================================

if(
  typeof globalThis !==
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
