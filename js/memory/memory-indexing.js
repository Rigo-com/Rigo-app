// =====================================
// RIGO AI
// MEMORY INDEXING
// CLEAN FINAL ARCHITECTURE
// =====================================



// =====================================
// INDEX CONFIG
// =====================================

const MEMORY_INDEX_CONFIG =
Object.freeze({

  ENABLE_TOKEN_INDEXING:true,

  ENABLE_RELATION_INDEXING:true,

  ENABLE_CATEGORY_INDEXING:true,

  ENABLE_PRIORITY_INDEXING:true,

  ENABLE_STATE_INDEXING:true,

  ENABLE_TYPE_INDEXING:true,

  ENABLE_EMBEDDING_INDEXING:true,

  MAX_INDEXED_TOKENS:5000

});



// =====================================
// INTERNAL HELPERS
// =====================================

function normalizeIndexKey(
  value
){

  return normalizeMemoryString?.(
    value
  );

}



function ensureIndexBucket(
  index,
  key
){

  if(
    !(index instanceof Map)
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
    !index.has(
      normalizedKey
    )
  ){

    index.set(
      normalizedKey,
      new Set()
    );

  }

  return index.get(
    normalizedKey
  );

}



function addIndexValue(
  index,
  key,
  memoryId
){

  const normalizedMemoryId =
  normalizeIndexKey(
    memoryId
  );

  if(!normalizedMemoryId){

    return false;
  }

  const bucket =
  ensureIndexBucket(
    index,
    key
  );

  if(!bucket){

    return false;
  }

  bucket.add(
    normalizedMemoryId
  );

  return true;

}



function removeIndexValue(
  index,
  key,
  memoryId
){

  if(
    !(index instanceof Map)
  ){

    return false;
  }

  const normalizedKey =
  normalizeIndexKey(
    key
  );

  const normalizedMemoryId =
  normalizeIndexKey(
    memoryId
  );

  if(

    !normalizedKey ||

    !normalizedMemoryId

  ){

    return false;
  }

  const bucket =
  index.get(
    normalizedKey
  );

  if(
    !(bucket instanceof Set)
  ){

    return false;
  }

  bucket.delete(
    normalizedMemoryId
  );

  if(
    bucket.size <= 0
  ){

    index.delete(
      normalizedKey
    );

  }

  return true;

}



// =====================================
// TOKEN EXTRACTION
// =====================================

function extractMemoryTokens(
  memory
){

  if(!memory){

    return [];
  }

  const tokenSource = [

    memory.title,

    memory.summary,

    memory.content,

    ...(Array.isArray(memory.tags)
      ? memory.tags
      : [])

  ];

  const tokenSet =
  new Set();

  tokenSource.forEach((value) => {

    const tokens =
    tokenizeMemoryText?.(
      value
    ) || [];

    tokens.forEach((token) => {

      tokenSet.add(token);

    });

  });

  return [

    ...tokenSet

  ]
  .slice(
    0,
    MEMORY_INDEX_CONFIG
    .MAX_INDEXED_TOKENS
  );

}



// =====================================
// INDEX PROCESSOR
// =====================================

