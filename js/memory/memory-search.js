// =====================================
// RIGO AI
// MEMORY SEARCH
// SEARCH LAYER
// =====================================

import {
  loadMemories
}
from "./memory-storage.js";

import {
  validateSearchQuery
}
from "./memory-validation.js";

import {
  lookupToken
}
from "./memory-indexing.js";

import {
  rankMemories,
  getTopResults
}
from "./memory-ranking.js";

import {
  normalizeText,
  tokenizeText
}
from "./memory-utils.js";

import {
  incrementSearches
}
from "./memory-state.js";

import {
  MEMORY_LIMITS,
  MEMORY_EVENTS
}
from "./memory-constants.js";

import {
  emit
}
from "./memory-events.js";



// =====================================
// TOKEN SEARCH
// =====================================

function searchByTokens(
  query
){

  const tokens =

    tokenizeText(
      query
    );

  const memoryIds =
  new Set();

  for(
    const token
    of tokens
  ){

    const matches =

      lookupToken(
        token
      );

    for(
      const id
      of matches
    ){

      memoryIds.add(
        id
      );

    }

  }

  return memoryIds;

}



// =====================================
// LOAD MATCHES
// =====================================

function loadMatchedMemories(
  memoryIds
){

  const memories =
  loadMemories();

  return memories.filter(

    memory =>

    memoryIds.has(
      memory.id
    )

  );

}



// =====================================
// EXACT SEARCH
// =====================================

function exactSearch(
  query
){

  const normalized =

    normalizeText(
      query
    );

  return loadMemories()
  .filter(

    memory =>

    normalizeText(

      memory.content

    )
    .includes(
      normalized
    )

  );

}



// =====================================
// INDEX SEARCH
// =====================================

function indexedSearch(
  query
){

  const ids =

    searchByTokens(
      query
    );

  return loadMatchedMemories(
    ids
  );

}



// =====================================
// SEARCH
// =====================================

function searchMemories(

  query,

  options = {}

){

  if(

    !validateSearchQuery(
      query
    )

  ){

    return [];

  }

  incrementSearches();

  const exactResults =

    exactSearch(
      query
    );

  const indexedResults =

    indexedSearch(
      query
    );

  const unique =
  new Map();

  for(
    const memory
    of [

      ...exactResults,

      ...indexedResults

    ]
  ){

    unique.set(

      memory.id,

      memory

    );

  }

  const ranked =

    rankMemories(

      Array.from(
        unique.values()
      ),

      query

    );

  const limit =

    options.limit

    ??

    MEMORY_LIMITS
    .MAX_SEARCH_RESULTS;

  const results =
  getTopResults(

    ranked,

    limit

  )
  .map((result) => {
    return Object.freeze({
      ...result.memory,
      score:result.score
    });
  });

  emit(
    MEMORY_EVENTS.SEARCHED,
    {
      query:String(query),
      results:results.length
    }
  );

  return results;

}



// =====================================
// SEARCH ONE
// =====================================

function searchMemory(
  query
){

  const results =

    searchMemories(

      query,

      {
        limit:1
      }

    );

  return (

    results[0]

    ??

    null

  );

}



// =====================================
// SEARCH STATS
// =====================================

function getSearchStats(
  query
){

  const results =

    searchMemories(
      query
    );

  return Object.freeze({

    query,

    results:
    results.length

  });

}



// =====================================
// PUBLIC API
// =====================================

const MemorySearch =
Object.freeze({

  searchByTokens,

  exactSearch,

  indexedSearch,

  searchMemories,

  searchMemory,

  getSearchStats

});



// =====================================
// EXPORTS
// =====================================

export {

  searchByTokens,

  exactSearch,

  indexedSearch,

  searchMemories,

  searchMemory,

  getSearchStats,

  MemorySearch

};

export default
MemorySearch;
