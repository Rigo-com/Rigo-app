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

      contextManagerState
      .contexts
      .size <=

      CONTEXT_MANAGER_CONFIG
      .MAX_CONTEXTS,

    contexts:

      contextManagerState
      .contexts
      .size,

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
