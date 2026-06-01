// =====================================
// RIGO AI
// SERVICES INDEX
// ENTRY POINT
// =====================================



// =====================================
// IMPORTS
// =====================================

import ServiceTypes
from "./service-types.js";

import serviceState
from "./service-state.js";

import ServiceRuntime
from "./service-runtime.js";

import ServiceManager
from "./service-manager.js";



// =====================================
// SHORTCUTS
// =====================================

async function initializeServices(){

  return ServiceManager
  .initialize();

}



async function bootServices(
  container
){

  return ServiceManager
  .boot(
    container
  );

}



async function shutdownServices(){

  return ServiceManager
  .shutdown();

}



async function resetServices(){

  return ServiceManager
  .reset();

}



// =====================================
// SNAPSHOT
// =====================================

function createServicesSnapshot(){

  return Object.freeze({

    manager:

      ServiceManager
      .diagnostics(),

    runtime:

      ServiceRuntime
      .snapshot(),

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const Services =
Object.freeze({

  types:
  ServiceTypes,

  state:
  serviceState,

  runtime:
  ServiceRuntime,

  manager:
  ServiceManager,

  initialize:
  initializeServices,

  boot:
  bootServices,

  shutdown:
  shutdownServices,

  reset:
  resetServices,

  snapshot:
  createServicesSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  ServiceTypes,

  serviceState,

  ServiceRuntime,

  ServiceManager,

  initializeServices,

  bootServices,

  shutdownServices,

  resetServices,

  createServicesSnapshot,

  Services

};

export default
Services;
