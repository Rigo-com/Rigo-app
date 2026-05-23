// =====================================
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

  appDependencyRegistry
  .dependencies
  .set(

    normalizedName,

    {

      name:
      normalizedName,

      resolver,

      dependencies:

        Array.isArray(
          dependencies
        )

        ? dependencies

        : [],

      registeredAt:
      Date.now()

    }

  );



  // ===================================
  // GRAPH
  // ===================================

  appDependencyRegistry
  .dependencyGraph
  .set(

    normalizedName,

    new Set(
      dependencies
    )

  );

  dependencies
  .forEach((dependency) => {

    const normalizedDependency =
    normalizeDependencyName(
      dependency
    );

    if(

      !appDependencyRegistry
      .reverseDependencies
      .has(
        normalizedDependency
      )

    ){

      appDependencyRegistry
      .reverseDependencies
      .set(

        normalizedDependency,

        new Set()

      );

    }

    appDependencyRegistry
    .reverseDependencies
    .get(
      normalizedDependency
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

  return [

    ...appDependencyRegistry
    .dependencies
    .values()

  ];

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.registerDependency =
  registerDependency;

  window.resolveDependency =
  resolveDependency;

  window.failDependency =
  failDependency;

  window.isDependencyResolved =
  isDependencyResolved;

  window.getDependency =
  getDependency;

  window.getAllDependencies =
  getAllDependencies;

}
