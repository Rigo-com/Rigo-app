// =====================================
// RIGO AI
// SERVICE RESOLUTION
// CONTAINER ADAPTER LAYER
// =====================================



// =====================================
// IMPORTS
// =====================================

import {
  RIGOContainer
}
from "../core/container/index.js";



// =====================================
// RESOLVE
// =====================================

async function resolveService(
  container,
  serviceName,
  scope = "global"
){

  return RIGOContainer
  .resolve(
    serviceName,
    scope
  );

}



// =====================================
// RESOLVE MANY
// =====================================

async function resolveServices(
  container,
  serviceNames = [],
  scope = "global"
){

  return RIGOContainer
  .resolveMany(
    serviceNames,
    scope
  );

}



// =====================================
// EXPORTS
// =====================================

export {

  resolveService,

  resolveServices

};
