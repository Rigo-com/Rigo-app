// =====================================
// RIGO AI
// CONTAINER SCOPES
// =====================================

const DEFAULT_CONTAINER_SCOPE =
"global";


// =====================================
// HELPERS
// =====================================

function normalizeContainerScope(
  scope = DEFAULT_CONTAINER_SCOPE
){

  const normalized =
  String(
    scope ||
    DEFAULT_CONTAINER_SCOPE
  )
  .trim()
  .toLowerCase();

  return normalized ||
  DEFAULT_CONTAINER_SCOPE;

}


function isValidContainerScope(
  scope
){

  const normalizedScope =
  normalizeContainerScope(
    scope
  );

  return /^[a-z0-9:_-]+$/
  .test(
    normalizedScope
  );

}


function getDefaultContainerScope(){

  return DEFAULT_CONTAINER_SCOPE;

}


// =====================================
// PUBLIC API
// =====================================

const RIGOContainerScopes =
Object.freeze({

  normalize:
  normalizeContainerScope,

  validate:
  isValidContainerScope,

  getDefault:
  getDefaultContainerScope

});


// =====================================
// EXPORTS
// =====================================

export {

  DEFAULT_CONTAINER_SCOPE,

  normalizeContainerScope,

  isValidContainerScope,

  getDefaultContainerScope,

  RIGOContainerScopes

};

export default
RIGOContainerScopes;
