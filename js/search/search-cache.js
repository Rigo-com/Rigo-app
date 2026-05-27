// =====================================
// RIGO AI
// SEARCH CACHE
// OPTIMIZED FINAL
// =====================================



// =====================================
// CACHE STATE
// =====================================

const searchCache =
Object.seal({

  results:new Map(),

  cacheHits:0,

  cacheMisses:0,

  cacheEvictions:0,

  lastClearedAt:null

});



// =====================================
// GET CACHED SEARCH
// =====================================

function getCachedSearch(
  cacheKey
){

  if(
    !SEARCH_CONFIG
    .ENABLE_CACHE
  ){

    return null;

  }

  const normalizedKey =
  String(cacheKey || "");

  if(!normalizedKey){

    return null;

  }

  const cached =
  searchCache.results
  .get(
    normalizedKey
  );

  if(!cached){

    searchCache
    .cacheMisses++;

    return null;

  }



  // ================================
  // EXPIRED
  // ================================

  if(

    Date.now() >

    cached.expiresAt

  ){

    searchCache.results
    .delete(
      normalizedKey
    );

    searchCache
    .cacheMisses++;

    return null;

  }

  searchCache
  .cacheHits++;

  searchState
  .cachedHits++;

  return cached.results;

}



// =====================================
// SET CACHED SEARCH
// =====================================

function setCachedSearch(
  cacheKey,
  results
){

  if(
    !SEARCH_CONFIG
    .ENABLE_CACHE
  ){

    return false;

  }

  const normalizedKey =
  String(cacheKey || "");

  if(!normalizedKey){

    return false;

  }

  if(
    !Array.isArray(results)
  ){

    return false;

  }



  // ================================
  // CACHE LIMIT
  // ================================

  while(

    searchCache.results
    .size >=

    SEARCH_CONFIG
    .MAX_CACHE_SIZE

  ){

    const firstKey =

      searchCache
      .results
      .keys()
      .next()
      .value;

    if(!firstKey){

      break;

    }

    searchCache
    .results
    .delete(
      firstKey
    );

    searchCache
    .cacheEvictions++;

  }



  // ================================
  // STORE
  // ================================

  searchCache
  .results
  .set(

    normalizedKey,

    {

      results:[...results],

      createdAt:
      Date.now(),

      expiresAt:

        Date.now() +

        SEARCH_CONFIG
        .CACHE_TTL

    }

  );

  return true;

}



// =====================================
// CLEANUP EXPIRED CACHE
// =====================================

function cleanupExpiredSearchCache(){

  let cleaned = 0;

  const now =
  Date.now();

  searchCache
  .results
  .forEach((value,key) => {

    if(
      now >
      value.expiresAt
    ){

      searchCache
      .results
      .delete(key);

      cleaned++;

    }

  });

  return cleaned;

}



// =====================================
// CLEAR CACHE
// =====================================

function clearSearchCache(){

  searchCache
  .results
  .clear();

  searchCache
  .lastClearedAt =
  Date.now();

  return true;

}



// =====================================
// CACHE DIAGNOSTICS
// =====================================

function getSearchCacheDiagnostics(){

  return {

    size:
    searchCache
    .results
    .size,

    cacheHits:
    searchCache
    .cacheHits,

    cacheMisses:
    searchCache
    .cacheMisses,

    cacheEvictions:
    searchCache
    .cacheEvictions,

    lastClearedAt:
    searchCache
    .lastClearedAt

  };

}



// =====================================
// EXPORTS
// =====================================

export {

  searchCache,

  getCachedSearch,

  setCachedSearch,

  cleanupExpiredSearchCache,

  clearSearchCache,

  getSearchCacheDiagnostics

};
