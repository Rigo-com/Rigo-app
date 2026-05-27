// =====================================
// RIGO AI
// SEARCH INDEX
// FINAL EXPORT LAYER
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
// SEARCH API
// =====================================

const SearchAPI =
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
  clearSearchCache,



  // ===================================
  // HISTORY
  // ===================================

  popular:
  getPopularSearches,



  // ===================================
  // WORKER
  // ===================================

  worker:
  executeSearchWorkerTask,



  // ===================================
  // DIAGNOSTICS
  // ===================================

  diagnostics(){

    return {

      search:
      searchState,

      indexes:
      searchIndexState,

      cache:
      searchCache,

      history:
      searchHistoryState,

      worker:
      searchWorkerState

    };

  }

});



// =====================================
// EXPORTS
// =====================================

export {

  SearchAPI

};
