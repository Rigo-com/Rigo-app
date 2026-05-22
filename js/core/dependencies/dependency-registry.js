// =====================================
// DEPENDENCY REGISTRY
// =====================================



// =====================================
// REGISTER
// =====================================

function registerDependency(
  dependencyName,
  resolver = null
){

  const normalizedName =
  String(
    dependencyName || ""
  )
  .trim()
  .toLowerCase();

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

      registeredAt:
      Date.now()

    }

  );

  return true;

}



// =====================================
// RESOLVE
// =====================================

function resolveDependency(
  dependencyName
){

  const normalizedName =
  String(
    dependencyName || ""
  )
  .trim()
  .toLowerCase();

  if(!normalizedName){

    return false;

  }

  appDependencyRegistry
  .resolved
  .add(
    normalizedName
  );

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
  String(
    dependencyName || ""
  )
  .trim()
  .toLowerCase();

  if(!normalizedName){

    return false;

  }

  appDependencyRegistry
  .failed
  .add(
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

    String(
      dependencyName || ""
    )
    .trim()
    .toLowerCase()

  );

}
