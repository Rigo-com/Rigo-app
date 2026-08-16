// =====================================
// RIGO AI
// CONTEXT CACHE
// =====================================

import {
  CONTEXT_MANAGER_CONFIG
}
from "./context-config.js";

import {
  contextManagerState,
  incrementContextDiagnostic
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
  maxTokens,
  namespace = "runtime:default"
){

  return (

    (
      CONTEXT_MANAGER_CONFIG.ENABLE_NAMESPACE_ISOLATION
      ? normalizeContextId(namespace)
      : "context:shared"
    ) +

    "::" +

    normalizeContextId(query) +

    "::" +

    String(maxTokens)

  );

}



export function invalidateContextCache(
  contextId = null
){

  clearContextCache();

  return true;

}



export function readContextCache(
  query,
  maxTokens,
  namespace
){

  if(!CONTEXT_MANAGER_CONFIG.ENABLE_CONTEXT_CACHE){
    return null;
  }

  const key =
  createCacheKey(
    query,
    maxTokens,
    namespace
  );

  const cached =
  contextManagerState
  .retrievalCache
  .get(key);

  if(!cached){

    incrementContextDiagnostic(
      "cacheMisses"
    );

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

    incrementContextDiagnostic(
      "cacheMisses"
    );

    return null;

  }

  incrementContextDiagnostic(
    "cacheHits"
  );

  return cached.value;

}



export function writeContextCache(
  query,
  maxTokens,
  value,
  namespace
){

  if(!CONTEXT_MANAGER_CONFIG.ENABLE_CONTEXT_CACHE){
    return false;
  }

  const key =
  createCacheKey(
    query,
    maxTokens,
    namespace
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
