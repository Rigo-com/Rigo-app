// =====================================
// RIGO AI
// DEPENDENCY REGISTRY
// =====================================



// =====================================
// HELPERS
// =====================================

function normalizeDependencyName(
  dependencyName
){

  return String(
    dependencyName || ""
  )
  .trim()
  .toLowerCase();

}



function createDependencyDefinition({

  name,
  resolver = null,
  dependencies = []

}){

  return freezeContainerObject({

    name,

    resolver:

      typeof resolver ===
      "function"

      ?

      resolver

      :

      null,

    dependencies,

    registeredAt:
    Date.now()

  });

}



// =====================================
// REGISTER
// =====================================

function registerDependency(
  dependencyName,
  resolver = null,
  dependencies = []
){

  const normalizedName =
  normalizeDependencyName(
    dependencyName
  );

  if(!normalizedName){

    return false;

  }

  const normalizedDependencies =

    Array.isArray(
      dependencies
    )

    ?

    dependencies
    .map((dependency) => {

      return normalizeDependencyName(
        dependency
      );

    })
    .filter(Boolean)

    :

    [];

  const definition =
  createDependencyDefinition({

    name:
    normalizedName,

    resolver,

    dependencies:
    normalizedDependencies

  });

  appDependencyRegistry
  .dependencies
  .set(

    normalizedName,

    definition

  );



  // ===================================
  // GRAPH
  // ===================================

  appDependencyRegistry
  .dependencyGraph
  .set(

    normalizedName,

    new Set(
      normalizedDependencies
    )

  );

  normalizedDependencies
  .forEach((dependency) => {

    if(

      !appDependencyRegistry
      .reverseDependencies
      .has(
        dependency
      )

    ){

      appDependencyRegistry
      .reverseDependencies
      .set(

        dependency,

        new Set()

      );

    }

    appDependencyRegistry
    .reverseDependencies
    .get(
      dependency
    )
    .add(
      normalizedName
    );

  });



  // ===================================
  // DIAGNOSTICS
  // ===================================

  appDependencyRegistry
  .diagnostics
  .registered++;

  return true;

}



// =====================================
// RESOLVE
// =====================================

function resolveDependency(
  dependencyName
){

  const normalizedName =
  normalizeDependencyName(
    dependencyName
  );

  if(!normalizedName){

    return false;

  }

  appDependencyRegistry
  .resolved
  .add(
    normalizedName
  );

  appDependencyRegistry
  .failed
  .delete(
    normalizedName
  );

  appDependencyRegistry
  .lastResolvedAt =
  Date.now();

  appDependencyRegistry
  .diagnostics
  .resolved++;

  const waitingResolvers =

    appDependencyRegistry
    .waiting
    .get(
      normalizedName
    );

  if(waitingResolvers){

    waitingResolvers
    .forEach((resolve) => {

      try{

        resolve(true);

      }

      catch(error){}

    });

    appDependencyRegistry
    .waiting
    .delete(
      normalizedName
    );

  }

  return true;

}



// =====================================
// FAIL
// =====================================

function failDependency(
  dependencyName
){

  const normalizedName =
  normalizeDependencyName(
    dependencyName
  );

  if(!normalizedName){

    return false;

  }

  appDependencyRegistry
  .failed
  .add(
    normalizedName
  );

  appDependencyRegistry
  .resolved
  .delete(
    normalizedName
  );

  appDependencyRegistry
  .diagnostics
  .failed++;

  return true;

}



// =====================================
// REMOVE
// =====================================

function removeDependency(
  dependencyName
){

  const normalizedName =
  normalizeDependencyName(
    dependencyName
  );

  if(!normalizedName){

    return false;

  }

  appDependencyRegistry
  .dependencies
  .delete(
    normalizedName
  );

  appDependencyRegistry
  .resolved
  .delete(
    normalizedName
  );

  appDependencyRegistry
  .failed
  .delete(
    normalizedName
  );

  appDependencyRegistry
  .waiting
  .delete(
    normalizedName
  );

  appDependencyRegistry
  .dependencyGraph
  .delete(
    normalizedName
  );

  appDependencyRegistry
  .reverseDependencies
  .delete(
    normalizedName
  );

  return true;

}



// =====================================
// IS RESOLVED
// =====================================

function isDependencyResolved(
  dependencyName
){

  return appDependencyRegistry
  .resolved
  .has(

    normalizeDependencyName(
      dependencyName
    )

  );

}



// =====================================
// GET DEPENDENCY
// =====================================

function getDependency(
  dependencyName
){

  return (

    appDependencyRegistry
    .dependencies
    .get(

      normalizeDependencyName(
        dependencyName
      )

    )

    ||

    null

  );

}



// =====================================
// GET ALL
// =====================================

function getAllDependencies(){

  return freezeContainerObject([

    ...appDependencyRegistry
    .dependencies
    .values()

  ]);

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.normalizeDependencyName =
  normalizeDependencyName;

  window.registerDependency =
  registerDependency;

  window.resolveDependency =
  resolveDependency;

  window.failDependency =
  failDependency;

  window.removeDependency =
  removeDependency;

  window.isDependencyResolved =
  isDependencyResolved;

  window.getDependency =
  getDependency;

  window.getAllDependencies =
  getAllDependencies;

}
