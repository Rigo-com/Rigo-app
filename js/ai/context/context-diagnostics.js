// =====================================
// IMPORTS
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
  freezeContextObject,
  safeClone
}
from "./context-utils.js";



// =====================================
// RIGO AI
// CONTEXT DIAGNOSTICS
// =====================================

function getContextDiagnostics(){

  return freezeContextObject({

    initialized:
    contextManagerState
    .initialized,

    contexts:

      contextManagerState
      .contexts
      .size,

    sessions:
      contextManagerState.sessions.size,

    runtimeContexts:
      contextManagerState.runtimeContexts.size,

    sharedContexts:
      contextManagerState.sharedContexts.size,

    indexes:

      contextManagerState
      .indexes
      .size,

    cache:

      contextManagerState
      .retrievalCache
      .size,

    diagnostics:

      safeClone(

        contextManagerState
        .diagnostics

      ),

    lastUpdatedAt:
    contextManagerState
    .lastUpdatedAt

  });

}



function createContextSnapshot(){

  return freezeContextObject({

    initialized:
    contextManagerState
    .initialized,

    contexts:

      contextManagerState
      .contexts
      .size,

    sessions:
      contextManagerState.sessions.size,

    runtimeContexts:
      contextManagerState.runtimeContexts.size,

    sharedContexts:
      contextManagerState.sharedContexts.size,

    indexes:

      contextManagerState
      .indexes
      .size,

    cache:

      contextManagerState
      .retrievalCache
      .size,

    timestamp:
    Date.now()

  });

}



function getContextHealthReport(){

  return freezeContextObject({

    initialized:
    contextManagerState
    .initialized,

    healthy:
      contextManagerState.initialized &&
      !contextManagerState.initializing &&
      !contextManagerState.shuttingDown &&
      contextManagerState
      .contexts
      .size <=

      CONTEXT_MANAGER_CONFIG
      .MAX_CONTEXTS &&
      contextManagerState.sessions.size <=
      CONTEXT_MANAGER_CONFIG.MAX_SESSION_CONTEXTS &&
      contextManagerState.runtimeContexts.size <=
      CONTEXT_MANAGER_CONFIG.MAX_RUNTIME_CONTEXTS &&
      contextManagerState.indexes.size <=
      CONTEXT_MANAGER_CONFIG.MAX_INDEX_SIZE &&
      contextManagerState.retrievalCache.size <=
      CONTEXT_MANAGER_CONFIG.MAX_CACHE_ITEMS,

    initializing:
    contextManagerState.initializing,

    shuttingDown:
    contextManagerState.shuttingDown,

    operationActive:
    Boolean(contextManagerState.activeOperation),

    contexts:

      contextManagerState
      .contexts
      .size,

    sessions:
      contextManagerState.sessions.size,

    runtimeContexts:
      contextManagerState.runtimeContexts.size,

    sharedContexts:
      contextManagerState.sharedContexts.size,

    cache:

      contextManagerState
      .retrievalCache
      .size,

    indexes:

      contextManagerState
      .indexes
      .size,

    diagnostics:
    getContextDiagnostics(),

    timestamp:
    Date.now()

  });

}



export {

  getContextDiagnostics,

  createContextSnapshot,

  getContextHealthReport

};
