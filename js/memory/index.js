// =====================================
// RIGO AI
// MEMORY INDEX
// ENTERPRISE INFINITY ULTRA FINAL
// =====================================



// =====================================
// INDEX CONFIG
// =====================================

const MEMORY_INDEX_CONFIG =
Object.freeze({

  ENABLE_AUTO_INDEXING:true,

  ENABLE_TOKEN_INDEX:true,

  ENABLE_RELATION_INDEX:true,

  ENABLE_HASH_INDEX:true,

  ENABLE_CATEGORY_INDEX:true,

  ENABLE_PRIORITY_INDEX:true,

  ENABLE_STATE_INDEX:true,

  ENABLE_TAG_INDEX:true,

  ENABLE_DATE_INDEX:true,

  ENABLE_CACHE_INDEX:true,

  MAX_INDEX_KEY_LENGTH:120,

  MAX_INDEX_VALUES:50000,

  MAX_REBUILD_BATCH:500,

  CLEANUP_UNUSED_KEYS:true

});



// =====================================
// INDEX STATE
// =====================================

const memoryIndexState =
Object.seal({

  initialized:false,

  indexing:false,

  rebuilding:false,

  cleaning:false,

  lastIndexedAt:null,

  lastRebuildAt:null,

  lastCleanupAt:null,

  indexedMemories:0,

  failedIndexes:0,

  rebuiltIndexes:0,

  cleanedIndexes:0,

  indexOperations:0

});



// =====================================
// SAFE INDEX KEY
// =====================================

function normalizeIndexKey(
  value
){

  return normalizeMemoryTextLower(
    value
  )
  .slice(

    0,

    MEMORY_INDEX_CONFIG
    .MAX_INDEX_KEY_LENGTH

  );

}



// =====================================
// ENSURE INDEX MAP
// =====================================

function ensureIndexMap(
  indexMap,
  key
){

  if(

    !(indexMap instanceof Map)

    ||

    !key

  ){

    return null;

  }

  const normalizedKey =
  normalizeIndexKey(
    key
  );

  if(!normalizedKey){

    return null;

  }

  if(
    !indexMap.has(
      normalizedKey
    )
  ){

    indexMap.set(
      normalizedKey,
      new Set()
    );

  }

  return indexMap.get(
    normalizedKey
  );

}



// =====================================
// ADD TO INDEX
// =====================================

function addMemoryToIndex(
  indexMap,
  key,
  memoryId
){

  try{

    if(
      !memoryId
    ){

      return false;

    }

    const bucket =
    ensureIndexMap(
      indexMap,
      key
    );

    if(!bucket){

      return false;

    }

    if(

      bucket.size >=

      MEMORY_INDEX_CONFIG
      .MAX_INDEX_VALUES

    ){

      return false;

    }

    bucket.add(
      memoryId
    );

    memoryIndexState
    .indexOperations++;

    return true;

  }

  catch(error){

    memoryIndexState
    .failedIndexes++;

    return false;

  }

}



// =====================================
// REMOVE FROM INDEX
// =====================================

function removeMemoryFromIndex(
  indexMap,
  key,
  memoryId
){

  try{

    if(

      !(indexMap instanceof Map)

      ||

      !key

      ||

      !memoryId

    ){

      return false;

    }

    const normalizedKey =
    normalizeIndexKey(
      key
    );

    const bucket =
    indexMap.get(
      normalizedKey
    );

    if(!bucket){

      return false;

    }

    bucket.delete(
      memoryId
    );

    if(

      MEMORY_INDEX_CONFIG
      .CLEANUP_UNUSED_KEYS

      &&

      bucket.size <= 0

    ){

      indexMap.delete(
        normalizedKey
      );

    }

    memoryIndexState
    .indexOperations++;

    return true;

  }

  catch(error){

    memoryIndexState
    .failedIndexes++;

    return false;

  }

}



// =====================================
// INDEX LOOKUP
// =====================================

