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
      config.content
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

    const updated =
    createContextObject({

      ...safeClone(existing),

      ...safeClone(updates),

      id:
      normalizedId,

      createdAt:
      existing.createdAt

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
  contextId
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

    invalidateContextCache(
      normalizedId
    );

    contextManagerState
    .diagnostics
    .removed++;

    return true;

  }

  finally{

    releaseContextLock();

  }

}
