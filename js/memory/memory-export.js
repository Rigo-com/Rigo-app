// =====================================
// RIGO AI
// MEMORY EXPORT
// FINAL OPTIMIZED BUILD
// =====================================



// =====================================
// EXPORT CONFIG
// =====================================

const MEMORY_EXPORT_CONFIG =
Object.freeze({

  EXPORT_VERSION:"1.0.0",

  EXPORT_SCHEMA:"rigo-memory-v1",

  ENABLE_COMPRESSION:true,

  ENABLE_INTEGRITY_CHECKS:true,

  MAX_EXPORT_SIZE:
  1024 * 1024 * 25,

  MAX_IMPORT_SIZE:
  1024 * 1024 * 25,

  MAX_HISTORY_ITEMS:100,

  MAX_TRANSACTION_AGE:
  1000 * 60 * 30,

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
// HELPERS
// =====================================

function normalizeExportStrategy(
  strategy
){

  const normalized =
  normalizeMemoryString(
    strategy
  );

  const allowed = [

    "merge",

    "overwrite",

    "keep-local",

    "keep-remote",

    "newest-wins"

  ];

  return allowed.includes(
    normalized
  )

  ? normalized

  : MEMORY_EXPORT_CONFIG
    .DEFAULT_IMPORT_STRATEGY;

}



function pruneExportHistory(){

  while(

    memoryExportState
    .exportHistory
    .length >

    MEMORY_EXPORT_CONFIG
    .MAX_HISTORY_ITEMS

  ){

    memoryExportState
    .exportHistory
    .shift();

  }

  while(

    memoryExportState
    .importHistory
    .length >

    MEMORY_EXPORT_CONFIG
    .MAX_HISTORY_ITEMS

  ){

    memoryExportState
    .importHistory
    .shift();

  }

}



function cleanupExportTransactions(){

  const now =
  Date.now();

  memoryExportState
  .activeTransactions
  .forEach((transaction,id) => {

    if(

      now -
      transaction.startedAt >

      MEMORY_EXPORT_CONFIG
      .MAX_TRANSACTION_AGE

    ){

      memoryExportState
      .activeTransactions
      .delete(id);

    }

  });

}



function safeParseExportPayload(
  payload
){

  try{

    if(
      typeof payload !==
      "string"
    ){

      return payload;
    }

    if(

      payload.length >

      MEMORY_EXPORT_CONFIG
      .MAX_IMPORT_SIZE

    ){

      return null;

    }

    return JSON.parse(
      payload
    );

  }

  catch(error){

    return null;

  }

}



function stableStringify(
  value
){

  const visited =
  new WeakSet();

  return JSON.stringify(

    value,

    (key,currentValue) => {

      if(

        currentValue &&

        typeof currentValue ===
        "object"

      ){

        if(
          visited.has(
            currentValue
          )
        ){

          return "[Circular]";
        }

        visited.add(
          currentValue
        );

        if(
          Array.isArray(
            currentValue
          )
        ){

          return currentValue;
        }

        return Object.keys(
          currentValue
        )
        .sort()
        .reduce((result,currentKey) => {

          result[currentKey] =
          currentValue[currentKey];

          return result;

        },{});

      }

      return currentValue;

    }

  );

}



// =====================================
// EXPORT FILTER
// =====================================

function filterExportMemories(
  memories = [],
  options = {}
){

  let filtered =

    Array.isArray(
      options.memories
    )

    ? [...options.memories]

    : [...memories];

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
    stableStringify(
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
    createMemoryId(),

    version:
    MEMORY_EXPORT_CONFIG
    .EXPORT_VERSION,

    schema:
    MEMORY_EXPORT_CONFIG
    .EXPORT_SCHEMA,

    exportedAt:
    Date.now(),

    memoryCount:
    memories.length,

    corruptedSkipped:
    memoryExportState
    .skippedCorrupted

  };

}



// =====================================
// BASE64 HELPERS
// =====================================

function uint8ArrayToBase64(
  bytes
){

  let binary = "";

  const chunkSize = 8192;

  for(

    let i = 0;

    i < bytes.length;

    i += chunkSize

  ){

    const chunk =
    bytes.subarray(
      i,
      i + chunkSize
    );

    binary +=
    String.fromCharCode(
      ...chunk
    );

  }

  return btoa(binary);

}



function base64ToUint8Array(
  base64
){

  const binary =
  atob(base64);

  const bytes =
  new Uint8Array(
    binary.length
  );

  for(

    let i = 0;

    i < binary.length;

    i++

  ){

    bytes[i] =
    binary.charCodeAt(i);

  }

  return bytes;

}



// =====================================
// COMPRESS
// =====================================

async function compressExportPayload(
  payload
){

  const serialized =
  stableStringify(
    payload
  );

  if(

    !MEMORY_EXPORT_CONFIG
    .ENABLE_COMPRESSION

  ){

    return serialized;

  }

  try{

    if(
      typeof CompressionStream !==
      "function"
    ){

      return serialized;
    }

    const stream =
    new Blob([serialized])
    .stream()
    .pipeThrough(
      new CompressionStream(
        "gzip"
      )
    );

    const response =
    new Response(stream);

    const buffer =
    await response.arrayBuffer();

    const compressed =
    uint8ArrayToBase64(
      new Uint8Array(
        buffer
      )
    );

    memoryExportState
    .compressionSavings +=
    Math.max(
      0,
      serialized.length -
      compressed.length
    );

    return JSON.stringify({

      compressed:true,

      format:"gzip",

      payload:
      compressed

    });

  }

  catch(error){

    return serialized;

  }

}



// =====================================
// DECOMPRESS
// =====================================

async function decompressExportPayload(
  payload
){

  try{

    const parsed =
    safeParseExportPayload(
      payload
    );

    if(!parsed){

      return null;
    }

    if(
      parsed.compressed !==
      true
    ){

      return parsed;
    }

    if(
      typeof DecompressionStream !==
      "function"
    ){

      return null;
    }

    const bytes =
    base64ToUint8Array(
      parsed.payload
    );

    const stream =
    new Blob([bytes])
    .stream()
    .pipeThrough(
      new DecompressionStream(
        "gzip"
      )
    );

    const response =
    new Response(stream);

    const text =
    await response.text();

    return safeParseExportPayload(
      text
    );

  }

  catch(error){

    return null;

  }

}



// =====================================
// EXPORT
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

      if(!memory){

        return false;
      }

      if(

        memoryState
        ?.tracking
        ?.corruptedIds
        ?.has?.(
          memory.id
        )

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
      )

    };

    exportPayload.checksum =
    await createExportChecksum(
      exportPayload
    );

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
    await compressExportPayload(
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

    pruneExportHistory();

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

    if(!exportPayload){

      return false;
    }

    const payload =

      typeof exportPayload ===
      "string"

      ?

      await decompressExportPayload(
        exportPayload
      )

      :

      cloneMemoryObject(
        exportPayload
      );

    if(!payload){

      return false;
    }

    if(

      payload.metadata?.schema !==

      MEMORY_EXPORT_CONFIG
      .EXPORT_SCHEMA

    ){

      return false;

    }

    const originalChecksum =
    payload.checksum;

    const verificationPayload =
    cloneMemoryObject(
      payload
    );

    delete verificationPayload
    .checksum;

    const recalculated =
    await createExportChecksum(
      verificationPayload
    );

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

  cleanupExportTransactions();

  const transaction = {

    id:createMemoryId(),

    startedAt:
    Date.now(),

    memories:
    cloneMemoryObject(
      memoryState.memories
    )

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
    transaction.memories
  );

  rebuildMemoryIndexes();

  clearSearchCache();

  updateMemoryMetrics();

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

      if(!localMemory){

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

        ...(localMemory || {}),

        ...Object.fromEntries(

          Object.entries(
            importedMemory || {}
          )
          .filter(([,value]) => {

            return value !==
            undefined;

          })

        )

      };

  }

}



