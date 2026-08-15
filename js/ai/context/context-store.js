// =====================================
// RIGO AI
// CONTEXT STORE
// =====================================

import {
  CONTEXT_MANAGER_CONFIG,
  CONTEXT_TYPES
}
from "./context-config.js";

import {
  contextManagerState
}
from "./context-state.js";

import {
  normalizeContextId,
  createContextId,
  safeClone,
  freezeContextObject,
  estimateTokens,
  hashContextContent,
  createSearchableText
}
from "./context-utils.js";

import {
  invalidateContextCache
}
from "./context-cache.js";

import {
  indexContext,
  removeIndexedContext
}
from "./context-indexer.js";



// =====================================
// LOCK
// =====================================

export async function acquireContextLock(){

  while(
    contextManagerState
    .operationLock
  ){

    await new Promise((resolve) => {

      setTimeout(resolve,1);

    });

  }

  contextManagerState
  .operationLock =
  true;

}



export function releaseContextLock(){

  contextManagerState
  .operationLock =
  false;

}


function removeContextHash(
  contextId
){

  contextManagerState
  .contentHashes
  .forEach((storedContextId,hash) => {

    if(storedContextId === contextId){
      contextManagerState
      .contentHashes
      .delete(hash);
    }

  });

}



// =====================================
// CONTEXT OBJECT
// =====================================

export function createContextObject(
  config = {}
){

  const content =
  safeClone(
    config.content || {}
  );

  const metadata =
  safeClone(
    config.metadata || {}
  );

  const searchableText =
  createSearchableText(
    content
  );

  const context = {

    id:
    normalizeContextId(

      config.id ||

      createContextId()

    ),

    namespace:
    String(
      config.namespace ||
      "runtime:default"
    ),

    type:

      config.type ||

      CONTEXT_TYPES
      .RUNTIME,

    priority:

      Number(
        config.priority
      ) || 1,

    score:0,

    tokens:
    estimateTokens(
      content
    ),

    searchableText,

    content,

    metadata,

    createdAt:
    config.createdAt ||
    Date.now(),

    updatedAt:
    config.updatedAt ||
    Date.now(),

    runtime:{

      accessCount:0,

      lastAccessedAt:null

    }

  };

  return freezeContextObject(
    context
  );

}



// =====================================
// REGISTER
// =====================================

export async function registerContext(
  config = {}
){

  await acquireContextLock();

  try{

    if(
      contextManagerState
      .shuttingDown
    ){

      return false;

    }

    if(

      contextManagerState
      .contexts
      .size >=

      CONTEXT_MANAGER_CONFIG
      .MAX_CONTEXTS

    ){

      contextManagerState
      .diagnostics
      .rejected++;

      return false;

    }

    const hash =
    hashContextContent(
      {
        namespace:
        config.namespace ||
        "runtime:default",
        type:
        config.type ||
        CONTEXT_TYPES.RUNTIME,
        content:
        config.content
      }
    );

    if(

      CONTEXT_MANAGER_CONFIG
      .ENABLE_DEDUPLICATION

      &&

      contextManagerState
      .contentHashes
      .has(hash)

    ){

      contextManagerState
      .diagnostics
      .duplicates++;

      return false;

    }

    const context =
    createContextObject(
      config
    );

    contextManagerState
    .contexts
    .set(
      context.id,
      context
    );

    contextManagerState
    .contentHashes
    .set(
      hash,
      context.id
    );

    indexContext(
      context
    );

    invalidateContextCache(
      context.id
    );

    contextManagerState
    .diagnostics
    .created++;

    contextManagerState
    .lastUpdatedAt =
    Date.now();

    return context;

  }

  finally{

    releaseContextLock();

  }

}



// =====================================
// UPDATE
// =====================================

export async function updateContext(
  contextId,
  updates = {}
){

  await acquireContextLock();

  try{

    const normalizedId =
    normalizeContextId(
      contextId
    );

    const existing =
    contextManagerState
    .contexts
    .get(
      normalizedId
    );

    if(!existing){

      return false;

    }

    removeIndexedContext(
      normalizedId
    );

    removeContextHash(
      normalizedId
    );

    const updated =
    createContextObject({

      ...safeClone(existing),

      ...safeClone(updates),

      id:
      normalizedId,

      createdAt:
      existing.createdAt,

      updatedAt:
      Date.now()

    });

    contextManagerState
    .contexts
    .set(
      normalizedId,
      updated
    );

    indexContext(
      updated
    );

    contextManagerState
    .contentHashes
    .set(
      hashContextContent({
        namespace:updated.namespace,
        type:updated.type,
        content:updated.content
      }),
      normalizedId
    );

    invalidateContextCache(
      normalizedId
    );

    contextManagerState
    .diagnostics
    .updated++;

    contextManagerState
    .lastUpdatedAt =
    Date.now();

    return true;

  }

  finally{

    releaseContextLock();

  }

}



// =====================================
// REMOVE
// =====================================

export async function removeContext(
  contextId,
  options = {}
){

  await acquireContextLock();

  try{

    const normalizedId =
    normalizeContextId(
      contextId
    );

    const removed =
    contextManagerState
    .contexts
    .delete(
      normalizedId
    );

    if(!removed){

      return false;

    }

    removeIndexedContext(
      normalizedId
    );

    removeContextHash(
      normalizedId
    );

    invalidateContextCache(
      normalizedId
    );

    contextManagerState
    .diagnostics
    .removed++;

    if(options.reason === "eviction"){
      contextManagerState
      .diagnostics
      .evicted++;
    }

    contextManagerState
    .lastUpdatedAt =
    Date.now();

    return true;

  }

  finally{

    releaseContextLock();

  }

}
