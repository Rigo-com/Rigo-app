// =====================================
// RIGO AI
// SEARCH CACHE
// ENTERPRISE FINAL
// =====================================



const searchCache =
Object.seal({

  results:new Map()

});



function getCachedSearch(
  cacheKey
){

  const cached =
  searchCache.results
  .get(cacheKey);

  if(!cached){

    return null;
  }

  if(

    Date.now() >

    cached.expiresAt

  ){

    searchCache.results
    .delete(
      cacheKey
    );

    return null;
  }

  searchState.cachedHits++;

  return cached.results;

}



function setCachedSearch(
  cacheKey,
  results
){

  if(

    searchCache.results
    .size >=

    SEARCH_CONFIG
    .MAX_CACHE_SIZE

  ){

    const firstKey =

      searchCache.results
      .keys()
      .next()
      .value;

    searchCache.results
    .delete(firstKey);

  }

  searchCache.results
  .set(cacheKey,{

    results,

    expiresAt:

      Date.now() +

      SEARCH_CONFIG
      .CACHE_TTL

  });

  return true;

}



function clearSearchCache(){

  searchCache.results
  .clear();

  return true;

}
