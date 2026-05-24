// =====================================
// RIGO AI
// DEPENDENCY WAITERS
// =====================================



// =====================================
// NORMALIZE
// =====================================

function normalizeWaitingDependency(
  dependencyName
){

  return normalizeDependencyName(
    dependencyName
  );

}



// =====================================
// CLEANUP WAITER
// =====================================

function cleanupDependencyWaiter(
  dependencyName,
  resolver
){

  const waitingResolvers =

    appDependencyRegistry
    .waiting
    .get(
      dependencyName
    );

  if(!waitingResolvers){

    return false;

  }

  waitingResolvers
  .delete(
    resolver
  );

  if(
    waitingResolvers
    .size <= 0
  ){

    appDependencyRegistry
    .waiting
    .delete(
      dependencyName
    );

  }

  appDependencyRegistry
  .diagnostics
  .waiting =

    appDependencyRegistry
    .waiting
    .size;

  return true;

}



// =====================================
// WAIT FOR DEPENDENCY
// =====================================

async function waitForDependency(
  dependencyName,
  timeout =
  APP_CORE_CONFIG
  .DEPENDENCY_TIMEOUT
){

  const normalizedName =
  normalizeWaitingDependency(
    dependencyName
  );

  if(!normalizedName){

    return false;

  }



  // ===================================
  // ALREADY RESOLVED
  // ===================================

  if(

    isDependencyResolved(
      normalizedName
    )

  ){

    return true;

  }



  // ===================================
  // FAILED
  // ===================================

  if(

    appDependencyRegistry
    .failed
    .has(
      normalizedName
    )

  ){

    return false;

  }



  // ===================================
  // WAIT
  // ===================================

  return new Promise((resolve) => {

    if(

      !appDependencyRegistry
      .waiting
      .has(
        normalizedName
      )

    ){

      appDependencyRegistry
      .waiting
      .set(

        normalizedName,

        new Set()

      );

    }

    const waitingResolvers =

      appDependencyRegistry
      .waiting
      .get(
        normalizedName
      );

    function resolver(
      result
    ){

      clearTimeout(
        timeoutId
      );

      cleanupDependencyWaiter(

        normalizedName,

        resolver

      );

      resolve(result);

    }

    waitingResolvers
    .add(
      resolver
    );

    appDependencyRegistry
    .diagnostics
    .waiting =

      appDependencyRegistry
      .waiting
      .size;

    const timeoutId =
    setTimeout(() => {

      resolver(false);

    },

    timeout);

  });

}



// =====================================
// WAIT FOR MULTIPLE
// =====================================

async function waitForDependencies(
  dependencies = [],
  timeout =
  APP_CORE_CONFIG
  .DEPENDENCY_TIMEOUT
){

  const normalizedDependencies =

    Array.isArray(
      dependencies
    )

    ?

    dependencies
    .map((dependency) => {

      return normalizeWaitingDependency(
        dependency
      );

    })
    .filter(Boolean)

    :

    [];

  const results =
  await Promise.all(

    normalizedDependencies
    .map((dependency) => {

      return waitForDependency(
        dependency,
        timeout
      );

    })

  );

  return results.every(Boolean);

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.waitForDependency =
  waitForDependency;

  window.waitForDependencies =
  waitForDependencies;

}
