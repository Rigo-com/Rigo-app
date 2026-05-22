// =====================================
// DEPENDENCY REGISTRY
// =====================================

const appDependencyRegistry =
Object.seal({

  dependencies:
  new Map(),

  resolved:
  new Set(),

  failed:
  new Set(),

  waiting:
  new Map()

});



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



async function validateDependencyRegistry(){

  const dependencies = [

    ...appDependencyRegistry
    .dependencies
    .values()

  ];

  for(
    const dependency
    of dependencies
  ){

    try{

      if(

        typeof dependency
        .resolver ===
        "function"

      ){

        const resolved =
        await dependency
        .resolver();

        if(resolved){

          resolveDependency(
            dependency.name
          );

        }

        else{

          failDependency(
            dependency.name
          );

          return false;

        }

      }

    }

    catch(error){

      failDependency(
        dependency.name
      );

      return false;

    }

  }

  return true;

}



function getDependencyDiagnostics(){

  return {

    registered:

      appDependencyRegistry
      .dependencies
      .size,

    resolved:[

      ...appDependencyRegistry
      .resolved

    ],

    failed:[

      ...appDependencyRegistry
      .failed

    ],

    waiting:

      appDependencyRegistry
      .waiting
      .size

  };

}
