// =====================================
// RIGO AI
// SEARCH UTILS
// OPTIMIZED FINAL EDITION
// =====================================



// =====================================
// SEARCH CACHE KEY
// =====================================

async function createSearchCacheKey(
  query,
  options = {}
){

  try{

    const payload =
    JSON.stringify({

      query:
      normalizeSearchQuery(
        query
      ),

      options:
      safeSearchObject(
        options
      )

    });

    if(

      typeof createMemoryHash ===
      "function"

    ){

      return await createMemoryHash(
        payload
      );

    }

    return payload;

  }

  catch(error){

    return String(query || "");

  }

}



// =====================================
// RESULT DEDUPLICATION
// =====================================

function deduplicateSearchResults(
  results = []
){

  const unique =
  new Map();

  results.forEach((result) => {

    const memoryId =
    result?.memory?.id;

    if(!memoryId){

      return;

    }

    const existing =
    unique.get(
      memoryId
    );

    if(

      !existing ||

      result.score >
      existing.score

    ){

      unique.set(
        memoryId,
        result
      );

    }

  });

  return [

    ...unique.values()

  ];

}



// =====================================
// SORT RESULTS
// =====================================

function sortSearchResults(
  results = []
){

  return [

    ...results

  ]

  .sort((a,b) => {

    return (

      (b?.score || 0)

      -

      (a?.score || 0)

    );

  });

}



// =====================================
// LIMIT RESULTS
// =====================================

function limitSearchResults(
  results = [],
  limit =
  SEARCH_CONFIG
  .DEFAULT_LIMIT
){

  return results.slice(

    0,

    normalizeSearchLimit(
      limit
    )

  );

}



// =====================================
// FILTER VALID RESULTS
// =====================================

function filterValidSearchResults(
  results = []
){

  return results.filter((result) => {

    return (

      result &&

      result.memory &&

      result.memory.id

    );

  });

}



// =====================================
// PREPARE RESULTS
// =====================================

function prepareSearchResults(
  results = [],
  limit
){

  return limitSearchResults(

    sortSearchResults(

      deduplicateSearchResults(

        filterValidSearchResults(
          results
        )

      )

    ),

    limit

  );

}



// =====================================
// SEARCH DIAGNOSTICS
// =====================================

function getSearchUtilityDiagnostics(){

  return {

    utilities:true,

    timestamp:
    Date.now()

  };

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(typeof globalThis === "object"){

  globalThis.prepareSearchResults =
  prepareSearchResults;

}



// =====================================
// EXPORTS
// =====================================

export {

  createSearchCacheKey,

  deduplicateSearchResults,

  sortSearchResults,

  limitSearchResults,

  filterValidSearchResults,

  prepareSearchResults,

  getSearchUtilityDiagnostics

};



// =====================================
// DEFAULT EXPORT
// =====================================

export default {

  createSearchCacheKey,

  deduplicateSearchResults,

  sortSearchResults,

  limitSearchResults,

  filterValidSearchResults,

  prepareSearchResults,

  getSearchUtilityDiagnostics

};
