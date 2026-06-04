// =====================================
// RIGO AI
// SEARCH CORE
// ORCHESTRATION LAYER
// =====================================

import {
  SEARCH_EVENTS
}
from "./search-config.js";

import {
  emit
}
from "./search-events.js";

import {
  SearchState
}
from "./search-state.js";



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  if(
    SearchState
    .snapshot()
    .initialized
  ){
    return true;
  }

  SearchState
  .setInitialized(
    true
  );

  emit(
    SEARCH_EVENTS
    .INITIALIZED
  );

  return true;

}



// =====================================
// DESTROY
// =====================================

function destroy(){

  SearchState
  .reset();

  emit(
    SEARCH_EVENTS
    .DESTROYED
  );

  return true;

}



// =====================================
// SEARCH START
// =====================================

function startSearch(
  query = ""
){

  SearchState
  .setSearching(
    true
  );

  SearchState
  .incrementActiveSearches();

  SearchState
  .incrementSearches();

  emit(

    SEARCH_EVENTS
    .SEARCH_STARTED,

    {
      query
    }

  );

  return true;

}



// =====================================
// SEARCH COMPLETE
// =====================================

function completeSearch(
  query = "",
  results = []
){

  SearchState
  .setSearching(
    false
  );

  SearchState
  .decrementActiveSearches();

  SearchState
  .incrementCompleted();

  emit(

    SEARCH_EVENTS
    .SEARCH_COMPLETED,

    {

      query,

      results

    }

  );

  return true;

}



// =====================================
// SEARCH FAILED
// =====================================

function failSearch(
  query = "",
  error = null
){

  SearchState
  .setSearching(
    false
  );

  SearchState
  .decrementActiveSearches();

  SearchState
  .incrementFailed();

  emit(

    SEARCH_EVENTS
    .SEARCH_FAILED,

    {

      query,

      error

    }

  );

  return true;

}



// =====================================
// SEARCH ABORTED
// =====================================

function abortSearch(
  query = ""
){

  SearchState
  .setSearching(
    false
  );

  SearchState
  .decrementActiveSearches();

  SearchState
  .incrementAborted();

  emit(

    SEARCH_EVENTS
    .SEARCH_ABORTED,

    {
      query
    }

  );

  return true;

}



// =====================================
// HEALTH
// =====================================

function health(){

  return Object.freeze({

    ...SearchState
    .snapshot(),

    diagnostics:

    SearchState
    .diagnostics()

  });

}



// =====================================
// PUBLIC API
// =====================================

const SearchCore =
Object.freeze({

  initialize,

  destroy,

  startSearch,

  completeSearch,

  failSearch,

  abortSearch,

  health

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  destroy,

  startSearch,

  completeSearch,

  failSearch,

  abortSearch,

  health,

  SearchCore

};

export default
SearchCore;
