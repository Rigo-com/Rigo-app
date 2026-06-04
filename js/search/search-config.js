// =====================================
// RIGO AI
// SEARCH CONFIG
// FOUNDATION LAYER
// =====================================



// =====================================
// SEARCH LIMITS
// =====================================

const SEARCH_LIMITS =
Object.freeze({

  MAX_RESULTS:
  100,

  MAX_CACHE_ENTRIES:
  1000,

  MAX_HISTORY_ENTRIES:
  500,

  MAX_QUERY_LENGTH:
  1000,

  MAX_CONCURRENT_SEARCHES:
  10

});



// =====================================
// SEARCH TIMERS
// =====================================

const SEARCH_TIMERS =
Object.freeze({

  SEARCH_TIMEOUT:
  30000,

  CACHE_TTL:
  600000,

  HISTORY_TTL:
  86400000,

  HEALTH_INTERVAL:
  30000

});



// =====================================
// SEARCH FEATURES
// =====================================

const SEARCH_FEATURES =
Object.freeze({

  ENABLE_CACHE:
  true,

  ENABLE_HISTORY:
  true,

  ENABLE_FUZZY_SEARCH:
  true,

  ENABLE_SEMANTIC_SEARCH:
  true,

  ENABLE_RANKING:
  true,

  ENABLE_DIAGNOSTICS:
  true

});



// =====================================
// SEARCH EVENTS
// =====================================

const SEARCH_EVENTS =
Object.freeze({

  INITIALIZED:
  "search.initialized",

  DESTROYED:
  "search.destroyed",

  SEARCH_STARTED:
  "search.started",

  SEARCH_COMPLETED:
  "search.completed",

  SEARCH_FAILED:
  "search.failed",

  SEARCH_ABORTED:
  "search.aborted",

  CACHE_HIT:
  "search.cache.hit",

  CACHE_MISS:
  "search.cache.miss",

  HISTORY_ADDED:
  "search.history.added",

  HEALTH_CHANGED:
  "search.health.changed"

});



// =====================================
// PUBLIC API
// =====================================

const SearchConfig =
Object.freeze({

  limits:
  SEARCH_LIMITS,

  timers:
  SEARCH_TIMERS,

  features:
  SEARCH_FEATURES,

  events:
  SEARCH_EVENTS

});



// =====================================
// EXPORTS
// =====================================

export {

  SEARCH_LIMITS,

  SEARCH_TIMERS,

  SEARCH_FEATURES,

  SEARCH_EVENTS,

  SearchConfig

};

export default
SearchConfig;
