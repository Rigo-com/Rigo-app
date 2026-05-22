// =====================================
// RIGO AI
// CONTAINER SCOPES
// =====================================



// =====================================
// CIRCULAR CHECK
// =====================================

function detectCircularDependency(
  serviceName
){

  if(

    !DEPENDENCY_CONTAINER_CONFIG
    .ENABLE_CIRCULAR_PROTECTION

  ){

    return false;

  }

  return (

    dependencyContainerState
    .resolutionStack
    .includes(
      serviceName
    )

  );

}



// =====================================
// SCOPES
// =====================================

function getScopeContainer(
  scope
){

  const normalizedScope =
  normalizeServiceName(
    scope
  );

  if(
    !normalizedScope
  ){

    return null;

  }

  if(

    !dependencyContainerState
    .scopes
    .has(
      normalizedScope
    )

  ){

    dependencyContainerState
    .scopes
    .set(

      normalizedScope,

      new Map()

    );

    dependencyContainerState
    .diagnostics
    .scopes++;

  }

  return dependencyContainerState
  .scopes
  .get(
    normalizedScope
  );

}
