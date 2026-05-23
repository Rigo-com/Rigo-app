// =====================================
// RIGO AI
// SEARCH UTILS
// ENTERPRISE FINAL
// =====================================



function normalizeSearchQuery(
  query
){

  return normalizeMemoryText(
    query
  )
  .slice(

    0,

    SEARCH_CONFIG
    .MAX_QUERY_LENGTH

  );

}



function isValidSearchQuery(
  query
){

  return (

    normalizeSearchQuery(
      query
    )
    .length >=

    SEARCH_CONFIG
    .MIN_QUERY_LENGTH

  );

}



function clampSearchLimit(
  limit
){

  return clampMemoryNumber(

    Number(limit) ||

    SEARCH_CONFIG
    .DEFAULT_LIMIT,

    1,

    SEARCH_CONFIG
    .MAX_RESULTS

  );

}



function normalizeSearchOffset(
  offset
){

  return Math.max(

    0,

    Number(offset) || 0

  );

}



function safeSearchObject(
  value
){

  if(

    !value ||

    typeof value !==
    "object" ||

    Array.isArray(value)

  ){

    return {};
  }

  return value;

}



function createSearchCacheKey(
  query,
  options = {}
){

  return createMemoryHash(

    JSON.stringify({

      query:
      normalizeSearchQuery(
        query
      ),

      options

    })

  );

}



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
    unique.get(memoryId);

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
