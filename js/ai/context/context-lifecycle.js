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

  contextManagerState.startupPromise = null;
  contextManagerState.operationLock = false;

  return true;

}



// =====================================
// EVICTION
// =====================================

async function evictOldContexts(){

  if(!CONTEXT_MANAGER_CONFIG.ENABLE_AUTO_EVICTION){
    return true;
  }

  const cutoff =
  Date.now() - CONTEXT_MANAGER_CONFIG.MAX_CONTEXT_AGE;

  const expiredIds = [];

  for(const [contextId,context] of contextManagerState.contexts){

    const timestamp =
    Number(context?.updatedAt || context?.createdAt || 0);

    if(timestamp > 0 && timestamp < cutoff){
      expiredIds.push(contextId);
    }

  }

  for(const contextId of expiredIds){
    await removeContext(contextId);
  }

  return true;

}



function startEvictionLoop(){

  if(contextManagerState.evictionTimer){
    return true;
  }

  contextManagerState.evictionTimer =
  setInterval(() => {
    evictOldContexts().catch(() => {});
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
  resetContextManager
};
