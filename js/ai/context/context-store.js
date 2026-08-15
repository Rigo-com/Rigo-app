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
  createSearchableText,
  serializeContext
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


function createStoredContextHash(
  context
){

  return hashContextContent({
    namespace:
    context.namespace ||
    "runtime:default",
    type:
    context.type ||
    CONTEXT_TYPES.RUNTIME,
    content:
    context.content
  });

}


function getContextHashEntries(
  contextId
){

  const entries = [];

  contextManagerState
  .contentHashes
  .forEach((storedContextId,hash) => {

    if(storedContextId === contextId){
      entries.push([
        hash,
        storedContextId
      ]);
    }

  });

  return entries;

}


function getContextTypeCollection(
  type
){

  switch(String(type || "").toLowerCase()){

    case CONTEXT_TYPES.SESSION:
      return contextManagerState.sessions;

    case CONTEXT_TYPES.RUNTIME:
      return contextManagerState.runtimeContexts;

    case CONTEXT_TYPES.SHARED:
      return contextManagerState.sharedContexts;

    default:
      return null;

  }

}


function isContextTypeEnabled(
  type
){

  switch(String(type || "").toLowerCase()){

    case CONTEXT_TYPES.SESSION:
      return CONTEXT_MANAGER_CONFIG.ENABLE_SESSION_CONTEXT;

    case CONTEXT_TYPES.RUNTIME:
      return CONTEXT_MANAGER_CONFIG.ENABLE_RUNTIME_CONTEXT;

    case CONTEXT_TYPES.SHARED:
      return CONTEXT_MANAGER_CONFIG.ENABLE_SHARED_CONTEXT;

    default:
      return true;

  }

}


function hasContextTypeCapacity(
  type,
  existingId = null
){

  const collection =
  getContextTypeCollection(type);

  if(!collection){
    return true;
  }

  if(existingId && collection.has(existingId)){
    return true;
  }

  if(type === CONTEXT_TYPES.SESSION){
    return collection.size < CONTEXT_MANAGER_CONFIG.MAX_SESSION_CONTEXTS;
  }

  if(type === CONTEXT_TYPES.RUNTIME){
    return collection.size < CONTEXT_MANAGER_CONFIG.MAX_RUNTIME_CONTEXTS;
  }

  return true;

}


function trackContextType(
  context
){

  getContextTypeCollection(context?.type)
  ?.set(context.id,context);

  return true;

}


function untrackContextType(
  context
){

  getContextTypeCollection(context?.type)
  ?.delete(context.id);

  return true;

}


function isContextContentWithinLimits(
  content
){

  const serialized =
  serializeContext(content);

  if(
    serialized.length >
    CONTEXT_MANAGER_CONFIG.MAX_CONTENT_SIZE
  ){
    return false;
  }

  const itemCount =
  Array.isArray(content)
  ? content.length
  : (
      content &&
      typeof content === "object"
      ? Object.keys(content).length
      : 1
    );

  return (
    itemCount <=
    CONTEXT_MANAGER_CONFIG.MAX_CONTEXT_ITEMS
  );

}


export function touchContext(
  contextId,
  accessedAt = Date.now()
){

  const normalizedId =
  normalizeContextId(contextId);

  const existing =
  contextManagerState
  .contexts
  .get(normalizedId);

  if(!existing){
    return null;
  }

  const touched =
  freezeContextObject({
    ...safeClone(existing),
    runtime:{
      ...safeClone(existing.runtime),
      accessCount:
      Number(existing.runtime?.accessCount || 0) + 1,
      lastAccessedAt:
      Number(accessedAt) || Date.now()
    }
  });

  contextManagerState
  .contexts
  .set(normalizedId,touched);

  getContextTypeCollection(existing.type)
  ?.set(normalizedId,touched);

  return touched;

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

      String(
        config.type ||
        CONTEXT_TYPES.RUNTIME
      )
      .trim()
      .toLowerCase(),

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

    const requestedType =
    String(
      config.type ||
      CONTEXT_TYPES.RUNTIME
    )
    .trim()
    .toLowerCase();

    if(
      !isContextContentWithinLimits(
        config.content || {}
      )
    ){

      contextManagerState
      .diagnostics
      .rejected++;

      return false;

    }

    if(
      !isContextTypeEnabled(requestedType) ||
      !hasContextTypeCapacity(requestedType)
    ){

      contextManagerState
      .diagnostics
      .rejected++;

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
    createStoredContextHash({
      namespace:
      config.namespace ||
      "runtime:default",
      type:
      config.type ||
      CONTEXT_TYPES.RUNTIME,
      content:
      config.content
    });

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

    trackContextType(
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

    if(
      !isContextContentWithinLimits(
        updated.content
      )
    ){

      contextManagerState
      .diagnostics
      .rejected++;

      return false;

    }

    if(
      !isContextTypeEnabled(updated.type) ||
      !hasContextTypeCapacity(
        updated.type,
        updated.type === existing.type
        ? normalizedId
        : null
      )
    ){

      contextManagerState
      .diagnostics
      .rejected++;

      return false;

    }

    const updatedHash =
    createStoredContextHash(
      updated
    );

    const duplicateContextId =
    contextManagerState
    .contentHashes
    .get(
      updatedHash
    );

    if(
      CONTEXT_MANAGER_CONFIG
      .ENABLE_DEDUPLICATION

      &&

      duplicateContextId

      &&

      duplicateContextId !==
      normalizedId
    ){

      contextManagerState
      .diagnostics
      .duplicates++;

      return false;

    }

    const existingHashes =
    getContextHashEntries(
      normalizedId
    );

    try{

      removeIndexedContext(
        normalizedId
      );

      removeContextHash(
        normalizedId
      );

      untrackContextType(
        existing
      );

      contextManagerState
      .contexts
      .set(
        normalizedId,
        updated
      );

      trackContextType(
        updated
      );

      indexContext(
        updated
      );

      contextManagerState
      .contentHashes
      .set(
        updatedHash,
        normalizedId
      );

    }

    catch(error){

      removeIndexedContext(
        normalizedId
      );

      removeContextHash(
        normalizedId
      );

      untrackContextType(
        updated
      );

      contextManagerState
      .contexts
      .set(
        normalizedId,
        existing
      );

      trackContextType(
        existing
      );

      indexContext(
        existing
      );

      existingHashes
      .forEach(([hash,storedContextId]) => {
        contextManagerState
        .contentHashes
        .set(hash,storedContextId);
      });

      throw error;

    }

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

    const existing =
    contextManagerState
    .contexts
    .get(
      normalizedId
    );

    const removed =
    contextManagerState
    .contexts
    .delete(
      normalizedId
    );

    if(!removed || !existing){

      return false;

    }

    removeIndexedContext(
      normalizedId
    );

    removeContextHash(
      normalizedId
    );

    untrackContextType(
      existing
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
