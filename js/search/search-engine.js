// =====================================
// RIGO AI
// SEARCH ENGINE
// OPTIMIZED FINAL
// =====================================



// =====================================
// SEARCH SOURCES
// =====================================

function executeIndexedSearch(
  query
){

  return searchIndexedMemories(
    query
  )
  .map((memory) => {

    const score =
    calculateSearchRanking(
      memory,
      query
    );

    if(score <= 0){

      return null;

    }

    return createSearchResult(

      memory,

      score,

      {
        source:"indexed",

        snippet:
        createSearchSnippet(

          memory.content,

          query

        )

      }

    );

  })
  .filter(Boolean);

}



async function executeSemanticSearch(
  query,
  options = {}
){

  if(

    !SEARCH_CONFIG
    .ENABLE_SEMANTIC_SEARCH

    ||

    typeof semanticMemorySearch !==
    "function"

  ){

    return [];

  }

  try{

    const results =
    await semanticMemorySearch(
      query,
      options
    );

    return results.map((item) => {

      return createSearchResult(

        item.memory,

        item.similarity,

        {
          source:"semantic",

          snippet:
          createSearchSnippet(

            item.memory?.content,

            query

          )

        }

      );

    });

  }

  catch(error){

    return [];

  }

}



function executeFuzzySearch(
  query
){

  if(

    !SEARCH_CONFIG
    .ENABLE_FUZZY_SEARCH

  ){

    return [];

  }

  const results = [];

  const fuzzyTokens =
  findFuzzyTokens(
    normalizeSearchQuery(
      query
    )
  );

  fuzzyTokens.forEach((item) => {

    const indexed =

      searchIndexState
      .tokenIndex
      .get(
        item.token
      );

    if(!indexed){

      return;

    }

    indexed.forEach((id) => {

      const memory =
      getMemoryById(id);

      if(!memory){

        return;

      }

      results.push(

        createSearchResult(

          memory,

          item.score * 0.5,

          {
            source:"fuzzy",

            fuzzyToken:
            item.token,

            snippet:
            createSearchSnippet(

              memory.content,

              query

            )

          }

        )

      );

    });

  });

  return results;

}



// =====================================
// SEARCH ENGINE
// =====================================

async function executeMemorySearch(
  query,
  options = {}
){

  if(
    !isValidSearchQuery(
      query
    )
  ){

    return [];

  }

  const startedAt =
  performance.now();

  searchState.searching =
  true;

  searchState.currentState =
  SEARCH_STATES.SEARCHING;

  searchState.activeSearches++;

  try{

    const searchQuery =
    createSearchQuery(
      query,
      options
    );

    const cacheKey =
    await createSearchCacheKey(
      query,
      options
    );



    // ================================
    // CACHE
    // ================================

    if(
      SEARCH_CONFIG
      .ENABLE_CACHE
    ){

      const cached =
      getCachedSearch(
        cacheKey
      );

      if(cached){

        return cached;

      }

    }



    // ================================
    // SEARCH SOURCES
    // ================================

    let results = [

      ...executeIndexedSearch(
        query
      ),

      ...await executeSemanticSearch(
        query,
        options
      ),

      ...executeFuzzySearch(
        query
      )

    ];



    // ================================
    // FILTERS
    // ================================

    results =
    filterSearchResults(

      results,

      searchQuery.filters

    );



    // ================================
    // DEDUPLICATION
    // ================================

    results =
    deduplicateSearchResults(
      results
    );



    // ================================
    // SORTING
    // ================================

    results =
    sortMemoriesByScore(
      results
    );



    // ================================
    // PAGINATION
    // ================================

    results =
    results.slice(

      searchQuery.offset,

      searchQuery.offset +
      searchQuery.limit

    );



    // ================================
    // CACHE STORE
    // ================================

    if(
      SEARCH_CONFIG
      .ENABLE_CACHE
    ){

      setCachedSearch(
        cacheKey,
        results
      );

    }



    // ================================
    // HISTORY
    // ================================

    storeSearchHistory(
      query,
      results.length > 0
    );



    // ================================
    // LATENCY
    // ================================

    const latency =
    performance.now() -
    startedAt;

    searchState
    .lastSearchLatency =
    latency;

    searchState
    .averageSearchLatency =

      searchState
      .totalSearches <= 0

      ?

      latency

      :

      (
        searchState
        .averageSearchLatency +

        latency
      ) / 2;



    // ================================
    // STATE
    // ================================

    searchState
    .lastQuery = query;

    searchState
    .lastSearchAt =
    Date.now();

    searchState
    .totalSearches++;

    searchState
    .currentState =
    SEARCH_STATES.READY;

    return results;

  }

  catch(error){

    searchState
    .failedSearches++;

    searchState
    .currentState =
    SEARCH_STATES.FAILED;

    storeSearchHistory(
      query,
      false
    );

    return [];

  }

  finally{

    searchState
    .searching = false;

    searchState
    .activeSearches =

    Math.max(

      0,

      searchState
      .activeSearches - 1

    );

  }

}



// =====================================
// EXPORTS
// =====================================

export {

  executeIndexedSearch,

  executeSemanticSearch,

  executeFuzzySearch,

  executeMemorySearch

};
