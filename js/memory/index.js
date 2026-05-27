// =====================================
// RIGO AI
// MEMORY INDEX
// CENTRAL EXPORTS + VALIDATION
// =====================================



// =====================================
// VALIDATION
// =====================================

function validateMemoryLayer(){

  return (

    typeof MemoryCore !==
    "undefined"

    &&

    typeof MemoryManager !==
    "undefined"

    &&

    typeof MemoryState !==
    "undefined"

    &&

    typeof MemoryStorage !==
    "undefined"

    &&

    typeof MemorySearch !==
    "undefined"

    &&

    typeof MemoryIndexing !==
    "undefined"

    &&

    typeof MemoryValidation !==
    "undefined"

    &&

    typeof MemorySecurity !==
    "undefined"

    &&

    typeof MemoryEvents !==
    "undefined"

    &&

    typeof MemorySummary !==
    "undefined"

    &&

    typeof MemoryCleanup !==
    "undefined"

    &&

    typeof MemoryEmbeddings !==
    "undefined"

    &&

    typeof MemorySyncCloud !==
    "undefined"

    &&

    typeof MemoryTypes !==
    "undefined"

    &&

    typeof MemoryUtils !==
    "undefined"

    &&

    typeof MemoryContext !==
    "undefined"

    &&

    typeof MemoryDebug !==
    "undefined"

    &&

    typeof MemoryExport !==
    "undefined"

    &&

    typeof MemoryRanking !==
    "undefined"

    &&

    typeof MemorySubsystem !==
    "undefined"

    &&

    typeof MemoryConstants !==
    "undefined"

  );

}



// =====================================
// PUBLIC API
// =====================================

const Memory =
Object.freeze({

  core:
  MemoryCore,

  manager:
  MemoryManager,

  state:
  MemoryState,

  storage:
  MemoryStorage,

  search:
  MemorySearch,

  indexing:
  MemoryIndexing,

  validation:
  MemoryValidation,

  security:
  MemorySecurity,

  events:
  MemoryEvents,

  summary:
  MemorySummary,

  cleanup:
  MemoryCleanup,

  embeddings:
  MemoryEmbeddings,

  syncCloud:
  MemorySyncCloud,

  types:
  MemoryTypes,

  utils:
  MemoryUtils,

  context:
  MemoryContext,

  debug:
  MemoryDebug,

  export:
  MemoryExport,

  ranking:
  MemoryRanking,

  subsystem:
  MemorySubsystem,

  constants:
  MemoryConstants

});



// =====================================
// SAFE ACCESS
// =====================================

function getMemoryLayer(){

  if(
    !validateMemoryLayer()
  ){

    return null;

  }

  return Memory;

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.Memory =
  Memory;

  window.getMemoryLayer =
  getMemoryLayer;

  window.validateMemoryLayer =
  validateMemoryLayer;

}



if(
  typeof globalThis !==
  "undefined"
){

  globalThis.Memory =
  Memory;

}
