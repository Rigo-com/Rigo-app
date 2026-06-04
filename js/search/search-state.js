// =====================================
// RIGO AI
// SEARCH STATE
// FOUNDATION STATE LAYER
// =====================================



// =====================================
// SEARCH STATE
// =====================================

const searchState =
Object.seal({

  initialized:false,

  searching:false,

  healthy:true,

  activeSearches:0,

  diagnostics:
  Object.seal({

    searches:0,

    completed:0,

    failed:0,

    aborted:0,

    cacheHits:0,

    cacheMisses:0

  })

});



// =====================================
// HELPERS
// =====================================

function createSnapshot(){

  return {

    initialized:
    searchState
    .initialized,

    searching:
    searchState
    .searching,

    healthy:
    searchState
    .healthy,

    activeSearches:
    searchState
    .activeSearches,

    diagnostics:{

      ...searchState
      .diagnostics

    }

  };

}



// =====================================
// FLAGS
// =====================================

function setInitialized(
  value
){

  searchState
  .initialized =
  Boolean(value);

}



function setSearching(
  value
){

  searchState
  .searching =
  Boolean(value);

}



function setHealthy(
  value
){

  searchState
  .healthy =
  Boolean(value);

}



// =====================================
// ACTIVE SEARCHES
// =====================================

function incrementActiveSearches(){

  searchState
  .activeSearches++;

  return true;

}



function decrementActiveSearches(){

  searchState
  .activeSearches =

  Math.max(

    0,

    searchState
    .activeSearches - 1

  );

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function incrementSearches(){

  searchState
  .diagnostics
  .searches++;

}



function incrementCompleted(){

  searchState
  .diagnostics
  .completed++;

}



function incrementFailed(){

  searchState
  .diagnostics
  .failed++;

}



function incrementAborted(){

  searchState
  .diagnostics
  .aborted++;

}



function incrementCacheHits(){

  searchState
  .diagnostics
  .cacheHits++;

}



function incrementCacheMisses(){

  searchState
  .diagnostics
  .cacheMisses++;

}



// =====================================
// SNAPSHOT
// =====================================

function getSearchSnapshot(){

  return Object.freeze(
    createSnapshot()
  );

}



// =====================================
// DIAGNOSTICS SNAPSHOT
// =====================================

function getSearchDiagnostics(){

  return Object.freeze({

    ...searchState
    .diagnostics

  });

}



// =====================================
// RESET
// =====================================

function resetSearchState(){

  searchState
  .initialized = false;

  searchState
  .searching = false;

  searchState
  .healthy = true;

  searchState
  .activeSearches = 0;

  searchState
  .diagnostics
  .searches = 0;

  searchState
  .diagnostics
  .completed = 0;

  searchState
  .diagnostics
  .failed = 0;

  searchState
  .diagnostics
  .aborted = 0;

  searchState
  .diagnostics
  .cacheHits = 0;

  searchState
  .diagnostics
  .cacheMisses = 0;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const SearchState =
Object.freeze({

  setInitialized,

  setSearching,

  setHealthy,

  incrementActiveSearches,

  decrementActiveSearches,

  incrementSearches,

  incrementCompleted,

  incrementFailed,

  incrementAborted,

  incrementCacheHits,

  incrementCacheMisses,

  snapshot:
  getSearchSnapshot,

  diagnostics:
  getSearchDiagnostics,

  reset:
  resetSearchState

});



// =====================================
// EXPORTS
// =====================================

export {

  searchState,

  setInitialized,

  setSearching,

  setHealthy,

  incrementActiveSearches,

  decrementActiveSearches,

  incrementSearches,

  incrementCompleted,

  incrementFailed,

  incrementAborted,

  incrementCacheHits,

  incrementCacheMisses,

  getSearchSnapshot,

  getSearchDiagnostics,

  resetSearchState,

  SearchState

};

export default
SearchState;
