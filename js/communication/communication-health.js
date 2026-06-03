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

import {
  COMMUNICATION_STATES
}
from "./communication-config.js";



// =====================================
// HEALTH STATUS
// =====================================

function getHealthStatus(){

  const state =

    getCommunicationSnapshot();

  let status =
  "healthy";

  if(
    state.destroyed
  ){

    status =
    "destroyed";

  }

  else if(
    !state.initialized
  ){

    status =
    "inactive";

  }

  else if(
    state.state ===

    COMMUNICATION_STATES
    .FAILED
  ){

    status =
    "failed";

  }

  else if(
    state.recovering
  ){

    status =
    "recovering";

  }

  return Object.freeze({

    status,

    initialized:
    state.initialized,

    processing:
    state.processing,

    streaming:
    state.streaming,

    recovering:
    state.recovering,

    typing:
    state.typing,

    runtimeState:
    state.state

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

  const health =

    getHealthStatus();

  return (

    health.status ===
    "healthy"

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
