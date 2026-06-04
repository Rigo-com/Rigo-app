// =====================================
// RIGO AI
// SEARCH INDEX
// PUBLIC ENTRY POINT
// =====================================

export {

  SEARCH_LIMITS,

  SEARCH_TIMERS,

  SEARCH_FEATURES,

  SEARCH_EVENTS,

  SearchConfig

}
from "./search-config.js";



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

}
from "./search-state.js";



export {

  initialize,

  destroy,

  startSearch,

  completeSearch,

  failSearch,

  abortSearch,

  health,

  SearchCore

}
from "./search-core.js";



export {

  setCache,

  getCache,

  removeCache,

  clearCache,

  addHistory,

  getHistory,

  clearHistory,

  cleanupExpiredCache,

  cleanupExpiredHistory,

  getStorageStats,

  resetStorage,

  SearchStorage

}
from "./search-storage.js";



export {

  on,

  off,

  once,

  emit,

  clear,

  listenerCount,

  SearchEvents

}
from "./search-events.js";



export {

  createSearchId,

  normalizeQuery,

  createCacheKey,

  isValidQuery,

  isValidSearchResult,

  isValidSearchResults,

  createSnippet,

  createSearchResult,

  normalizeError,

  SearchHelpers

}
from "./search-helpers.js";



export {

  calculateScore,

  sortResults,

  filterResults,

  deduplicateResults,

  rankResults,

  SearchRanking

}
from "./search-ranking.js";



export {

  executeIndexedSearch,

  executeSemanticSearch,

  executeFuzzySearch,

  executeSearch,

  SearchEngine

}
from "./search-engine.js";



export {

  getHealthStatus,

  getDiagnostics,

  getHealthReport,

  isHealthy,

  SearchHealth

}
from "./search-health.js";



// =====================================
// DEFAULT EXPORT
// =====================================

import SearchConfig
from "./search-config.js";

import SearchState
from "./search-state.js";

import SearchCore
from "./search-core.js";

import SearchStorage
from "./search-storage.js";

import SearchEvents
from "./search-events.js";

import SearchHelpers
from "./search-helpers.js";

import SearchRanking
from "./search-ranking.js";

import SearchEngine
from "./search-engine.js";

import SearchHealth
from "./search-health.js";



const Search =
Object.freeze({

  config:
  SearchConfig,

  state:
  SearchState,

  core:
  SearchCore,

  storage:
  SearchStorage,

  events:
  SearchEvents,

  helpers:
  SearchHelpers,

  ranking:
  SearchRanking,

  engine:
  SearchEngine,

  health:
  SearchHealth

});



export default
Search;
