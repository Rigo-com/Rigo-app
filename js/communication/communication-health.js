// =====================================
// RIGO AI
// COMMUNICATION HEALTH
// HEALTH MONITOR LAYER
// =====================================

import {

  getCommunicationSnapshot,

  getCommunicationDiagnostics

}
from "./communication-state.js";



// =====================================
// HEALTH STATUS
// =====================================

function getHealthStatus(){

  const state =

    getCommunicationSnapshot();

  let status =
  "healthy";

  if(
    !state.initialized
  ){

    status =
    "inactive";

  }

  else if(
    !state.healthy
  ){

    status =
    "unhealthy";

  }

  else if(
    state.processing
  ){

    status =
    "processing";

  }

  else if(
    state.streaming
  ){

    status =
    "streaming";

  }

  return Object.freeze({

    status,

    initialized:
    state.initialized,

    healthy:
    state.healthy,

    processing:
    state.processing,

    streaming:
    state.streaming,

    activeRequests:
    state.activeRequests,

    abortControllers:
    state.abortControllers

  });

}



// =====================================
// DIAGNOSTICS
// =====================================

function getDiagnostics(){

  return Object.freeze(

    getCommunicationDiagnostics()

  );

}



// =====================================
// HEALTH REPORT
// =====================================

function getHealthReport(){

  return Object.freeze({

    health:
    getHealthStatus(),

    diagnostics:
    getDiagnostics(),

    snapshot:
    getCommunicationSnapshot()

  });

}



// =====================================
// IS HEALTHY
// =====================================

function isHealthy(){

  return (

    getCommunicationSnapshot()
    .healthy === true

  );

}



// =====================================
// PUBLIC API
// =====================================

const CommunicationHealth =
Object.freeze({

  status:
  getHealthStatus,

  diagnostics:
  getDiagnostics,

  report:
  getHealthReport,

  isHealthy

});



// =====================================
// EXPORTS
// =====================================

export {

  getHealthStatus,

  getDiagnostics,

  getHealthReport,

  isHealthy,

  CommunicationHealth

};

export default
CommunicationHealth;
