// =====================================
// RIGO AI
// MEMORY EXPORT
// ENTERPRISE INFINITY ULTRA FINAL
// =====================================



// =====================================
// EXPORT CONFIG
// =====================================

const MEMORY_EXPORT_CONFIG =
Object.freeze({

  EXPORT_VERSION:"1.0.0",

  EXPORT_SCHEMA:"rigo-memory-v1",

  ENABLE_COMPRESSION:true,

  ENABLE_ENCRYPTION:true,

  ENABLE_INTEGRITY_CHECKS:true,

  ENABLE_INCREMENTAL_EXPORTS:true,

  ENABLE_PARTIAL_EXPORTS:true,

  ENABLE_TRANSACTIONAL_IMPORTS:true,

  ENABLE_ROLLBACKS:true,

  MAX_EXPORT_SIZE:
  1024 * 1024 * 25,

  MAX_IMPORT_SIZE:
  1024 * 1024 * 25,

  MAX_BATCH_SIZE:500,

  CHECKSUM_LENGTH:64,

  DEFAULT_IMPORT_STRATEGY:
  "merge"

});



// =====================================
// EXPORT STATE
// =====================================

const memoryExportState =
Object.seal({

  initialized:false,

  exportsCreated:0,

  importsCompleted:0,

  failedExports:0,

  failedImports:0,

  rollbackCount:0,

  skippedCorrupted:0,

  exportedMemories:0,

  importedMemories:0,

  compressionSavings:0,

  lastExportAt:null,

  lastImportAt:null,

  lastRollbackAt:null,

  exportHistory:[],

  importHistory:[],

  activeTransactions:
  new Map()

});



// =====================================
// EXPORT HELPERS
// =====================================

function createExportTimestamp(){

  return Date.now();

}



function generateExportId(){

  return createMemoryId();

}



function normalizeExportStrategy(
  strategy
){

  const allowed = [

    "merge",

    "overwrite",

    "keep-local",

    "keep-remote",

    "newest-wins"

  ];

  if(
    allowed.includes(strategy)
  ){

    return strategy;

  }

  return MEMORY_EXPORT_CONFIG
  .DEFAULT_IMPORT_STRATEGY;

}



// =====================================
// EXPORT FILTER
// =====================================

function filterExportMemories(
  memories = [],
  options = {}
){

  let filtered = [

    ...memories

  ];



  // ===================================
  // TAG FILTER
  // ===================================

  if(
    Array.isArray(
      options.tags
    )
  ){

    filtered =
    filtered.filter((memory) => {

      return (
        Array.isArray(
          memory.tags
        )

        &&

        memory.tags.some((tag) => {

          return options.tags
          .includes(tag);

        })

      );

    });

  }



  // ===================================
  // CATEGORY FILTER
  // ===================================

  if(
    options.category
  ){

    filtered =
    filtered.filter((memory) => {

      return (
        memory.category ===
        options.category
      );

    });

  }



  // ===================================
  // DATE RANGE
  // ===================================

  if(
    options.after
  ){

    filtered =
    filtered.filter((memory) => {

      return (
        Number(
          memory.updatedAt
        ) >=
        Number(
          options.after
        )
      );

    });

  }

  return filtered;

}



// =====================================
// CHECKSUM
// =====================================

async function createExportChecksum(
  payload
){

  return createMemoryHash(
    JSON.stringify(
      payload
    )
  );

}



// =====================================
// EXPORT METADATA
// =====================================

function createExportMetadata(
  memories = []
){

  return {

    exportId:
    generateExportId(),

    version:
    MEMORY_EXPORT_CONFIG
    .EXPORT_VERSION,

    schema:
    MEMORY_EXPORT_CONFIG
    .EXPORT_SCHEMA,

    exportedAt:
    createExportTimestamp(),

    memoryCount:
    memories.length,

    corruptedSkipped:
    memoryExportState
    .skippedCorrupted,

    device:"RIGO",

    platform:
    typeof navigator !==
    "undefined"

    ? navigator.userAgent

    : "unknown"

  };

}



// =====================================
// COMPRESS EXPORT
// =====================================