function getIndexedMemories(
  indexMap,
  key
){

  try{

    if(

      !(indexMap instanceof Map)

      ||

      !key

    ){

      return [];

    }

    const normalizedKey =
    normalizeIndexKey(
      key
    );

    const bucket =
    indexMap.get(
      normalizedKey
    );

    if(!bucket){

      return [];

    }

    return [...bucket];

  }

  catch(error){

    return [];

  }

}



// =====================================
// TOKEN INDEXING
// =====================================

function indexMemoryTokens(
  memory
){

  if(

    !MEMORY_INDEX_CONFIG
    .ENABLE_TOKEN_INDEX

  ){

    return false;

  }

  const tokens =
  tokenizeMemoryText([

    memory.title,

    memory.summary,

    memory.content,

    ...(memory.tags || [])

  ]
  .filter(Boolean)
  .join(" "));

  tokens.forEach((token) => {

    addMemoryToIndex(

      memoryState.indexes
      .byToken,

      token,

      memory.id

    );

  });

  return true;

}



// =====================================
// TAG INDEXING
// =====================================

function indexMemoryTags(
  memory
){

  if(

    !MEMORY_INDEX_CONFIG
    .ENABLE_TAG_INDEX

  ){

    return false;

  }

  const tags =
  Array.isArray(
    memory.tags
  )

  ? memory.tags

  : [];

  tags.forEach((tag) => {

    addMemoryToIndex(

      memoryState.indexes
      .byTag,

      tag,

      memory.id

    );

  });

  return true;

}



// =====================================
// RELATION INDEXING
// =====================================

function indexMemoryRelations(
  memory
){

  if(

    !MEMORY_INDEX_CONFIG
    .ENABLE_RELATION_INDEX

  ){

    return false;

  }

  const relations =
  memory.relations || {};

  if(
    relations.parentMemoryId
  ){

    addMemoryToIndex(

      memoryState.indexes
      .byParent,

      relations.parentMemoryId,

      memory.id

    );

  }

  const childIds =
  Array.isArray(
    relations.childMemoryIds
  )

  ? relations.childMemoryIds

  : [];

  childIds.forEach((childId) => {

    addMemoryToIndex(

      memoryState.indexes
      .byChild,

      childId,

      memory.id

    );

  });

  const relatedIds =
  Array.isArray(
    relations.relatedMemoryIds
  )

  ? relations.relatedMemoryIds

  : [];

  relatedIds.forEach((relatedId) => {

    addMemoryToIndex(

      memoryState.indexes
      .byRelation,

      relatedId,

      memory.id

    );

  });

  return true;

}



// =====================================
// HASH INDEXING
// =====================================

async function indexMemoryHash(
  memory
){

  if(

    !MEMORY_INDEX_CONFIG
    .ENABLE_HASH_INDEX

  ){

    return false;

  }

  const contentHash =
  await createMemoryHash(
    memory.content || ""
  );

  if(!contentHash){

    return false;

  }

  addMemoryToIndex(

    memoryState.indexes
    .byContentHash,

    contentHash,

    memory.id

  );

  return true;

}



// =====================================
// DATE INDEXING
// =====================================

function indexMemoryDates(
  memory
){

  if(

    !MEMORY_INDEX_CONFIG
    .ENABLE_DATE_INDEX

  ){

    return false;

  }

  if(
    memory.createdAt
  ){

    addMemoryToIndex(

      memoryState.indexes
      .byCreatedAt,

      String(
        memory.createdAt
      ),

      memory.id

    );

  }

  if(
    memory.updatedAt
  ){

    addMemoryToIndex(

      memoryState.indexes
      .byUpdatedAt,

      String(
        memory.updatedAt
      ),

      memory.id

    );

  }

  return true;

}



// =====================================
// CORE INDEXING
// =====================================

