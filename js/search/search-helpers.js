// =====================================
// RIGO AI
// SEARCH HELPERS
// UTILITY LAYER
// =====================================



// =====================================
// IDS
// =====================================

function createSearchId(
  prefix = "search"
){

  return (

    String(prefix)

    + "_"

    + Date.now()

    + "_"

    + Math.random()
    .toString(36)
    .slice(2,10)

  );

}



// =====================================
// QUERY
// =====================================

function normalizeQuery(
  query = ""
){

  return String(
    query
  )
  .trim()
  .toLowerCase();

}



function createCacheKey(
  query = "",
  options = {}
){

  return JSON.stringify({

    query:
    normalizeQuery(
      query
    ),

    options

  });

}



// =====================================
// VALIDATION
// =====================================

function isValidQuery(
  query
){

  return (

    typeof query ===
    "string"

    &&

    query
    .trim()
    .length > 0

  );

}



function isValidSearchResult(
  result
){

  return (

    result !== null

    &&

    typeof result ===
    "object"

  );

}



function isValidSearchResults(
  results
){

  return Array.isArray(
    results
  );

}



// =====================================
// SNIPPETS
// =====================================

function createSnippet(
  content = "",
  query = "",
  maxLength = 150
){

  const text =
  String(content);

  const normalizedQuery =
  normalizeQuery(
    query
  );

  const index =

    text
    .toLowerCase()
    .indexOf(
      normalizedQuery
    );

  if(
    index < 0
  ){

    return text.slice(
      0,
      maxLength
    );

  }

  const start =

    Math.max(
      0,
      index - 50
    );

  return text.slice(

    start,

    start +
    maxLength

  );

}



// =====================================
// RESULTS
// =====================================

function createSearchResult(

  item,
  score = 0,
  metadata = {}

){

  return Object.freeze({

    item,

    score,

    metadata

  });

}



// =====================================
// RESPONSE HELPERS
// =====================================

function normalizeError(
  error
){

  if(
    error instanceof Error
  ){

    return {

      name:
      error.name,

      message:
      error.message

    };

  }

  return {

    name:
    "Error",

    message:
    String(
      error ??
      "Unknown Error"
    )

  };

}



// =====================================
// PUBLIC API
// =====================================

const SearchHelpers =
Object.freeze({

  createSearchId,

  normalizeQuery,

  createCacheKey,

  isValidQuery,

  isValidSearchResult,

  isValidSearchResults,

  createSnippet,

  createSearchResult,

  normalizeError

});



// =====================================
// EXPORTS
// =====================================

export {

  createSearchId,

  normalizeQuery,

  createCacheKey,

  isValidQuery,

  isValidSearchResult,

  isValidSearchResults,

  createSnippet,

  createSearchResult,

  normalizeError,

  SearchHelpers

};

export default
SearchHelpers;