function compressExportPayload(
  payload
){

  if(

    !MEMORY_EXPORT_CONFIG
    .ENABLE_COMPRESSION

  ){

    return payload;

  }

  const serialized =
  JSON.stringify(
    payload
  );

  const compressed =
  serialized
  .replace(/\s+/g," ");

  memoryExportState
  .compressionSavings +=

    Math.max(
      0,
      serialized.length -
      compressed.length
    );

  return compressed;

}



// =====================================
// DECOMPRESS EXPORT
// =====================================

function decompressExportPayload(
  payload
){

  if(
    typeof payload !==
    "string"
  ){

    return payload;

  }

  return safeJsonParse(
    payload,
    null
  );

}



// =====================================
// EXPORT PAYLOAD
// =====================================

async function createMemoryExport(
  options = {}
){

  try{

    const filteredMemories =
    filterExportMemories(

      memoryState.memories,

      options

    );

    const cleanMemories =
    filteredMemories.filter((memory) => {

      if(

        memoryState.tracking
        .corruptedIds
        .has(memory.id)

      ){

        memoryExportState
        .skippedCorrupted++;

        return false;

      }

      return true;

    });

    const metadata =
    createExportMetadata(
      cleanMemories
    );

    const exportPayload = {

      metadata,

      memories:
      cloneMemoryObject(
        cleanMemories
      ),

      diagnostics:
      getMemoryDiagnostics(),

      embeddings:
      {

        enabled:
        MEMORY_EMBEDDINGS_CONFIG
        .ENABLE_EMBEDDINGS

      }

    };



    // ===================================
    // CHECKSUM
    // ===================================

    exportPayload.checksum =
    await createExportChecksum(
      exportPayload
    );



    // ===================================
    // SIZE VALIDATION
    // ===================================

    const exportSize =
    calculateMemorySize(
      exportPayload
    );

    if(

      exportSize >

      MEMORY_EXPORT_CONFIG
      .MAX_EXPORT_SIZE

    ){

      throw new Error(
        "EXPORT_TOO_LARGE"
      );

    }

    const compressed =
    compressExportPayload(
      exportPayload
    );

    memoryExportState
    .exportsCreated++;

    memoryExportState
    .exportedMemories +=
    cleanMemories.length;

    memoryExportState
    .lastExportAt =
    Date.now();

    memoryExportState
    .exportHistory
    .push({

      exportId:
      metadata.exportId,

      createdAt:
      metadata.exportedAt,

      memoryCount:
      cleanMemories.length

    });

    return compressed;

  }

  catch(error){

    memoryExportState
    .failedExports++;

    return null;

  }

}



// =====================================
// VERIFY EXPORT
// =====================================

async function verifyMemoryExport(
  exportPayload
){

  try{

    if(
      !exportPayload
    ){

      return false;

    }

    const payload =

      typeof exportPayload ===
      "string"

      ?

      decompressExportPayload(
        exportPayload
      )

      :

      exportPayload;

    if(
      !payload
    ){

      return false;

    }

    const originalChecksum =
    payload.checksum;

    delete payload.checksum;

    const recalculated =
    await createExportChecksum(
      payload
    );

    payload.checksum =
    originalChecksum;

    return (
      recalculated ===
      originalChecksum
    );

  }

  catch(error){

    return false;

  }

}



// =====================================
// TRANSACTION
// =====================================

function createImportTransaction(){

  const transaction = {

    id:createMemoryId(),

    startedAt:
    Date.now(),

    backup:
    cloneMemoryObject(
      memoryState.memories
    ),

    completed:false

  };

  memoryExportState
  .activeTransactions
  .set(
    transaction.id,
    transaction
  );

  return transaction;

}



// =====================================
// ROLLBACK
// =====================================

function rollbackImportTransaction(
  transaction
){

  if(!transaction){

    return false;

  }

  memoryState.memories =
  cloneMemoryObject(
    transaction.backup
  );

  rebuildMemoryIndexes();

  memoryExportState
  .rollbackCount++;

  memoryExportState
  .lastRollbackAt =
  Date.now();

  return true;

}



// =====================================
// IMPORT STRATEGY
// =====================================

function resolveImportMemory(
  localMemory,
  importedMemory,
  strategy
){

  switch(strategy){

    case "overwrite":

      return importedMemory;

    case "keep-local":

      return (
        localMemory ||
        importedMemory
      );

    case "keep-remote":

      return importedMemory;

    case "newest-wins":

      if(
        !localMemory
      ){

        return importedMemory;

      }

      return (

        Number(
          importedMemory.updatedAt
        )

        >

        Number(
          localMemory.updatedAt
        )

      )

      ? importedMemory

      : localMemory;

    case "merge":

    default:

      return {

        ...localMemory,

        ...importedMemory

      };

  }

}



