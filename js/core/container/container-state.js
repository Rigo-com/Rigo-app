// =====================================
// RIGO AI
// CONTAINER STATE
// FINAL STABILIZED EDITION
// =====================================



// =====================================
// CONTAINER STATE
// =====================================

const containerState =
Object.seal({

  initialized:false,

  services:
  new Map(),

  singletons:
  new Map(),

  scopes:
  new Map(),

  resolutionStack:[],

  diagnostics:{

    registered:0,

    resolved:0,

    failed:0,

    removed:0,

    scopes:0

  },

  lastResolvedAt:null

});



// =====================================
// IMMUTABLE
// =====================================

function freezeContainerObject(
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

      freezeContainerObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// SNAPSHOT
// =====================================

function createContainerStateSnapshot(){

  return freezeContainerObject({

    initialized:

      containerState
      .initialized,

    services:

      containerState
      .services
      .size,

    singletons:

      containerState
      .singletons
      .size,

    scopes:

      containerState
      .scopes
      .size,

    resolutionStack:[

      ...containerState
      .resolutionStack

    ],

    diagnostics:{

      ...containerState
      .diagnostics

    },

    lastResolvedAt:

      containerState
      .lastResolvedAt

  });

}



// =====================================
// RESET STATE
// =====================================

function resetContainerState(){

  containerState
  .initialized =
  false;

  containerState
  .services
  .clear();

  containerState
  .singletons
  .clear();

  containerState
  .scopes
  .clear();

  containerState
  .resolutionStack
  .length = 0;

  containerState
  .diagnostics
  .registered = 0;

  containerState
  .diagnostics
  .resolved = 0;

  containerState
  .diagnostics
  .failed = 0;

  containerState
  .diagnostics
  .removed = 0;

  containerState
  .diagnostics
  .scopes = 0;

  containerState
  .lastResolvedAt =
  null;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const RIGOContainerState =
Object.freeze({

  snapshot:
  createContainerStateSnapshot,

  reset:
  resetContainerState

});



// =====================================
// EXPORTS
// =====================================

export {

  containerState,

  freezeContainerObject,

  createContainerStateSnapshot,

  resetContainerState,

  RIGOContainerState

};

export default
RIGOContainerState;