function processMemoryIndexes(
  memory,
  operation = "add"
){

  if(
    !memory ||
    !memory.id
  ){

    return false;
  }

  const indexes =
  memoryState?.indexes;

  if(!indexes){

    return false;
  }

  const memoryId =
  normalizeIndexKey(
    memory.id
  );

  if(!memoryId){

    return false;
  }

  const executor =

    operation === "remove"
    ? removeIndexValue
    : addIndexValue;



  // ===================================
  // TYPE
  // ===================================

  if(
    MEMORY_INDEX_CONFIG
    .ENABLE_TYPE_INDEXING
  ){

    executor(
      indexes.byType,
      memory.type,
      memoryId
    );

  }



  // ===================================
  // CATEGORY
  // ===================================

  if(
    MEMORY_INDEX_CONFIG
    .ENABLE_CATEGORY_INDEXING
  ){

    executor(
      indexes.byCategory,
      memory.category,
      memoryId
    );

  }



  // ===================================
  // PRIORITY
  // ===================================

  if(
    MEMORY_INDEX_CONFIG
    .ENABLE_PRIORITY_INDEXING
  ){

    executor(
      indexes.byPriority,
      memory.priority,
      memoryId
    );

  }



  // ===================================
  // STATE
  // ===================================

  if(
    MEMORY_INDEX_CONFIG
    .ENABLE_STATE_INDEXING
  ){

    executor(
      indexes.byState,
      memory.state,
      memoryId
    );

  }



  // ===================================
  // TAGS
  // ===================================

  if(
    Array.isArray(
      memory.tags
    )
  ){

    memory.tags.forEach((tag) => {

      executor(
        indexes.byTag,
        tag,
        memoryId
      );

    });

  }



  // ===================================
  // TOKENS
  // ===================================

  if(
    MEMORY_INDEX_CONFIG
    .ENABLE_TOKEN_INDEXING
  ){

    const tokens =
    extractMemoryTokens(
      memory
    );

    tokens.forEach((token) => {

      executor(
        indexes.byToken,
        token,
        memoryId
      );

    });

  }



  // ===================================
  // RELATIONS
  // ===================================

  if(

    MEMORY_INDEX_CONFIG
    .ENABLE_RELATION_INDEXING

    &&

    memory.relations

  ){

    const relations =
    memory.relations;

    if(
      relations.parentMemoryId
    ){

      executor(
        indexes.byParent,
        relations.parentMemoryId,
        memoryId
      );

    }

    if(
      Array.isArray(
        relations.childMemoryIds
      )
    ){

      relations.childMemoryIds
      .forEach((childId) => {

        executor(
          indexes.byChild,
          childId,
          memoryId
        );

      });

    }

    if(
      Array.isArray(
        relations.relatedMemoryIds
      )
    ){

      relations.relatedMemoryIds
      .forEach((relatedId) => {

        executor(
          indexes.byRelation,
          relatedId,
          memoryId
        );

      });

    }

  }

  return true;

}



// =====================================
// INDEX MEMORY
// =====================================

function indexMemory(
  memory
){

  if(
    !memory ||
    !memory.id
  ){

    return false;
  }

  const indexes =
  memoryState?.indexes;

  if(!indexes){

    return false;
  }

  const memoryId =
  normalizeIndexKey(
    memory.id
  );

  if(!memoryId){

    return false;
  }

  const existingMemory =
  indexes.byId.get(
    memoryId
  );

  if(existingMemory){

    deindexMemory(
      existingMemory
    );

  }

  indexes.byId.set(
    memoryId,
    memory
  );

  processMemoryIndexes(
    memory,
    "add"
  );

  if(

    MEMORY_INDEX_CONFIG
    .ENABLE_EMBEDDING_INDEXING

    &&

    typeof markEmbeddingDirty ===
    "function"

  ){

    markEmbeddingDirty(
      memoryId
    );

  }

  return true;

}



// =====================================
// DEINDEX MEMORY
// =====================================

function deindexMemory(
  memory
){

  if(
    !memory ||
    !memory.id
  ){

    return false;
  }

  const indexes =
  memoryState?.indexes;

  if(!indexes){

    return false;
  }

  const memoryId =
  normalizeIndexKey(
    memory.id
  );

  if(!memoryId){

    return false;
  }

  indexes.byId.delete(
    memoryId
  );

  processMemoryIndexes(
    memory,
    "remove"
  );

  return true;

}



// =====================================
// LOOKUP HELPERS
// =====================================

function getIndexedMemoryIds(
  index,
  key
){

  if(
    !(index instanceof Map)
  ){

    return [];
  }

  const normalizedKey =
  normalizeIndexKey(
    key
  );

  if(!normalizedKey){

    return [];
  }

  const bucket =
  index.get(
    normalizedKey
  );

  if(
    !(bucket instanceof Set)
  ){

    return [];
  }

  return [
    ...bucket.values()
  ];

}



function resolveIndexedMemories(
  ids = []
){

  return ids
  .map((id) => {

    return getMemoryById?.(
      id
    );

  })
  .filter(Boolean);

}



function getMemoriesByToken(
  token
){

  return resolveIndexedMemories(

    getIndexedMemoryIds(
      memoryState?.indexes?.byToken,
      token
    )

  );

}



