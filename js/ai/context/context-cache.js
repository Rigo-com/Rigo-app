// =====================================
// RIGO AI
// CONTEXT CACHE
// =====================================

import {
  CONTEXT_MANAGER_CONFIG
}
from "./context-config.js";

import {
  contextManagerState
}
from "./context-state.js";

import {
  normalizeContextId
}
from "./context-utils.js";



export function clearContextCache(){

  contextManagerState
  .retrievalCache
  .clear();

}



export function createCacheKey(
  query,
  maxTokens
){

  return (

    normalizeContextId(query) +

    "::" +

    String(maxTokens)

  );

}



export function invalidateContextCache(
  contextId = null
){

  if(!contextId){

    clearContextCache();

    return true;

  }

  const normalizedId =
  normalizeContextId(
    contextId
  );

  contextManagerState
  .retrievalCache
  .forEach((_,key) => {

    if(
      key.includes(
        normalizedId
      )
    ){

      contextManagerState
      .retrievalCache
      .delete(key);

    }

  });

  return true;

}



export function readContextCache(
  query,
  maxTokens
){

  const key =
  createCacheKey(
    query,
    maxTokens
  );

  const cached =
  contextManagerState
  .retrievalCache
  .get(key);

  if(!cached){

    contextManagerState
    .diagnostics
    .cacheMisses++;

    return null;

  }

  if(

    Date.now() -
    cached.createdAt >

    CONTEXT_MANAGER_CONFIG
    .CACHE_TTL

  ){

    contextManagerState
    .retrievalCache
    .delete(key);

    contextManagerState
    .diagnostics
    .cacheMisses++;

    return null;

  }

  contextManagerState
  .diagnostics
  .cacheHits++;

  return cached.value;

}



export function writeContextCache(
  query,
  maxTokens,
  value
){

  const key =
  createCacheKey(
    query,
    maxTokens
  );

  contextManagerState
  .retrievalCache
  .set(
    key,
    {

      value,

      createdAt:
      Date.now()

    }

  );

  while(

    contextManagerState
    .retrievalCache
    .size >

    CONTEXT_MANAGER_CONFIG
    .MAX_CACHE_ITEMS

  ){

    const firstKey =

      contextManagerState
      .retrievalCache
      .keys()
      .next()
      .value;

    contextManagerState
    .retrievalCache
    .delete(
      firstKey
    );

  }

  return true;

}
