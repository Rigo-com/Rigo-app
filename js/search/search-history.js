// =====================================
// RIGO AI
// SEARCH HISTORY
// ENTERPRISE FINAL
// =====================================



const searchHistoryState =
Object.seal({

  history:[],

  failedQueries:[],

  popularQueries:
  new Map(),

  maxHistory:500

});



function storeSearchHistory(
  query,
  success = true
){

  const normalizedQuery =
  normalizeSearchQuery(
    query
  );

  if(
    !normalizedQuery
  ){

    return false;
  }

  searchHistoryState
  .history
  .push({

    query:
    normalizedQuery,

    success,

    createdAt:
    Date.now()

  });

  if(
    !success
  ){

    searchHistoryState
    .failedQueries
    .push(
      normalizedQuery
    );

  }

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

  if(

    searchHistoryState
    .history.length >

    searchHistoryState
    .maxHistory

  ){

    searchHistoryState
    .history.shift();

  }

  return true;

}



function getPopularSearches(
  limit = 10
){

  return [

    ...searchHistoryState
    .popularQueries
    .entries()

  ]

  .sort((a,b) => {

    return b[1] - a[1];

  })

  .slice(0,limit);

}
