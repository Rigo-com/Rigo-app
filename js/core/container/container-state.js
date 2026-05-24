// =====================================
// RIGO AI
// CONTAINER STATE
// =====================================



// =====================================
// CONTAINER STATE
// =====================================

const dependencyContainerState =
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

      dependencyContainerState
      .initialized,

    services:

      dependencyContainerState
      .services
      .size,

    singletons:

      dependencyContainerState
      .singletons
      .size,

    scopes:

      dependencyContainerState
      .scopes
      .size,

    resolutionStack:[

      ...dependencyContainerState
      .resolutionStack

    ],

    diagnostics:{

      ...dependencyContainerState
      .diagnostics

    },

    lastResolvedAt:

      dependencyContainerState
      .lastResolvedAt

  });

}



// =====================================
// RESET STATE
// =====================================

function resetContainerState(){

  dependencyContainerState
  .initialized =
  false;

  dependencyContainerState
  .services
  .clear();

  dependencyContainerState
  .singletons
  .clear();

  dependencyContainerState
  .scopes
  .clear();

  dependencyContainerState
  .resolutionStack
  .length = 0;

  dependencyContainerState
  .diagnostics
  .registered = 0;

  dependencyContainerState
  .diagnostics
  .resolved = 0;

  dependencyContainerState
  .diagnostics
  .failed = 0;

  dependencyContainerState
  .diagnostics
  .removed = 0;

  dependencyContainerState
  .diagnostics
  .scopes = 0;

  dependencyContainerState
  .lastResolvedAt =
  null;

  return true;

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.dependencyContainerState =
  dependencyContainerState;

  window.freezeContainerObject =
  freezeContainerObject;

  window.createContainerStateSnapshot =
  createContainerStateSnapshot;

  window.resetContainerState =
  resetContainerState;

}
