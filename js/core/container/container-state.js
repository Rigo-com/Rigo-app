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

}
