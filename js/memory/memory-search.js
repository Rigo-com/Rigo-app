// =====================================
// RIGO AI
// MEMORY SEARCH
// ENTERPRISE INFINITY FINAL
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
// SEARCH HELPERS
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



function createSearchResult(
  memory,
  score = 0
){

  return {

    memory,

    score,

    memoryId:
    memory?.id ||

    null

  };

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
// SAFE CACHE KEY
// =====================================

function createSearchCacheKey(
  query,
  options = {}
){

  const normalizedQuery =
  normalizeSearchQuery(
    query
  );

  const safeOptions = {

    limit:
    Number(
      options.limit
    ) || null,

    includeArchived:
    Boolean(
      options.includeArchived
    ),

    includeDeleted:
    Boolean(
      options.includeDeleted
    ),

    page:
    Number(
      options.page
    ) || null,

    sortBy:
    normalizeMemoryString(
      options.sortBy
    ) || null,

    direction:
    normalizeMemoryString(
      options.direction
    ) || null

  };

  return [

    normalizedQuery,

    safeOptions.limit,

    safeOptions.includeArchived,

    safeOptions.includeDeleted,

    safeOptions.page,

    safeOptions.sortBy,

    safeOptions.direction

  ]
  .join("|");

}



// =====================================
// SEARCH FILTER
// =====================================

function isSearchableMemory(
  memory,
  options = {}
){

  if(!memory){

    return false;

  }

  if(

    memoryState
    .tracking
    .corruptedIds
    .has(memory.id)

  ){

    return false;

  }

  if(

    memory.state ===
    "deleted" &&

    options.includeDeleted !==
    true

  ){

    return false;

  }

  if(

    memory.state ===
    "archived" &&

    options.includeArchived !==
    true

  ){

    return false;

  }

  return true;

}



// =====================================
// SCORE MERGING
// =====================================

function mergeSearchScores(
  results = []
){

  const scoreMap =
  new Map();

  results.forEach((result) => {

    const memoryId =
    result?.memoryId;

    if(!memoryId){

      return;
    }

    const existing =
    scoreMap.get(
      memoryId
    );

    if(!existing){

      scoreMap.set(
        memoryId,
        result
      );

      return;
    }

    existing.score +=
    result.score;

  });

  return [

    ...scoreMap.values()

  ];

}



// =====================================
// SCORING ENGINE
// =====================================

function calculateMemoryScore(
  memory,
  normalizedQuery
){

  if(
    !memory
  ){

    return 0;

  }

  let score = 0;

  const title =
  normalizeMemoryContent(
    memory.title
  )
  .toLowerCase();

  const summary =
  normalizeMemoryContent(
    memory.summary
  )
  .toLowerCase();

  const content =
  normalizeMemoryContent(
    memory.content
  )
  .toLowerCase();

  const tags =

    Array.isArray(
      memory.tags
    )

    ? memory.tags.map((tag) => {

        return normalizeMemoryString(
          tag
        )
        .toLowerCase();

      })

    : [];



  // ===================================
  // EXACT MATCH
  // ===================================

  if(
    title === normalizedQuery
  ){

    score +=

      MEMORY_SEARCH_CONFIG
      .EXACT_MATCH_WEIGHT;

  }



  // ===================================
  // STARTS WITH BOOST
  // ===================================

  if(
    title.startsWith(
      normalizedQuery
    )
  ){

    score +=

      MEMORY_SEARCH_CONFIG
      .STARTS_WITH_WEIGHT;

  }



  // ===================================
  // TITLE MATCH
  // ===================================

  if(
    title.includes(
      normalizedQuery
    )
  ){

    score +=

      MEMORY_SEARCH_CONFIG
      .TITLE_WEIGHT;

  }



  // ===================================
  // SUMMARY MATCH
  // ===================================

  if(
    summary.includes(
      normalizedQuery
    )
  ){

    score +=

      MEMORY_SEARCH_CONFIG
      .SUMMARY_WEIGHT;

  }



  // ===================================
  // CONTENT MATCH
  // ===================================

  if(
    content.includes(
      normalizedQuery
    )
  ){

    score +=

      MEMORY_SEARCH_CONFIG
      .CONTENT_WEIGHT;

  }



  // ===================================
  // TAG MATCH
  // ===================================

  tags.forEach((tag) => {

    if(
      tag.includes(
        normalizedQuery
      )
    ){

      score +=

        MEMORY_SEARCH_CONFIG
        .TAG_WEIGHT;

    }

  });



  // ===================================
  // PINNED BOOST
  // ===================================

  if(

    memoryState
    .tracking
    .pinnedMemoryIds
    .has(memory.id)

  ){

    score +=

      MEMORY_SEARCH_CONFIG
      .PINNED_WEIGHT;

  }



  // ===================================
  // RECENCY BOOST
  // ===================================

  const updatedAt =
  Number(
    memory.updatedAt
  );

  if(
    Number.isFinite(
      updatedAt
    )
  ){

    const daysSinceUpdate =

      (
        Date.now() -
        updatedAt
      ) /

      86400000;

    if(
      daysSinceUpdate <= 7
    ){

      score +=

        MEMORY_SEARCH_CONFIG
        .RECENT_WEIGHT;

    }

  }

  return score;

}



// =====================================
// RESULT SORTING
// =====================================

function sortSearchResults(
  results = []
){

  return [...results].sort((
    a,
    b
  ) => {

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
// DEDUPLICATION
// =====================================

function deduplicateSearchResults(
  results = []
){

  const bestResults =
  new Map();

  results.forEach((result) => {

    const memoryId =
    result?.memoryId;

    if(!memoryId){

      return;
    }

    const existing =
    bestResults.get(
      memoryId
    );

    if(

      !existing ||

      result.score >
      existing.score

    ){

      bestResults.set(
        memoryId,
        result
      );

    }

  });

  return [

    ...bestResults.values()

  ];

}



// =====================================
// SEARCH CACHE
// =====================================

function getCachedSearchResults(
  cacheKey
){

  if(
    !cacheKey
  ){

    return null;

  }

  const cachedResults =
  memoryState
  .cache
  .searchResults
  .get(
    cacheKey
  )

  ||

  null;

  if(
    !cachedResults
  ){

    return null;

  }

  return deepClone(
    cachedResults
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

  if(
    !Array.isArray(
      results
    )
  ){

    return false;

  }

  memoryState
  .cache
  .searchResults
  .set(
    cacheKey,
    deepClone(results)
  );



  // ===================================
  // CACHE SIZE PROTECTION
  // ===================================

  const maxCacheEntries =
  200;

  const cache =
  memoryState.cache
  .searchResults;

  if(
    cache.size >
    maxCacheEntries
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

  memoryState
  .cache
  .searchResults
  .clear();

  return true;

}



// =====================================
// SEARCH BY ID
// =====================================

function searchById(
  memoryId
){

  const normalizedId =
  normalizeMemoryString(
    memoryId
  );

  if(!normalizedId){

    return null;

  }

  return (

    memoryState.indexes
    .byId
    .get(
      normalizedId
    )

    ||

    null

  );

}



// =====================================
// SEARCH BY TYPE
// =====================================

function searchByType(
  type,
  options = {}
){

  return getIndexedMemoryIds(

    memoryState.indexes
    .byType,

    type

  )
  .map((memoryId) => {

    return searchById(
      memoryId
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
// SEARCH BY CATEGORY
// =====================================

function searchByCategory(
  category,
  options = {}
){

  return getIndexedMemoryIds(

    memoryState.indexes
    .byCategory,

    category

  )
  .map((memoryId) => {

    return searchById(
      memoryId
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
// SEARCH BY TAG
// =====================================

function searchByTag(
  tag,
  options = {}
){

  return getIndexedMemoryIds(

    memoryState.indexes
    .byTag,

    tag

  )
  .map((memoryId) => {

    return searchById(
      memoryId
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
// SEARCH BY PRIORITY
// =====================================

function searchByPriority(
  priority,
  options = {}
){

  return getIndexedMemoryIds(

    memoryState.indexes
    .byPriority,

    priority

  )
  .map((memoryId) => {

    return searchById(
      memoryId
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
// SEARCH BY STATE
// =====================================

function searchByState(
  state,
  options = {}
){

  return getIndexedMemoryIds(

    memoryState.indexes
    .byState,

    state

  )
  .map((memoryId) => {

    return searchById(
      memoryId
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

  if(

    normalizedQuery.length <

    MEMORY_SEARCH_CONFIG
    .MIN_QUERY_LENGTH

  ){

    return [];

  }

  const tokens =
  tokenizeMemoryText(
    normalizedQuery
  );

  const results = [];

  tokens.forEach((token) => {

    const memoryIds =

      getIndexedMemoryIds(

        memoryState.indexes
        .byToken,

        token

      );

    memoryIds.forEach((memoryId) => {

      const memory =
      searchById(
        memoryId
      );

      if(

        !memory ||

        !isSearchableMemory(
          memory,
          options
        )

      ){

        return;
      }

      const score =
      calculateMemoryScore(
        memory,
        token
      );

      if(
        score <= 0
      ){

        return;
      }

      results.push(

        createSearchResult(
          memory,
          score
        )

      );

    });

  });

  return sortSearchResults(

    deduplicateSearchResults(
      mergeSearchScores(
        results
      )
    )

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

  const cachedResults =
  getCachedSearchResults(
    cacheKey
  );

  if(
    cachedResults
  ){

    return cachedResults;

  }

  const limit =
  clampSearchLimit(
    options.limit
  );

  const memories =

    Array.isArray(
      memoryState.memories
    )

    ? memoryState.memories

    : [];

  const results = [];

  memories.forEach((memory) => {

    if(

      !isSearchableMemory(
        memory,
        options
      )

    ){

      return;
    }

    const score =
    calculateMemoryScore(
      memory,
      normalizedQuery
    );

    if(
      score <= 0
    ){

      return;
    }

    results.push(

      createSearchResult(
        memory,
        score
      )

    );

  });

  const finalResults =
  sortSearchResults(

    deduplicateSearchResults(
      mergeSearchScores(
        results
      )
    )

  )
  .slice(0,limit);

  memoryState.stats
  .searches++;

  setCachedSearchResults(
    cacheKey,
    finalResults
  );

  return deepClone(
    finalResults
  );

}



// =====================================
// ADVANCED SEARCH
// =====================================

function advancedMemorySearch(
  query,
  options = {}
){

  const tokenResults =
  searchByTokens(
    query,
    options
  );

  const directResults =
  searchMemories(
    query,
    options
  );

  const mergedResults =

    mergeSearchScores([

      ...tokenResults,

      ...directResults

    ]);

  const finalResults =
  sortSearchResults(

    deduplicateSearchResults(
      mergedResults
    )

  );

  const limit =
  clampSearchLimit(
    options.limit
  );

  return finalResults
  .slice(0,limit);

}



// =====================================
// DATE RANGE SEARCH
// =====================================

function searchMemoriesByDateRange(
  startDate,
  endDate,
  options = {}
){

  const start =
  Number(startDate);

  const end =
  Number(endDate);

  if(

    !Number.isFinite(start) ||

    !Number.isFinite(end)

  ){

    return [];

  }

  return memoryState.memories
  .filter((memory) => {

    if(

      !isSearchableMemory(
        memory,
        options
      )

    ){

      return false;

    }

    const createdAt =
    Number(
      memory?.createdAt
    );

    return (

      Number.isFinite(
        createdAt
      )

      &&

      createdAt >= start

      &&

      createdAt <= end

    );

  });

}



// =====================================
// SORT MEMORIES
// =====================================

function sortMemories(
  memories = [],
  sortBy = "updatedAt",
  direction = "desc"
){

  const sortedMemories = [

    ...memories

  ];

  sortedMemories.sort((a,b) => {

    const valueA =
    a?.[sortBy];

    const valueB =
    b?.[sortBy];

    if(
      valueA > valueB
    ){

      return (
        direction ===
        "asc"
      )

      ? 1

      : -1;

    }

    if(
      valueA < valueB
    ){

      return (
        direction ===
        "asc"
      )

      ? -1

      : 1;

    }

    return 0;

  });

  return sortedMemories;

}



// =====================================
// PAGINATION
// =====================================

function paginateResults(
  results = [],
  page = 1,
  limit = 20
){

  if(
    !Array.isArray(
      results
    )
  ){

    return {

      page:1,

      limit:0,

      total:0,

      totalPages:0,

      results:[]

    };

  }

  const normalizedPage =
  Math.max(
    1,
    Number(page) || 1
  );

  const normalizedLimit =
  clampSearchLimit(
    limit
  );

  const startIndex =

    (
      normalizedPage - 1
    ) *

    normalizedLimit;

  const endIndex =

    startIndex +

    normalizedLimit;

  return {

    page:
    normalizedPage,

    limit:
    normalizedLimit,

    total:
    results.length,

    totalPages:
    Math.ceil(

      results.length /

      normalizedLimit

    ),

    results:
    results.slice(
      startIndex,
      endIndex
    )

  };

}
