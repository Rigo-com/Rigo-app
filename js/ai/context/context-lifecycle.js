// =====================================
// RIGO AI
// CONTEXT LIFECYCLE
// =====================================

async function resetContextManager(){

  contextManagerState
  .contexts
  .clear();

  contextManagerState
  .sessions
  .clear();

  contextManagerState
  .runtimeContexts
  .clear();

  contextManagerState
  .sharedContexts
  .clear();

  contextManagerState
  .indexes
  .clear();

  contextManagerState
  .contextTokens
  .clear();

  contextManagerState
  .retrievalCache
  .clear();

  contextManagerState
  .contentHashes
  .clear();

  contextManagerState
  .startupPromise =
  null;

  contextManagerState
  .operationLock =
  false;

  return true;

}



// =====================================
// EVICTION LOOP
// =====================================

function startEvictionLoop(){

  if(
    contextManagerState
    .evictionTimer
  ){

    return true;

  }

  contextManagerState
  .evictionTimer =
  setInterval(() => {

    evictOldContexts();

  },

  CONTEXT_MANAGER_CONFIG
  .EVICTION_INTERVAL);

  return true;

}



function stopEvictionLoop(){

  if(
    !contextManagerState
    .evictionTimer
  ){

    return true;

  }

  clearInterval(
    contextManagerState
    .evictionTimer
  );

  contextManagerState
  .evictionTimer =
  null;

  return true;

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownContextManager(){

  contextManagerState
  .shuttingDown =
  true;

  stopEvictionLoop();

  await resetContextManager();

  contextManagerState
  .initialized =
  false;

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initializeContextManager(){

  if(
    contextManagerState
    .initialized
  ){

    return true;

  }

  if(
    contextManagerState
    .startupPromise
  ){

    return contextManagerState
    .startupPromise;

  }

  contextManagerState
  .startupPromise =

  (async() => {

    contextManagerState
    .initializing =
    true;

    try{

      startEvictionLoop();

      contextManagerState
      .initialized =
      true;

      contextManagerState
      .shuttingDown =
      false;

      contextManagerState
      .lastUpdatedAt =
      Date.now();


      return true;

    }

    finally{

      contextManagerState
      .initializing =
      false;

      contextManagerState
      .startupPromise =
      null;

    }

  })();

  return contextManagerState
  .startupPromise;

}
