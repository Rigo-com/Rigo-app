// =====================================
// RIGO AI
// CONTAINER SCOPES
// FINAL STABILIZED EDITION
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

    !CONTAINER_CONFIG
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

    containerState
    .resolutionStack
    .includes(
      normalizedService
    )

  );

}



// =====================================
// GET SCOPE
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

    !containerState
    .scopes
    .has(
      normalizedScope
    )

  ){

    if(

      containerState
      .scopes
      .size >=

      CONTAINER_CONFIG
      .MAX_SCOPES

    ){

      return null;

    }

    containerState
    .scopes
    .set(

      normalizedScope,

      new Map()

    );

    containerState
    .diagnostics
    .scopes++;

  }

  return containerState
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

  return containerState
  .scopes
  .delete(
    normalizedScope
  );

}



// =====================================
// CLEAR SCOPES
// =====================================

function clearScopeContainers(){

  containerState
  .scopes
  .clear();

  containerState
  .diagnostics
  .scopes = 0;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const RIGOContainerScopes =
Object.freeze({

  normalize:
  normalizeContainerScope,

  detectCircular:
  detectCircularDependency,

  get:
  getScopeContainer,

  remove:
  removeScopeContainer,

  clear:
  clearScopeContainers

});



// =====================================
// EXPORTS
// =====================================

export {

  normalizeContainerScope,

  detectCircularDependency,

  getScopeContainer,

  removeScopeContainer,

  clearScopeContainers,

  RIGOContainerScopes

};

export default
RIGOContainerScopes;
