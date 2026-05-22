// =====================================
// DEPENDENCY WAITERS
// =====================================



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
  String(
    dependencyName || ""
  )
  .trim()
  .toLowerCase();

  if(!normalizedName){

    return false;

  }

  if(

    isDependencyResolved(
      normalizedName
    )

  ){

    return true;

  }

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

    appDependencyRegistry
    .waiting
    .get(
      normalizedName
    )
    .add(
      resolve
    );

    setTimeout(() => {

      resolve(false);

    },

    timeout);

  });

}