function getMemoriesByTag(
  tag
){

  return resolveIndexedMemories(

    getIndexedMemoryIds(
      memoryState?.indexes?.byTag,
      tag
    )

  );

}



function getMemoriesByCategory(
  category
){

  return resolveIndexedMemories(

    getIndexedMemoryIds(
      memoryState?.indexes?.byCategory,
      category
    )

  );

}



function getRelatedMemories(
  memoryId
){

  return resolveIndexedMemories(

    getIndexedMemoryIds(
      memoryState?.indexes?.byRelation,
      memoryId
    )

  );

}



// =====================================
// INDEX VALIDATION
// =====================================

function validateMemoryIndexes(){

  try{

    const indexes =
    memoryState?.indexes;

    if(!indexes){

      return {

        valid:false,
        errors:[
          "INDEXES_NOT_FOUND"
        ],
        warnings:[]

      };

    }

    const requiredIndexes = [

      "byId",
      "byType",
      "byCategory",
      "byPriority",
      "byState",
      "byTag",
      "byToken",
      "byParent",
      "byChild",
      "byRelation"

    ];

    for(
      const indexName
      of requiredIndexes
    ){

      if(

        !(indexes[indexName]
        instanceof Map)

      ){

        return {

          valid:false,

          errors:[
            `INVALID_INDEX_${indexName}`
          ],

          warnings:[]

        };

      }

    }

    return {

      valid:true,
      errors:[],
      warnings:[]

    };

  }

  catch(error){

    return {

      valid:false,

      errors:[
        error?.message ||
        "INDEX_VALIDATION_FAILED"
      ],

      warnings:[]

    };

  }

}



// =====================================
// CLEANUP ORPHAN INDEXES
// =====================================

function cleanupOrphanIndexes(){

  if(
    !Array.isArray(
      memoryState?.memories
    )
  ){

    return false;
  }

  const validIds =
  new Set(

    memoryState.memories
    .map((memory) => {

      return normalizeIndexKey(
        memory?.id
      );

    })
    .filter(Boolean)

  );

  Object.entries(
    memoryState.indexes
  )
  .forEach(([indexName,index]) => {

    if(
      indexName === "byId"
    ){

      return;
    }

    if(
      !(index instanceof Map)
    ){

      return;
    }

    index.forEach((bucket,key) => {

      if(
        !(bucket instanceof Set)
      ){

        return;
      }

      [...bucket]
      .forEach((id) => {

        if(
          !validIds.has(id)
        ){

          bucket.delete(id);

        }

      });

      if(
        bucket.size <= 0
      ){

        index.delete(key);

      }

    });

  });

  return true;

}



// =====================================
// REBUILD INDEXES
// =====================================

function rebuildMemoryIndexes(){

  if(
    !memoryState?.indexes
  ){

    return false;
  }

  try{

    if(
      memoryState?.runtime
    ){

      memoryState.runtime
      .rebuildingIndexes =
      true;

    }

    Object.values(
      memoryState.indexes
    )
    .forEach((index) => {

      if(
        index instanceof Map
      ){

        index.clear();

      }

    });

    if(
      Array.isArray(
        memoryState.memories
      )
    ){

      memoryState.memories
      .forEach((memory) => {

        indexMemory(
          memory
        );

      });

    }

    cleanupOrphanIndexes();

    return true;

  }

  finally{

    if(
      memoryState?.runtime
    ){

      memoryState.runtime
      .rebuildingIndexes =
      false;

    }

  }

}



// =====================================
// PUBLIC API
// =====================================

const MemoryIndexing =
Object.freeze({

  index:
  indexMemory,

  deindex:
  deindexMemory,

  rebuild:
  rebuildMemoryIndexes,

  validate:
  validateMemoryIndexes,

  cleanup:
  cleanupOrphanIndexes,

  tokenize:
  extractMemoryTokens,

  getByToken:
  getMemoriesByToken,

  getByTag:
  getMemoriesByTag,

  getByCategory:
  getMemoriesByCategory,

  getRelated:
  getRelatedMemories

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.MemoryIndexing =
  MemoryIndexing;

}
