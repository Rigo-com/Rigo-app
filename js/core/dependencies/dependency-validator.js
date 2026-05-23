// =====================================
// DEPENDENCY VALIDATOR
// =====================================



// =====================================
// HELPERS
// =====================================

function validateDependencyStructure(
  dependency
){

  return (

    dependency &&

    typeof dependency ===
    "object" &&

    typeof dependency.name ===
    "string"

  );

}



// =====================================
// CIRCULAR VALIDATION
// =====================================

function validateCircularDependencies(){

  const visited =
  new Set();

  const recursionStack =
  new Set();

  function traverse(
    dependencyName
  ){

    if(
      recursionStack.has(
        dependencyName
      )
    ){

      return false;

    }

    if(
      visited.has(
        dependencyName
      )
    ){

      return true;

    }

    visited.add(
      dependencyName
    );

    recursionStack.add(
      dependencyName
    );

    const dependencies =

      appDependencyRegistry
      .dependencyGraph
      .get(
        dependencyName
      )

      ||

      new Set();

    for(
      const dependency
      of dependencies
    ){

      const valid =
      traverse(
        dependency
      );

      if(!valid){

        return false;

      }

    }

    recursionStack.delete(
      dependencyName
    );

    return true;

  }

  for(
    const dependencyName

    of

    appDependencyRegistry
    .dependencyGraph
    .keys()

  ){

    const valid =
    traverse(
      dependencyName
    );

    if(!valid){

      return false;

    }

  }

  return true;

}



// =====================================
// MISSING DEPENDENCIES
// =====================================

function validateMissingDependencies(){

  const dependencies = [

    ...appDependencyRegistry
    .dependencies
    .values()

  ];

  for(
    const dependency
    of dependencies
  ){

    const requiredDependencies =

      dependency
      .dependencies

      ||

      [];

    for(
      const requiredDependency
      of requiredDependencies
    ){

      const exists =

        appDependencyRegistry
        .dependencies
        .has(
          requiredDependency
        );

      if(!exists){

        return false;

      }

    }

  }

  return true;

}



// =====================================
// VALIDATE REGISTRY
// =====================================

async function validateDependencyRegistry(){

  appDependencyRegistry
  .diagnostics
  .validations++;

  appDependencyRegistry
  .lastValidationAt =
  Date.now();



  // ===================================
  // CIRCULAR
  // ===================================

  const validCircular =
  validateCircularDependencies();

  if(!validCircular){

    return false;

  }



  // ===================================
  // MISSING
  // ===================================

  const validMissing =
  validateMissingDependencies();

  if(!validMissing){

    return false;

  }



  // ===================================
  // RESOLVERS
  // ===================================

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

      const validStructure =
      validateDependencyStructure(
        dependency
      );

      if(!validStructure){

        failDependency(
          dependency?.name
        );

        return false;

      }

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



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.validateDependencyRegistry =
  validateDependencyRegistry;

  window.validateCircularDependencies =
  validateCircularDependencies;

  window.validateMissingDependencies =
  validateMissingDependencies;

}
