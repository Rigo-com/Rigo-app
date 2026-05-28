// =====================================
// RIGO AI
// CORE CONTAINER
// FINAL STABILIZED EDITION
// =====================================



// =====================================
// PUBLIC API
// =====================================

const RIGOContainer =
Object.freeze({



  // ===================================
  // CORE
  // ===================================

  initialize:
  initializeContainer,



  reset:
  resetContainer,



  diagnostics:
  getContainerDiagnostics,



  healthcheck:
  getContainerHealthReport,



  // ===================================
  // REGISTRY
  // ===================================

  register:
  registerService,



  remove:
  removeService,



  has:
  hasRegisteredService,



  get:
  getRegisteredService,



  services:
  getRegisteredServices,



  // ===================================
  // RESOLUTION
  // ===================================

  resolve:
  resolveService,



  resolveServices:
  resolveServices,



  // ===================================
  // SCOPES
  // ===================================

  getScope:
  getScopeContainer,



  removeScope:
  removeScopeContainer,



  clearScopes:
  clearScopeContainers,



  // ===================================
  // LIFECYCLES
  // ===================================

  lifecycles:
  CONTAINER_LIFECYCLE

});



// =====================================
// EXPORTS
// =====================================

export {

  RIGOContainer

};



export default
RIGOContainer;



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOContainer",

    {

      value:
      RIGOContainer,

      writable:false,

      configurable:false,

      enumerable:false

    }

  );

}
