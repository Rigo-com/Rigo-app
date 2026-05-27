// =====================================
// RIGO AI
// SEARCH STATE
// OPTIMIZED FINAL EDITION
// =====================================



const searchState =
Object.seal({

  initialized:false,

  searching:false,

  currentState:
  "idle",

  lastQuery:null,

  lastSearchAt:null,

  activeSearchToken:null,



  // ===================================
  // METRICS
  // ===================================

  metrics:
  {

    totalSearches:0,

    failedSearches:0,

    cachedHits:0,

    abortedSearches:0,

    averageLatency:0,

    lastLatency:0

  },



  // ===================================
  // RUNTIME
  // ===================================

  runtime:
  {

    activeSearches:0,

    pendingSearches:0

  }

});



// =====================================
// SEARCH STATE HELPERS
// =====================================

function resetSearchState(){

  searchState.searching =
  false;

  searchState.currentState =
  "idle";

  searchState.lastQuery =
  null;

  searchState.activeSearchToken =
  null;

  searchState.runtime
  .activeSearches = 0;

  searchState.runtime
  .pendingSearches = 0;

  return true;

}



function incrementSearchCount(){

  searchState.metrics
  .totalSearches++;

  return true;

}



function incrementFailedSearches(){

  searchState.metrics
  .failedSearches++;

  return true;

}



function incrementCachedHits(){

  searchState.metrics
  .cachedHits++;

  return true;

}



function incrementAbortedSearches(){

  searchState.metrics
  .abortedSearches++;

  return true;

}



function updateSearchLatency(
  latency = 0
){

  const normalizedLatency =
  Math.max(
    0,
    Number(latency) || 0
  );

  searchState.metrics
  .lastLatency =
  normalizedLatency;

  const total =
  searchState.metrics
  .totalSearches;

  const currentAverage =
  searchState.metrics
  .averageLatency;

  searchState.metrics
  .averageLatency =

    total <= 1

    ? normalizedLatency

    :

    (
      (
        currentAverage *
        (total - 1)
      )

      +

      normalizedLatency

    ) / total;

  return normalizedLatency;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getSearchStateDiagnostics(){

  return {

    initialized:
    searchState
    .initialized,

    searching:
    searchState
    .searching,

    currentState:
    searchState
    .currentState,

    lastSearchAt:
    searchState
    .lastSearchAt,

    metrics:
    {

      ...searchState
      .metrics

    },

    runtime:
    {

      ...searchState
      .runtime

    }

  };

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(typeof globalThis === "object"){

  globalThis.searchState =
  searchState;

}



// =====================================
// EXPORTS
// =====================================

export {

  searchState,

  resetSearchState,

  incrementSearchCount,

  incrementFailedSearches,

  incrementCachedHits,

  incrementAbortedSearches,

  updateSearchLatency,

  getSearchStateDiagnostics

};



// =====================================
// DEFAULT EXPORT
// =====================================

export default searchState;