async function indexMemory(
  memory
){

  try{

    if(
      !isValidMemoryObject(
        memory
      )
    ){

      return false;

    }

    addMemoryToIndex(

      memoryState.indexes
      .byId,

      memory.id,

      memory.id

    );

    addMemoryToIndex(

      memoryState.indexes
      .byType,

      memory.type,

      memory.id

    );

    addMemoryToIndex(

      memoryState.indexes
      .byCategory,

      memory.category,

      memory.id

    );

    addMemoryToIndex(

      memoryState.indexes
      .byPriority,

      memory.priority,

      memory.id

    );

    addMemoryToIndex(

      memoryState.indexes
      .byState,

      memory.state,

      memory.id

    );

    await indexMemoryHash(
      memory
    );

    indexMemoryTokens(
      memory
    );

    indexMemoryTags(
      memory
    );

    indexMemoryRelations(
      memory
    );

    indexMemoryDates(
      memory
    );

    memoryState.indexes
    .byId
    .set(
      memory.id,
      memory
    );

    memoryIndexState
    .indexedMemories++;

    memoryIndexState
    .lastIndexedAt =
    Date.now();

    return true;

  }

  catch(error){

    memoryIndexState
    .failedIndexes++;

    return false;

  }

}



// =====================================
// REMOVE MEMORY INDEXES
// =====================================

async function unindexMemory(
  memory
){

  try{

    if(
      !memory
    ){

      return false;

    }

    memoryState.indexes
    .byId
    .delete(
      memory.id
    );

    removeMemoryFromIndex(

      memoryState.indexes
      .byType,

      memory.type,

      memory.id

    );

    removeMemoryFromIndex(

      memoryState.indexes
      .byCategory,

      memory.category,

      memory.id

    );

    removeMemoryFromIndex(

      memoryState.indexes
      .byPriority,

      memory.priority,

      memory.id

    );

    removeMemoryFromIndex(

      memoryState.indexes
      .byState,

      memory.state,

      memory.id

    );

    if(
      Array.isArray(
        memory.tags
      )
    ){

      memory.tags.forEach((tag) => {

        removeMemoryFromIndex(

          memoryState.indexes
          .byTag,

          tag,

          memory.id

        );

      });

    }

    const tokens =
    tokenizeMemoryText([

      memory.title,

      memory.summary,

      memory.content

    ]
    .filter(Boolean)
    .join(" "));

    tokens.forEach((token) => {

      removeMemoryFromIndex(

        memoryState.indexes
        .byToken,

        token,

        memory.id

      );

    });

    const hash =
    await createMemoryHash(
      memory.content || ""
    );

    if(hash){

      removeMemoryFromIndex(

        memoryState.indexes
        .byContentHash,

        hash,

        memory.id

      );

    }

    return true;

  }

  catch(error){

    memoryIndexState
    .failedIndexes++;

    return false;

  }

}



// =====================================
// REBUILD INDEXES
// =====================================

async function rebuildMemoryIndexes(){

  if(
    memoryIndexState
    .rebuilding
  ){

    return false;

  }

  memoryIndexState
  .rebuilding = true;

  try{

    resetRuntimeMemoryIndexes();

    const memories =
    safeMemoryArray(
      memoryState.memories
    );

    const batches =
    chunkMemoryArray(

      memories,

      MEMORY_INDEX_CONFIG
      .MAX_REBUILD_BATCH

    );

    for(
      const batch
      of batches
    ){

      await Promise.all(

        batch.map((memory) => {

          return indexMemory(
            memory
          );

        })

      );

    }

    memoryIndexState
    .rebuiltIndexes++;

    memoryIndexState
    .lastRebuildAt =
    Date.now();

    return true;

  }

  catch(error){

    memoryIndexState
    .failedIndexes++;

    return false;

  }

  finally{

    memoryIndexState
    .rebuilding = false;

  }

}



// =====================================
// SEARCH HELPERS
// =====================================

function searchIndexedMemories(
  query
){

  const tokens =
  tokenizeMemoryText(
    query
  );

  const matchedIds =
  new Set();

  tokens.forEach((token) => {

    getIndexedMemories(

      memoryState.indexes
      .byToken,

      token

    )
    .forEach((memoryId) => {

      matchedIds.add(
        memoryId
      );

    });

  });

  return [

    ...matchedIds

  ]
  .map((memoryId) => {

    return getMemoryById(
      memoryId
    );

  })
  .filter(Boolean);

}



