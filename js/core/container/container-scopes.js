// =====================================
// RIGO AI
// CONTAINER SCOPES
// =====================================



// =====================================
// IMPORTS
// =====================================

import {
  CONTAINER_LIFECYCLE
}
from "./container-types.js";



// =====================================
// HELPERS
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



function isValidContainerScope(
  scope
){

  const normalizedScope =
  normalizeContainerScope(
    scope
  );

  return Object.values(
    CONTAINER_LIFECYCLE
  )
  .includes(
    normalizedScope
  );

}



function getDefaultContainerScope(){

  return CONTAINER_LIFECYCLE
  .SINGLETON;

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

  normalizeContainerScope,

  isValidContainerScope,

  getDefaultContainerScope,

  RIGOContainerScopes

};

export default
RIGOContainerScopes;