// =====================================
// IMPORT VALIDATION
// =====================================

function validateImportPayload(
  payload
){

  if(
    !payload
  ){

    return false;

  }

  if(
    !Array.isArray(
      payload.memories
    )
  ){

    return false;

  }

  if(
    !payload.metadata
  ){

    return false;

  }

  return true;

}



// =====================================
// IMPORT
// =====================================

async function importMemoryData(
  importPayload,
  options = {}
){

  const transaction =
  createImportTransaction();

  try{

    const payload =

      typeof importPayload ===
      "string"

      ?

      decompressExportPayload(
        importPayload
      )

      :

      importPayload;

    if(
      !validateImportPayload(
        payload
      )
    ){

      throw new Error(
        "INVALID_IMPORT"
      );

    }

    const verified =
    await verifyMemoryExport(
      payload
    );

    if(!verified){

      throw new Error(
        "INVALID_CHECKSUM"
      );

    }

    const strategy =
    normalizeExportStrategy(
      options.strategy
    );

    const imported = [];

    for(
      const importedMemory
      of payload.memories
    ){

      const validation =
      validateMemoryObject(
        importedMemory
      );

      if(
        !validation.valid
      ){

        continue;
      }

      const localMemory =
      getMemoryById(
        importedMemory.id
      );

      const resolved =
      resolveImportMemory(

        localMemory,

        importedMemory,

        strategy

      );

      imported.push(
        resolved
      );

    }

    memoryState.memories =
    deduplicateMemoryArray([

      ...memoryState.memories,

      ...imported

    ]);



    // ===================================
    // REBUILD SYSTEMS
    // ===================================

    rebuildMemoryIndexes();

    rebuildMemoryEmbeddings();

    rebuildDirtySummaries();

    updateMemoryMetrics();

    transaction.completed =
    true;

    memoryExportState
    .importsCompleted++;

    memoryExportState
    .importedMemories +=
    imported.length;

    memoryExportState
    .lastImportAt =
    Date.now();

    memoryExportState
    .importHistory
    .push({

      transactionId:
      transaction.id,

      imported:
      imported.length,

      strategy,

      importedAt:
      Date.now()

    });

    return true;

  }

  catch(error){

    rollbackImportTransaction(
      transaction
    );

    memoryExportState
    .failedImports++;

    return false;

  }

  finally{

    memoryExportState
    .activeTransactions
    .delete(
      transaction.id
    );

  }

}



// =====================================
// INCREMENTAL EXPORT
// =====================================

async function createIncrementalExport(){

  const dirtyIds = [

    ...memoryState
    .tracking
    .dirtyIds

  ];

  const memories =

    memoryState.memories
    .filter((memory) => {

      return dirtyIds.includes(
        memory.id
      );

    });

  return createMemoryExport({

    memories

  });

}



// =====================================
// EXPORT DIAGNOSTICS
// =====================================

function getMemoryExportDiagnostics(){

  return {

    initialized:
    memoryExportState
    .initialized,

    exportsCreated:
    memoryExportState
    .exportsCreated,

    importsCompleted:
    memoryExportState
    .importsCompleted,

    failedExports:
    memoryExportState
    .failedExports,

    failedImports:
    memoryExportState
    .failedImports,

    rollbackCount:
    memoryExportState
    .rollbackCount,

    skippedCorrupted:
    memoryExportState
    .skippedCorrupted,

    exportedMemories:
    memoryExportState
    .exportedMemories,

    importedMemories:
    memoryExportState
    .importedMemories,

    compressionSavings:
    memoryExportState
    .compressionSavings,

    activeTransactions:

      memoryExportState
      .activeTransactions
      .size,

    exportHistory:

      memoryExportState
      .exportHistory
      .length,

    importHistory:

      memoryExportState
      .importHistory
      .length,

    lastExportAt:
    memoryExportState
    .lastExportAt,

    lastImportAt:
    memoryExportState
    .lastImportAt,

    lastRollbackAt:
    memoryExportState
    .lastRollbackAt

  };

}
