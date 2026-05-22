// =====================================
// DEPENDENCY VALIDATOR
// =====================================



// =====================================
// VALIDATE REGISTRY
// =====================================

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
