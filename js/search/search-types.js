// =====================================
// RIGO AI
// SEARCH TYPES
// ENTERPRISE FINAL
// =====================================



// =====================================
// SEARCH CONFIG
// =====================================

const SEARCH_CONFIG =
Object.freeze({

  MAX_QUERY_LENGTH:500,

  MAX_RESULTS:100,

  DEFAULT_LIMIT:20,

  DEFAULT_OFFSET:0,

  MIN_QUERY_LENGTH:1,

  CACHE_TTL:
  1000 * 60 * 5,

  MAX_CACHE_SIZE:500,

  ENABLE_CACHE:true,

  ENABLE_SEMANTIC_SEARCH:true,

  ENABLE_FUZZY_SEARCH:true,

  ENABLE_HYBRID_SEARCH:true,

  ENABLE_RANKING:true

});



// =====================================
// SEARCH TYPES
// =====================================

const SEARCH_TYPES =
Object.freeze({

  BASIC:"basic",

  SEMANTIC:"semantic",

  HYBRID:"hybrid",

  EXACT:"exact",

  FUZZY:"fuzzy"

});



// =====================================
// SEARCH TARGETS
// =====================================

const SEARCH_TARGETS =
Object.freeze({

  MEMORY:"memory",

  CHAT:"chat",

  FILE:"file",

  ALL:"all"

});



// =====================================
// SEARCH STATE
// =====================================

const SEARCH_STATES =
Object.freeze({

  IDLE:"idle",

  SEARCHING:"searching",

  READY:"ready",

  FAILED:"failed"

});



// =====================================
// SEARCH RESULT
// =====================================

function createSearchResult(
  memory,
  score = 0,
  metadata = {}
){

  return Object.freeze({

    id:
    createMemoryId(),

    memory,

    score:
    normalizeMemoryScore(
      score
    ),

    metadata:{
      ...metadata
    },

    createdAt:
    Date.now()

  });

}



// =====================================
// SEARCH QUERY
// =====================================

function createSearchQuery(
  query,
  options = {}
){

  return Object.freeze({

    id:
    createMemoryId(),

    query:
    normalizeSearchQuery(
      query
    ),

    type:

      options.type ||

      SEARCH_TYPES
      .HYBRID,

    limit:
    clampSearchLimit(
      options.limit
    ),

    offset:
    normalizeSearchOffset(
      options.offset
    ),

    filters:

      safeSearchObject(
        options.filters
      ),

    createdAt:
    Date.now()

  });

}
