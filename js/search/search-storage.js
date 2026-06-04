// =====================================
// RIGO AI
// SEARCH STORAGE
// STORAGE LAYER
// =====================================

import {

  SEARCH_LIMITS,

  SEARCH_TIMERS

}
from "./search-config.js";



// =====================================
// STORAGE
// =====================================

const searchCache =
new Map();



const searchHistory =
new Map();



// =====================================
// CACHE
// =====================================

function setCache(
  key,
  value
){

  if(
    !key
  ){
    return false;
  }

  searchCache.set(

    key,

    {

      value,

      timestamp:
      Date.now()

    }

  );

  while(

    searchCache.size >

    SEARCH_LIMITS
    .MAX_CACHE_ENTRIES

  ){

    const oldest =

      searchCache
      .keys()
      .next()
      .value;

    searchCache.delete(
      oldest
    );

  }

  return true;

}



function getCache(
  key
){

  const entry =

    searchCache.get(
      key
    );

  if(
    !entry
  ){
    return null;
  }

  const expired =

    Date.now()

    -

    entry.timestamp

    >

    SEARCH_TIMERS
    .CACHE_TTL;

  if(
    expired
  ){

    searchCache.delete(
      key
    );

    return null;

  }

  return entry.value;

}



function removeCache(
  key
){

  return searchCache.delete(
    key
  );

}



function clearCache(){

  searchCache.clear();

  return true;

}



// =====================================
// HISTORY
// =====================================

function addHistory(
  query,
  metadata = {}
){

  if(
    !query
  ){
    return false;
  }

  searchHistory.set(

    createHistoryId(),

    {

      query,

      metadata,

      timestamp:
      Date.now()

    }

  );

  while(

    searchHistory.size >

    SEARCH_LIMITS
    .MAX_HISTORY_ENTRIES

  ){

    const oldest =

      searchHistory
      .keys()
      .next()
      .value;

    searchHistory.delete(
      oldest
    );

  }

  return true;

}



function getHistory(){

  return Array.from(

    searchHistory
    .values()

  );

}



function clearHistory(){

  searchHistory.clear();

  return true;

}



// =====================================
// TTL CLEANUP
// =====================================

function cleanupExpiredCache(){

  const now =
  Date.now();

  for(
    const [

      key,

      entry

    ]

    of

    searchCache
  ){

    const expired =

      now -

      entry.timestamp >

      SEARCH_TIMERS
      .CACHE_TTL;

    if(
      expired
    ){

      searchCache.delete(
        key
      );

    }

  }

  return true;

}



function cleanupExpiredHistory(){

  const now =
  Date.now();

  for(
    const [

      id,

      entry

    ]

    of

    searchHistory
  ){

    const expired =

      now -

      entry.timestamp >

      SEARCH_TIMERS
      .HISTORY_TTL;

    if(
      expired
    ){

      searchHistory.delete(
        id
      );

    }

  }

  return true;

}



// =====================================
// HELPERS
// =====================================

function createHistoryId(){

  return (

    "history_"

    +

    Date.now()

    +

    "_"

    +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



// =====================================
// STATS
// =====================================

function getStorageStats(){

  return Object.freeze({

    cache:
    searchCache.size,

    history:
    searchHistory.size

  });

}



// =====================================
// RESET
// =====================================

function resetStorage(){

  searchCache.clear();

  searchHistory.clear();

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const SearchStorage =
Object.freeze({

  setCache,

  getCache,

  removeCache,

  clearCache,

  addHistory,

  getHistory,

  clearHistory,

  cleanupExpiredCache,

  cleanupExpiredHistory,

  getStorageStats,

  resetStorage

});



// =====================================
// EXPORTS
// =====================================

export {

  setCache,

  getCache,

  removeCache,

  clearCache,

  addHistory,

  getHistory,

  clearHistory,

  cleanupExpiredCache,

  cleanupExpiredHistory,

  getStorageStats,

  resetStorage,

  SearchStorage

};

export default
SearchStorage;