// =====================================
// TAG SEARCH
// =====================================

function searchMemoriesByTag(
  tag
){

  return getIndexedMemories(

    memoryState.indexes
    .byTag,

    tag

  )
  .map((memoryId) => {

    return getMemoryById(
      memoryId
    );

  })
  .filter(Boolean);

}



// =====================================
// CATEGORY SEARCH
// =====================================

function searchMemoriesByCategory(
  category
){

  return getIndexedMemories(

    memoryState.indexes
    .byCategory,

    category

  )
  .map((memoryId) => {

    return getMemoryById(
      memoryId
    );

  })
  .filter(Boolean);

}



// =====================================
// TYPE SEARCH
// =====================================

function searchMemoriesByType(
  type
){

  return getIndexedMemories(

    memoryState.indexes
    .byType,

    type

  )
  .map((memoryId) => {

    return getMemoryById(
      memoryId
    );

  })
  .filter(Boolean);

}



// =====================================
// CLEANUP
// =====================================

function cleanupMemoryIndexes(){

  if(
    memoryIndexState
    .cleaning
  ){

    return false;

  }

  memoryIndexState
  .cleaning = true;

  try{

    const validIds =
    new Set(

      memoryState.memories
      .map((memory) => {

        return memory.id;

      })

    );

    Object.values(
      memoryState.indexes
    )
    .forEach((indexMap) => {

      if(
        !(indexMap instanceof Map)
      ){

        return;
      }

      indexMap.forEach((value,key) => {

        if(
          value instanceof Set
        ){

          [...value]
          .forEach((memoryId) => {

            if(
              !validIds.has(
                memoryId
              )
            ){

              value.delete(
                memoryId
              );

            }

          });

          if(
            value.size <= 0
          ){

            indexMap.delete(
              key
            );

          }

        }

      });

    });

    memoryIndexState
    .cleanedIndexes++;

    memoryIndexState
    .lastCleanupAt =
    Date.now();

    return true;

  }

  catch(error){

    memoryIndexState
    .failedIndexes++;

    return false;

  }

  finally{

    memoryIndexState
    .cleaning = false;

  }

}



// =====================================
// INITIALIZE
// =====================================

async function initializeMemoryIndexes(){

  if(
    memoryIndexState
    .initialized
  ){

    return true;

  }

  const rebuilt =
  await rebuildMemoryIndexes();

  if(!rebuilt){

    return false;

  }

  memoryIndexState
  .initialized = true;

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getMemoryIndexDiagnostics(){

  return deepFreeze({

    initialized:
    memoryIndexState
    .initialized,

    indexing:
    memoryIndexState
    .indexing,

    rebuilding:
    memoryIndexState
    .rebuilding,

    cleaning:
    memoryIndexState
    .cleaning,

    indexedMemories:
    memoryIndexState
    .indexedMemories,

    failedIndexes:
    memoryIndexState
    .failedIndexes,

    rebuiltIndexes:
    memoryIndexState
    .rebuiltIndexes,

    cleanedIndexes:
    memoryIndexState
    .cleanedIndexes,

    indexOperations:
    memoryIndexState
    .indexOperations,

    lastIndexedAt:
    memoryIndexState
    .lastIndexedAt,

    lastRebuildAt:
    memoryIndexState
    .lastRebuildAt,

    lastCleanupAt:
    memoryIndexState
    .lastCleanupAt,

    indexes:{

      byId:
      memoryState.indexes
      .byId
      .size,

      byType:
      memoryState.indexes
      .byType
      .size,

      byCategory:
      memoryState.indexes
      .byCategory
      .size,

      byPriority:
      memoryState.indexes
      .byPriority
      .size,

      byTag:
      memoryState.indexes
      .byTag
      .size,

      byState:
      memoryState.indexes
      .byState
      .size,

      byToken:
      memoryState.indexes
      .byToken
      .size,

      byRelation:
      memoryState.indexes
      .byRelation
      .size

    }

  });

}
