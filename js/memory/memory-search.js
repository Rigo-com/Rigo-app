// =====================================
// RIGO AI
// MEMORY SEARCH
// CLEAN FINAL ARCHITECTURE
// =====================================



// =====================================
// SEARCH CONFIG
// =====================================

const MEMORY_SEARCH_CONFIG =
Object.freeze({

  DEFAULT_LIMIT:20,

  MAX_LIMIT:100,

  MIN_QUERY_LENGTH:1,

  MAX_QUERY_LENGTH:500,

  MAX_CACHE_ENTRIES:200,

  CACHE_TTL:
  60000,

  TITLE_WEIGHT:5,

  TAG_WEIGHT:4,

  SUMMARY_WEIGHT:3,

  CONTENT_WEIGHT:2,

  PINNED_WEIGHT:3,

  RECENT_WEIGHT:2,

  EXACT_MATCH_WEIGHT:10,

  STARTS_WITH_WEIGHT:4

});



// =====================================
// QUERY HELPERS
// =====================================

function normalizeSearchQuery(
  query
){

  return normalizeMemoryContent(
    query
  )
  .toLowerCase()
  .trim();

}



function clampSearchLimit(
  limit
){

  const numericLimit =
  Number(limit);

  if(
    !Number.isFinite(
      numericLimit
    )
  ){

    return MEMORY_SEARCH_CONFIG
    .DEFAULT_LIMIT;

  }

  return Math.min(

    MEMORY_SEARCH_CONFIG
    .MAX_LIMIT,

    Math.max(
      1,
      numericLimit
    )

  );

}



// =====================================
// RESULT HELPERS
// =====================================

function createSearchResult(
  memory,
  score = 0
){

  return {

    memory,

    memoryId:
    memory?.id || null,

    score:
    safeMemoryNumber(
      score,
      0
    )

  };

}



function normalizeSearchResults(
  results = []
){

  const resultMap =
  new Map();

  results.forEach((result) => {

    const memoryId =
    result?.memoryId;

    if(!memoryId){

      return;
    }

    const existing =
    resultMap.get(
      memoryId
    );

    if(!existing){

      resultMap.set(
        memoryId,
        result
      );

      return;
    }

    existing.score =
    Math.max(

      existing.score,

      result.score

    );

  });

  return [

    ...resultMap.values()

  ];

}



function sortSearchResults(
  results = []
){

  return [...results]
  .sort((a,b) => {

    if(
      b.score !==
      a.score
    ){

      return (
        b.score -
        a.score
      );

    }

    return (

      Number(
        b.memory
        ?.updatedAt || 0
      )

      -

      Number(
        a.memory
        ?.updatedAt || 0
      )

    );

  });

}



// =====================================
// SEARCH CACHE
// =====================================

function createSearchCacheKey(
  query,
  options = {}
){

  return safeJsonStringify({

    query:
    normalizeSearchQuery(
      query
    ),

    limit:
    options.limit,

    includeArchived:
    Boolean(
      options.includeArchived
    ),

    includeDeleted:
    Boolean(
      options.includeDeleted
    )

  });

}



function getCachedSearchResults(
  cacheKey
){

  if(!cacheKey){

    return null;
  }

  const cache =
  memoryState
  ?.cache
  ?.searchResults;

  if(
    !(cache instanceof Map)
  ){

    return null;
  }

  const cached =
  cache.get(
    cacheKey
  );

  if(!cached){

    return null;
  }

  const expired =

    (
      Date.now() -
      cached.timestamp
    ) >

    MEMORY_SEARCH_CONFIG
    .CACHE_TTL;

  if(expired){

    cache.delete(
      cacheKey
    );

    return null;

  }

  return deepClone(
    cached.results
  );

}



function setCachedSearchResults(
  cacheKey,
  results
){

  if(
    !cacheKey
  ){

    return false;
  }

  const cache =
  memoryState
  ?.cache
  ?.searchResults;

  if(
    !(cache instanceof Map)
  ){

    return false;
  }

  cache.set(

    cacheKey,

    {

      timestamp:
      Date.now(),

      results:
      deepClone(results)

    }

  );

  while(

    cache.size >

    MEMORY_SEARCH_CONFIG
    .MAX_CACHE_ENTRIES

  ){

    const oldestKey =

      cache.keys()
      .next()
      .value;

    cache.delete(
      oldestKey
    );

  }

  return true;

}



function clearSearchCache(){

  if(

    memoryState
    ?.cache
    ?.searchResults
    instanceof Map

  ){

    memoryState
    .cache
    .searchResults
    .clear();

  }

  return true;

}



// =====================================
// FILTERS
// =====================================

function isSearchableMemory(
  memory,
  options = {}
){

  if(
    !memory ||
    !memory.id
  ){

    return false;
  }

  if(

    memoryState
    ?.tracking
    ?.corruptedIds
    ?.has(memory.id)

  ){

    return false;
  }

  if(

    memory.state ===
    "deleted"

    &&

    options.includeDeleted !==
    true

  ){

    return false;
  }

  if(

    memory.state ===
    "archived"

    &&

    options.includeArchived !==
    true

  ){

    return false;
  }

  return true;

}



// =====================================
// FIELD SCORE
// =====================================

function calculateFieldScore(
  value,
  query,
  weight
){

  const normalizedValue =

    normalizeMemoryContent(
      value
    )
    .toLowerCase();

  if(
    !normalizedValue
  ){

    return 0;
  }

  if(
    normalizedValue === query
  ){

    return (

      MEMORY_SEARCH_CONFIG
      .EXACT_MATCH_WEIGHT +

      weight

    );

  }

  if(
    normalizedValue.startsWith(
      query
    )
  ){

    return (

      MEMORY_SEARCH_CONFIG
      .STARTS_WITH_WEIGHT +

      weight

    );

  }

  if(
    normalizedValue.includes(
      query
    )
  ){

    return weight;
  }

  return 0;

}



