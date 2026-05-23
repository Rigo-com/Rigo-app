// =====================================
// RIGO AI
// SEARCH ENGINE
// ENTERPRISE FINAL
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
    createSearchCacheKey(
      query,
      options
    );

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

    let results = [];



    // ================================
    // BASIC SEARCH
    // ================================

    memoryState.memories
    .forEach((memory) => {

      const score =
      calculateSearchRanking(
        memory,
        query
      );

      if(score <= 0){

        return;
      }

      results.push(

        createSearchResult(
          memory,
          score,
          {
            source:"basic"
          }
        )

      );

    });



    // ================================
    // SEMANTIC SEARCH
    // ================================

    if(

      SEARCH_CONFIG
      .ENABLE_SEMANTIC_SEARCH

      &&

      typeof semanticMemorySearch ===
      "function"

    ){

      const semanticResults =
      semanticMemorySearch(
        query,
        options
      );

      semanticResults
      .forEach((item) => {

        results.push(

          createSearchResult(

            item.memory,

            item.similarity,

            {
              source:"semantic"
            }

          )

        );

      });

    }



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

    if(

      SEARCH_CONFIG
      .ENABLE_CACHE

    ){

      setCachedSearch(
        cacheKey,
        results
      );

    }

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
