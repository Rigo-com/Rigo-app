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

import Analytics
from "./analytics/index.js";

import Files
from "./files/index.js";



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

    analytics:

      typeof Analytics
      ?.snapshot ===
      "function"

      ?

      Analytics
      .snapshot()

      :

      null,

    files:

      typeof Files
      ?.snapshot ===
      "function"

      ?

      Files
      .snapshot()

      :

      null,

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

  analytics:
  Analytics,

  files:
  Files,

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

  Analytics,

  Files,

  initializeServices,

  bootServices,

  shutdownServices,

  resetServices,

  createServicesSnapshot,

  Services

};

export default
Services;