// =====================================
// SCORE ENGINE
// =====================================

function calculateMemoryScore(
  memory,
  query
){

  if(
    !memory
  ){

    return 0;
  }

  let score = 0;

  score += calculateFieldScore(

    memory.title,
    query,

    MEMORY_SEARCH_CONFIG
    .TITLE_WEIGHT

  );

  score += calculateFieldScore(

    memory.summary,
    query,

    MEMORY_SEARCH_CONFIG
    .SUMMARY_WEIGHT

  );

  score += calculateFieldScore(

    memory.content,
    query,

    MEMORY_SEARCH_CONFIG
    .CONTENT_WEIGHT

  );

  if(
    Array.isArray(
      memory.tags
    )
  ){

    memory.tags.forEach((tag) => {

      score += calculateFieldScore(

        tag,
        query,

        MEMORY_SEARCH_CONFIG
        .TAG_WEIGHT

      );

    });

  }

  if(

    memoryState
    ?.tracking
    ?.pinnedMemoryIds
    ?.has(memory.id)

  ){

    score +=

      MEMORY_SEARCH_CONFIG
      .PINNED_WEIGHT;

  }

  const updatedAt =
  Number(
    memory.updatedAt
  );

  if(
    Number.isFinite(
      updatedAt
    )
  ){

    const ageInDays =

      (
        Date.now() -
        updatedAt
      ) /

      86400000;

    if(
      ageInDays <= 7
    ){

      score +=

        MEMORY_SEARCH_CONFIG
        .RECENT_WEIGHT;

    }

  }

  return score;

}



// =====================================
// INDEXED SEARCH
// =====================================

function searchIndexedMemories(
  index,
  key,
  options = {}
){

  const ids =
  getIndexedMemoryIds(
    index,
    key
  );

  return ids
  .map((id) => {

    return getMemoryById?.(
      id
    );

  })
  .filter((memory) => {

    return isSearchableMemory(
      memory,
      options
    );

  });

}



// =====================================
// TOKEN SEARCH
// =====================================

function searchByTokens(
  query,
  options = {}
){

  const normalizedQuery =
  normalizeSearchQuery(
    query
  );

  const tokens =
  tokenizeMemoryText(
    normalizedQuery
  );

  const memoryMap =
  new Map();

  tokens.forEach((token) => {

    const memories =
    searchIndexedMemories(

      memoryState
      ?.indexes
      ?.byToken,

      token,

      options

    );

    memories.forEach((memory) => {

      memoryMap.set(
        memory.id,
        memory
      );

    });

  });

  return [

    ...memoryMap.values()

  ];

}



// =====================================
// PAGINATION
// =====================================

function paginateSearchResults(
  results = [],
  limit = 20,
  page = 1
){

  const safeLimit =
  clampSearchLimit(
    limit
  );

  const safePage =
  Math.max(
    1,
    Number(page) || 1
  );

  const offset =

    (
      safePage - 1
    ) *

    safeLimit;

  return results.slice(
    offset,
    offset + safeLimit
  );

}



// =====================================
// MAIN SEARCH
// =====================================

function searchMemories(
  query,
  options = {}
){

  const normalizedQuery =
  normalizeSearchQuery(
    query
  );

  if(

    normalizedQuery.length <

    MEMORY_SEARCH_CONFIG
    .MIN_QUERY_LENGTH

  ){

    return [];

  }

  if(

    normalizedQuery.length >

    MEMORY_SEARCH_CONFIG
    .MAX_QUERY_LENGTH

  ){

    return [];

  }

  const cacheKey =
  createSearchCacheKey(
    normalizedQuery,
    options
  );

  const cached =
  getCachedSearchResults(
    cacheKey
  );

  if(cached){

    return cached;
  }

  const memories =
  searchByTokens(
    normalizedQuery,
    options
  );

  const results =
  memories
  .map((memory) => {

    return createSearchResult(

      memory,

      calculateMemoryScore(
        memory,
        normalizedQuery
      )

    );

  })
  .filter((result) => {

    return result.score > 0;

  });

  const normalizedResults =
  normalizeSearchResults(
    results
  );

  const sortedResults =
  sortSearchResults(
    normalizedResults
  );

  const paginatedResults =
  paginateSearchResults(

    sortedResults,

    options.limit,

    options.page

  );

  if(
    memoryState?.stats
  ){

    memoryState.stats
    .searches++;

  }

  setCachedSearchResults(
    cacheKey,
    paginatedResults
  );

  return deepClone(
    paginatedResults
  );

}



// =====================================
// ADVANCED SEARCH
// =====================================

async function advancedMemorySearch(
  query,
  options = {}
){

  const indexedResults =
  searchMemories(
    query,
    options
  );

  let semanticResults = [];

  if(
    typeof semanticMemorySearch ===
    "function"
  ){

    try{

      const semanticData =
      await Promise.resolve(

        semanticMemorySearch(
          query,
          options
        )

      );

      semanticResults =

        Array.isArray(
          semanticData
        )

        ? semanticData.map((item) => {

            return createSearchResult(

              item.memory,

              Math.round(
                item.similarity * 100
              )

            );

          })

        : [];

    }

    catch(error){}

  }

  const mergedResults =
  normalizeSearchResults([

    ...indexedResults,

    ...semanticResults

  ]);

  return sortSearchResults(
    mergedResults
  );

}
