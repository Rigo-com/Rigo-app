// =====================================
// RIGO AI
// CONTAINER SCOPES
// =====================================



// =====================================
// NORMALIZE
// =====================================

function normalizeContainerScope(
  scope
){

  return String(
    scope || ""
  )
  .trim()
  .toLowerCase();

}



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

  const normalizedService =
  normalizeServiceName(
    serviceName
  );

  if(!normalizedService){

    return false;

  }

  return (

    dependencyContainerState
    .resolutionStack
    .includes(
      normalizedService
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
  normalizeContainerScope(
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



// =====================================
// REMOVE SCOPE
// =====================================

function removeScopeContainer(
  scope
){

  const normalizedScope =
  normalizeContainerScope(
    scope
  );

  if(!normalizedScope){

    return false;

  }

  return dependencyContainerState
  .scopes
  .delete(
    normalizedScope
  );

}



// =====================================
// CLEAR SCOPES
// =====================================

function clearScopeContainers(){

  dependencyContainerState
  .scopes
  .clear();

  dependencyContainerState
  .diagnostics
  .scopes = 0;

  return true;

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.normalizeContainerScope =
  normalizeContainerScope;

  window.detectCircularDependency =
  detectCircularDependency;

  window.getScopeContainer =
  getScopeContainer;

  window.removeScopeContainer =
  removeScopeContainer;

  window.clearScopeContainers =
  clearScopeContainers;

}
