// =====================================
// RIGO AI
// SEARCH TYPES
// OPTIMIZED FINAL EDITION
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
// HELPERS
// =====================================

function normalizeSearchLimit(
  value
){

  return Math.max(

    1,

    Math.min(

      Number(value) ||

      SEARCH_CONFIG
      .DEFAULT_LIMIT,

      SEARCH_CONFIG
      .MAX_RESULTS

    )

  );

}



function normalizeSearchOffset(
  value
){

  return Math.max(
    0,
    Number(value) || 0
  );

}



function normalizeSearchQuery(
  query
){

  return String(
    query || ""
  )
  .trim()
  .slice(

    0,

    SEARCH_CONFIG
    .MAX_QUERY_LENGTH

  );

}



function normalizeSearchScore(
  score
){

  const normalized =
  Number(score);

  if(
    !Number.isFinite(
      normalized
    )
  ){

    return 0;

  }

  return Math.max(
    0,
    normalized
  );

}



function safeSearchObject(
  value
){

  return (

    value &&
    typeof value ===
    "object"

  )

  ? { ...value }

  : {};

}



// =====================================
// SEARCH RESULT
// =====================================

function createSearchResult(
  memory,
  score = 0,
  metadata = {}
){

  if(
    !memory?.id
  ){

    return null;

  }

  return Object.freeze({

    id:

      typeof createMemoryId ===
      "function"

      ?

      createMemoryId()

      :

      crypto.randomUUID(),

    memory,

    score:
    normalizeSearchScore(
      score
    ),

    metadata:
    safeSearchObject(
      metadata
    ),

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

      typeof createMemoryId ===
      "function"

      ?

      createMemoryId()

      :

      crypto.randomUUID(),

    query:
    normalizeSearchQuery(
      query
    ),

    type:

      options.type ||

      SEARCH_TYPES
      .HYBRID,

    limit:
    normalizeSearchLimit(
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



// =====================================
// SEARCH API
// =====================================

const SearchTypesAPI =
Object.freeze({

  normalizeSearchLimit,

  normalizeSearchOffset,

  normalizeSearchQuery,

  normalizeSearchScore,

  safeSearchObject,

  createSearchResult,

  createSearchQuery

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(typeof globalThis === "object"){

  globalThis.SEARCH_CONFIG =
  SEARCH_CONFIG;

  globalThis.SEARCH_TYPES =
  SEARCH_TYPES;

  globalThis.SearchTypesAPI =
  SearchTypesAPI;

}



// =====================================
// EXPORTS
// =====================================

export {

  SEARCH_CONFIG,

  SEARCH_TYPES,

  normalizeSearchLimit,

  normalizeSearchOffset,

  normalizeSearchQuery,

  normalizeSearchScore,

  safeSearchObject,

  createSearchResult,

  createSearchQuery,

  SearchTypesAPI

};



// =====================================
// DEFAULT EXPORT
// =====================================

export default SearchTypesAPI;
