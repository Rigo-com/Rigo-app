// =====================================
// RIGO AI
// SEARCH ENGINE
// ENTERPRISE ULTRA FINAL
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

  const searchToken =
  createMemoryId();

  searchState
  .activeSearchToken =
  searchToken;

  searchState.searching =
  true;

  searchState.currentState =
  SEARCH_STATES.SEARCHING;

  searchState.activeSearches++;

  searchState.pendingSearches++;

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

    if(

      searchState
      .activeSearchToken !==
      searchToken

    ){

      searchState
      .abortedSearches++;

      return [];

    }

    let results = [];



    // ================================
    // INDEXED SEARCH
    // ================================

    const indexedMemories =
    searchIndexedMemories(
      query
    );

    indexedMemories
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
            source:"indexed",

            snippet:
            createSearchSnippet(

              memory.content,

              query

            )

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

      if(

        searchState
        .activeSearchToken !==
        searchToken

      ){

        searchState
        .abortedSearches++;

        return [];

      }

      semanticResults
      .forEach((item) => {

        results.push(

          createSearchResult(

            item.memory,

            item.similarity,

            {
              source:"semantic",

              snippet:
              createSearchSnippet(

                item.memory
                ?.content,

                query

              )

            }

          )

        );

      });

    }



    // ================================
    // FUZZY SEARCH
    // ================================

    if(

      SEARCH_CONFIG
      .ENABLE_FUZZY_SEARCH

    ){

      const fuzzyTokens =
      findFuzzyTokens(
        normalizeSearchQuery(
          query
        )
      );

      fuzzyTokens
      .forEach((item) => {

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

              item.score *
              0.5,

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

    searchState
    .pendingSearches =

    Math.max(

      0,

      searchState
      .pendingSearches - 1

    );

  }

}
