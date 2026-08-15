// =====================================
// RIGO AI
// CONTEXT LIFECYCLE
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
  removeContext
}
from "./context-store.js";



async function resetContextManager(){

  contextManagerState.contexts.clear();
  contextManagerState.sessions.clear();
  contextManagerState.runtimeContexts.clear();
  contextManagerState.sharedContexts.clear();
  contextManagerState.indexes.clear();
  contextManagerState.contextTokens.clear();
  contextManagerState.retrievalCache.clear();
  contextManagerState.contentHashes.clear();

  Object.keys(
    contextManagerState.diagnostics
  )
  .forEach((key) => {
    contextManagerState
    .diagnostics[key] = 0;
  });

  contextManagerState.startupPromise = null;
  contextManagerState.operationLock = false;
  contextManagerState.lastUpdatedAt = null;

  return true;

}



// =====================================
// EVICTION
// =====================================

async function evictExpiredContexts(
  now = Date.now()
){

  if(!CONTEXT_MANAGER_CONFIG.ENABLE_AUTO_EVICTION){
    return 0;
  }

  const cutoff =
  Number(now) -
  CONTEXT_MANAGER_CONFIG.MAX_CONTEXT_AGE;

  const expiredIds = [];

  for(const [contextId,context] of contextManagerState.contexts){

    const timestamp =
    Math.max(
      Number(context?.runtime?.lastAccessedAt || 0),
      Number(context?.updatedAt || 0),
      Number(context?.createdAt || 0)
    );

    if(timestamp > 0 && timestamp < cutoff){
      expiredIds.push(contextId);
    }

  }

  for(const contextId of expiredIds){
    await removeContext(
      contextId,
      {
        reason:"eviction"
      }
    );
  }

  return expiredIds.length;

}



function startEvictionLoop(){

  if(contextManagerState.evictionTimer){
    return true;
  }

  contextManagerState.evictionTimer =
  setInterval(() => {
    evictExpiredContexts().catch(() => {});
  },CONTEXT_MANAGER_CONFIG.EVICTION_INTERVAL);

  return true;

}



function stopEvictionLoop(){

  if(!contextManagerState.evictionTimer){
    return true;
  }

  clearInterval(contextManagerState.evictionTimer);
  contextManagerState.evictionTimer = null;

  return true;

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownContextManager(){

  contextManagerState.shuttingDown = true;

  stopEvictionLoop();
  await resetContextManager();

  contextManagerState.initialized = false;

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initializeContextManager(){

  if(contextManagerState.initialized){
    return true;
  }

  if(contextManagerState.startupPromise){
    return contextManagerState.startupPromise;
  }

  contextManagerState.startupPromise =
  (async() => {

    contextManagerState.initializing = true;

    try{

      startEvictionLoop();

      contextManagerState.initialized = true;
      contextManagerState.shuttingDown = false;
      contextManagerState.lastUpdatedAt = Date.now();

      return true;

    }
    finally{

      contextManagerState.initializing = false;
      contextManagerState.startupPromise = null;

    }

  })();

  return contextManagerState.startupPromise;

}



// =====================================
// EXPORTS
// =====================================

export {
  initializeContextManager,
  shutdownContextManager,
  resetContextManager,
  evictExpiredContexts
};
