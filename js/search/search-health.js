// =====================================
// RIGO AI
// SEARCH HEALTH
// HEALTH MONITOR LAYER
// =====================================

import {

  getSearchSnapshot,

  getSearchDiagnostics

}
from "./search-state.js";



// =====================================
// HEALTH STATUS
// =====================================

function getHealthStatus(){

  const state =

    getSearchSnapshot();

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
    state.searching
  ){

    status =
    "searching";

  }

  return Object.freeze({

    status,

    initialized:
    state.initialized,

    healthy:
    state.healthy,

    searching:
    state.searching,

    activeSearches:
    state.activeSearches

  });

}



// =====================================
// DIAGNOSTICS
// =====================================

function getDiagnostics(){

  return Object.freeze(

    getSearchDiagnostics()

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
    getSearchSnapshot()

  });

}



// =====================================
// IS HEALTHY
// =====================================

function isHealthy(){

  return (

    getSearchSnapshot()
    .healthy === true

  );

}



// =====================================
// PUBLIC API
// =====================================

const SearchHealth =
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

  SearchHealth

};

export default
SearchHealth;
