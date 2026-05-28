// =====================================
// RIGO AI
// SEARCH INDEX
// FINAL HARDENED EXPORT LAYER
// =====================================



// =====================================
// IMPORTS
// =====================================

import "./search-types.js";
import "./search-state.js";
import "./search-utils.js";
import "./search-query.js";
import "./search-cache.js";
import "./search-ranking.js";
import "./search-fuzzy.js";
import "./search-snippets.js";
import "./search-history.js";
import "./search-worker.js";

import {

  rebuildSearchIndexes,
  searchIndexedMemories

} from "./search-index.js";

import {

  executeMemorySearch

} from "./search-engine.js";



// =====================================
// VALIDATION
// =====================================

function validateSearchLayer(){

  return (

    typeof executeMemorySearch ===
    "function"

    &&

    typeof rebuildSearchIndexes ===
    "function"

    &&

    typeof searchIndexedMemories ===
    "function"

  );

}



// =====================================
// SAFE ACCESS
// =====================================

function getSearchDiagnostics(){

  return Object.freeze({

    search:

      typeof searchState !==
      "undefined"

      ?

      searchState

      :

      null,



    indexes:

      typeof searchIndexState !==
      "undefined"

      ?

      searchIndexState

      :

      null,



    cache:

      typeof searchCache !==
      "undefined"

      ?

      searchCache

      :

      null,



    history:

      typeof searchHistoryState !==
      "undefined"

      ?

      searchHistoryState

      :

      null,



    worker:

      typeof searchWorkerState !==
      "undefined"

      ?

      searchWorkerState

      :

      null

  });

}



// =====================================
// SEARCH API
// =====================================

const RIGOSearch =
Object.freeze({



  // ===================================
  // ENGINE
  // ===================================

  search:
  executeMemorySearch,



  // ===================================
  // INDEX
  // ===================================

  rebuildIndexes:
  rebuildSearchIndexes,



  searchIndexed:
  searchIndexedMemories,



  // ===================================
  // CACHE
  // ===================================

  clearCache:

    typeof clearSearchCache ===
    "function"

    ?

    clearSearchCache

    :

    null,



  // ===================================
  // HISTORY
  // ===================================

  popular:

    typeof getPopularSearches ===
    "function"

    ?

    getPopularSearches

    :

    null,



  // ===================================
  // WORKER
  // ===================================

  worker:

    typeof executeSearchWorkerTask ===
    "function"

    ?

    executeSearchWorkerTask

    :

    null,



  // ===================================
  // DIAGNOSTICS
  // ===================================

  diagnostics:
  getSearchDiagnostics,



  // ===================================
  // VALIDATION
  // ===================================

  validate:
  validateSearchLayer

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis ===
  "object"
){

  Object.defineProperty(

    globalThis,

    "RIGOSearch",

    {

      value:
      RIGOSearch,

      writable:false,

      configurable:false

    }

  );

}



// =====================================
// EXPORTS
// =====================================

export {

  RIGOSearch

};

export default
RIGOSearch;
