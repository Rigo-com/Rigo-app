// =====================================
// RIGO AI
// SEARCH HISTORY
// OPTIMIZED FINAL
// =====================================



// =====================================
// HISTORY CONFIG
// =====================================

const SEARCH_HISTORY_CONFIG =
Object.freeze({

  MAX_HISTORY:500,

  MAX_FAILED_QUERIES:100,

  MAX_POPULAR_QUERIES:200

});



// =====================================
// HISTORY STATE
// =====================================

const searchHistoryState =
Object.seal({

  history:[],

  failedQueries:[],

  popularQueries:
  new Map(),

  totalSearches:0,

  successfulSearches:0,

  failedSearches:0,

  lastSearchAt:null

});



// =====================================
// STORE SEARCH HISTORY
// =====================================

function storeSearchHistory(
  query,
  success = true
){

  const normalizedQuery =
  normalizeSearchQuery?.(
    query
  );

  if(
    !normalizedQuery
  ){

    return false;

  }

  const entry = {

    query:
    normalizedQuery,

    success:
    success === true,

    createdAt:
    Date.now()

  };



  // ================================
  // HISTORY
  // ================================

  searchHistoryState
  .history
  .push(
    entry
  );

  while(

    searchHistoryState
    .history
    .length >

    SEARCH_HISTORY_CONFIG
    .MAX_HISTORY

  ){

    searchHistoryState
    .history
    .shift();

  }



  // ================================
  // FAILED
  // ================================

  if(
    !success
  ){

    searchHistoryState
    .failedQueries
    .push(
      normalizedQuery
    );

    while(

      searchHistoryState
      .failedQueries
      .length >

      SEARCH_HISTORY_CONFIG
      .MAX_FAILED_QUERIES

    ){

      searchHistoryState
      .failedQueries
      .shift();

    }

  }



  // ================================
  // POPULAR
  // ================================

  const currentCount =

    searchHistoryState
    .popularQueries
    .get(
      normalizedQuery
    ) || 0;

  searchHistoryState
  .popularQueries
  .set(

    normalizedQuery,

    currentCount + 1

  );

  while(

    searchHistoryState
    .popularQueries
    .size >

    SEARCH_HISTORY_CONFIG
    .MAX_POPULAR_QUERIES

  ){

    const oldestKey =

      searchHistoryState
      .popularQueries
      .keys()
      .next()
      .value;

    if(!oldestKey){

      break;

    }

    searchHistoryState
    .popularQueries
    .delete(
      oldestKey
    );

  }



  // ================================
  // STATS
  // ================================

  searchHistoryState
  .totalSearches++;

  searchHistoryState
  .lastSearchAt =
  Date.now();

  if(
    success
  ){

    searchHistoryState
    .successfulSearches++;

  }

  else{

    searchHistoryState
    .failedSearches++;

  }

  return true;

}



// =====================================
// POPULAR SEARCHES
// =====================================

function getPopularSearches(
  limit = 10
){

  const safeLimit =
  Math.max(
    1,
    Number(limit) || 10
  );

  return [

    ...searchHistoryState
    .popularQueries
    .entries()

  ]

  .sort((a,b) => {

    return b[1] - a[1];

  })

  .slice(0,safeLimit)

  .map(([query,count]) => {

    return {

      query,
      count

    };

  });

}



// =====================================
// RECENT SEARCHES
// =====================================

function getRecentSearches(
  limit = 10
){

  return searchHistoryState
  .history
  .slice(
    -Math.max(
      1,
      Number(limit) || 10
    )
  )
  .reverse();

}



// =====================================
// CLEAR HISTORY
// =====================================

function clearSearchHistory(){

  searchHistoryState
  .history = [];

  searchHistoryState
  .failedQueries = [];

  searchHistoryState
  .popularQueries
  .clear();

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getSearchHistoryDiagnostics(){

  return {

    totalSearches:
    searchHistoryState
    .totalSearches,

    successfulSearches:
    searchHistoryState
    .successfulSearches,

    failedSearches:
    searchHistoryState
    .failedSearches,

    historySize:
    searchHistoryState
    .history
    .length,

    failedQueries:
    searchHistoryState
    .failedQueries
    .length,

    popularQueries:
    searchHistoryState
    .popularQueries
    .size,

    lastSearchAt:
    searchHistoryState
    .lastSearchAt

  };

}



// =====================================
// EXPORTS
// =====================================

export {

  SEARCH_HISTORY_CONFIG,

  searchHistoryState,

  storeSearchHistory,

  getPopularSearches,

  getRecentSearches,

  clearSearchHistory,

  getSearchHistoryDiagnostics

};