// =====================================
// VALIDATION
// =====================================

function validateImportPayload(
  payload
){

  if(!payload){

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

  return (

    payload.metadata.schema ===

    MEMORY_EXPORT_CONFIG
    .EXPORT_SCHEMA

  );

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

      await decompressExportPayload(
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

    const memoryMap =
    new Map();

    memoryState.memories
    .forEach((memory) => {

      if(
        memory?.id
      ){

        memoryMap.set(
          normalizeMemoryString(
            memory.id
          ),
          memory
        );

      }

    });

    for(
      const importedMemory
      of payload.memories
    ){

      if(
        !importedMemory?.id
      ){

        continue;
      }

      const validation =
      validateMemoryObject(
        importedMemory
      );

      if(
        !validation.valid
      ){

        continue;
      }

      const normalizedId =
      normalizeMemoryString(
        importedMemory.id
      );

      const localMemory =
      memoryMap.get(
        normalizedId
      );

      const resolved =
      resolveImportMemory(

        localMemory,

        importedMemory,

        strategy

      );

      memoryMap.set(
        normalizedId,
        resolved
      );

    }

    memoryState.memories =
    deduplicateMemoryArray(

      [...memoryMap.values()]

    );

    rebuildMemoryIndexes();

    clearSearchCache();

    updateMemoryMetrics();

    memoryExportState
    .importsCompleted++;

    memoryExportState
    .importedMemories +=
    payload.memories.length;

    memoryExportState
    .lastImportAt =
    Date.now();

    memoryExportState
    .importHistory
    .push({

      transactionId:
      transaction.id,

      imported:
      payload.memories.length,

      strategy,

      importedAt:
      Date.now()

    });

    pruneExportHistory();

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

  const dirtyIds =
  new Set([

    ...memoryState
    .tracking
    .dirtyIds

  ]);

  const memories =

    memoryState.memories
    .filter((memory) => {

      return dirtyIds.has(
        memory.id
      );

    });

  return createMemoryExport({

    memories

  });

}



// =====================================
// DIAGNOSTICS
// =====================================

function getMemoryExportDiagnostics(){

  return Object.freeze({

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

  });

}



// =====================================
// PUBLIC API
// =====================================

const MemoryExport =
Object.freeze({

  create:
  createMemoryExport,

  verify:
  verifyMemoryExport,

  import:
  importMemoryData,

  incremental:
  createIncrementalExport,

  diagnostics:
  getMemoryExportDiagnostics

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.MemoryExport =
  MemoryExport;

}
