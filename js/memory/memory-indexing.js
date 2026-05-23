// =====================================
// RIGO AI
// MEMORY INDEXING
// ENTERPRISE INDEX ENGINE FINAL
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

  ENABLE_INCREMENTAL_INDEXING:true,

  ENABLE_AUTO_REPAIR:true,

  MAX_TOKEN_LENGTH:64,

  MIN_TOKEN_LENGTH:2,

  MAX_INDEXED_TOKENS:5000

});



// =====================================
// INDEX HELPERS
// =====================================

function createMemoryIndexMap(){

  return new Map();

}



function createMemoryIndexSet(){

  return new Set();

}



function ensureMemoryIndex(
  index,
  key
){

  if(
    !(index instanceof Map)
  ){

    return null;

  }

  const normalizedKey =
  normalizeMemoryString(
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

      createMemoryIndexSet()

    );

  }

  return index.get(
    normalizedKey
  );

}



function addMemoryIndexValue(
  index,
  key,
  memoryId
){

  const normalizedMemoryId =
  normalizeMemoryString(
    memoryId
  );

  if(!normalizedMemoryId){

    return false;

  }

  const bucket =
  ensureMemoryIndex(
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



function removeMemoryIndexValue(
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
  normalizeMemoryString(
    key
  );

  const normalizedMemoryId =
  normalizeMemoryString(
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

  if(!bucket){

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
  normalizeMemoryString(
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



// =====================================
// TOKENIZATION
// =====================================

function tokenizeMemoryText(
  text
){

  const normalizedText =
  normalizeMemoryContent(
    text
  )
  .toLowerCase();

  if(!normalizedText){

    return [];

  }

  const rawTokens =

    normalizedText
    .split(/[\s.,!?;:/\\()[\]{}"'`<>@#$%^&*_+=|-]+/g);

  const uniqueTokens =
  new Set();

  rawTokens.forEach((token) => {

    const normalizedToken =
    normalizeMemoryString(
      token
    );

    if(
      !normalizedToken
    ){

      return;
    }

    if(

      normalizedToken.length <

      MEMORY_INDEX_CONFIG
      .MIN_TOKEN_LENGTH

    ){

      return;
    }

    if(

      normalizedToken.length >

      MEMORY_INDEX_CONFIG
      .MAX_TOKEN_LENGTH

    ){

      return;
    }

    uniqueTokens.add(
      normalizedToken
    );

  });

  return [

    ...uniqueTokens

  ]
  .slice(
    0,
    MEMORY_INDEX_CONFIG
    .MAX_INDEXED_TOKENS
  );

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

  const tokens = [

    ...tokenizeMemoryText(
      memory.title
    ),

    ...tokenizeMemoryText(
      memory.summary
    ),

    ...tokenizeMemoryText(
      memory.content
    )

  ];

  if(
    Array.isArray(
      memory.tags
    )
  ){

    memory.tags.forEach((tag) => {

      tokens.push(
        ...tokenizeMemoryText(
          tag
        )
      );

    });

  }

  return [

    ...new Set(tokens)

  ];

}



// =====================================
// INDEX VALIDATION
// =====================================

function validateMemoryIndexes(){

  const errors = [];
  const warnings = [];

  try{

    const indexes =
    memoryState.indexes;

    const requiredIndexes = [

      "byId",

      "byType",

      "byCategory",

      "byPriority",

      "byState",

      "byTag",

      "byToken",

      "byRelation"

    ];

    requiredIndexes.forEach((indexName) => {

      if(

        !(

          indexes[
            indexName
          ] instanceof Map

        )

      ){

        errors.push(

          `INVALID_INDEX_${indexName}`

        );

      }

    });

    return {

      valid:
      errors.length === 0,

      errors,

      warnings

    };

  }

  catch(error){

    return {

      valid:false,

      errors:[
        error.message
      ],

      warnings

    };

  }

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

  const memoryId =
  normalizeMemoryString(
    memory.id
  );

  if(!memoryId){

    return false;

  }

  memoryState.indexes
  .byId
  .set(
    memoryId,
    freezeMemoryObject(
      memory
    )
  );

  if(

    MEMORY_INDEX_CONFIG
    .ENABLE_TYPE_INDEXING

  ){

    addMemoryIndexValue(

      memoryState.indexes
      .byType,

      memory.type,

      memoryId

    );

  }

  if(

    MEMORY_INDEX_CONFIG
    .ENABLE_CATEGORY_INDEXING

  ){

    addMemoryIndexValue(

      memoryState.indexes
      .byCategory,

      memory.category,

      memoryId

    );

  }

  if(

    MEMORY_INDEX_CONFIG
    .ENABLE_PRIORITY_INDEXING

  ){

    addMemoryIndexValue(

      memoryState.indexes
      .byPriority,

      memory.priority,

      memoryId

    );

  }

  if(

    MEMORY_INDEX_CONFIG
    .ENABLE_STATE_INDEXING

  ){

    addMemoryIndexValue(

      memoryState.indexes
      .byState,

      memory.state,

      memoryId

    );

  }

  if(
    Array.isArray(
      memory.tags
    )
  ){

    memory.tags.forEach((tag) => {

      addMemoryIndexValue(

        memoryState.indexes
        .byTag,

        tag,

        memoryId

      );

    });

  }

  if(

    MEMORY_INDEX_CONFIG
    .ENABLE_TOKEN_INDEXING

  ){

    const tokens =
    extractMemoryTokens(
      memory
    );

    tokens.forEach((token) => {

      addMemoryIndexValue(

        memoryState.indexes
        .byToken,

        token,

        memoryId

      );

    });

  }

  if(

    MEMORY_INDEX_CONFIG
    .ENABLE_RELATION_INDEXING

  ){

    const relations =
    memory.relations;

    if(
      relations
    ){

      if(
        relations.parentMemoryId
      ){

        addMemoryIndexValue(

          memoryState.indexes
          .byRelation,

          relations.parentMemoryId,

          memoryId

        );

      }

      if(

        Array.isArray(
          relations.relatedMemoryIds
        )

      ){

        relations.relatedMemoryIds
        .forEach((relatedId) => {

          addMemoryIndexValue(

            memoryState.indexes
            .byRelation,

            relatedId,

            memoryId

          );

        });

      }

      if(

        Array.isArray(
          relations.childMemoryIds
        )

      ){

        relations.childMemoryIds
        .forEach((childId) => {

          addMemoryIndexValue(

            memoryState.indexes
            .byRelation,

            childId,

            memoryId

          );

        });

      }

    }

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

  const memoryId =
  normalizeMemoryString(
    memory.id
  );

  if(!memoryId){

    return false;

  }

  memoryState.indexes
  .byId
  .delete(
    memoryId
  );

  removeMemoryIndexValue(
    memoryState.indexes.byType,
    memory.type,
    memoryId
  );

  removeMemoryIndexValue(
    memoryState.indexes.byCategory,
    memory.category,
    memoryId
  );

  removeMemoryIndexValue(
    memoryState.indexes.byPriority,
    memory.priority,
    memoryId
  );

  removeMemoryIndexValue(
    memoryState.indexes.byState,
    memory.state,
    memoryId
  );

  if(
    Array.isArray(
      memory.tags
    )
  ){

    memory.tags.forEach((tag) => {

      removeMemoryIndexValue(
        memoryState.indexes.byTag,
        tag,
        memoryId
      );

    });

  }

  const tokens =
  extractMemoryTokens(
    memory
  );

  tokens.forEach((token) => {

    removeMemoryIndexValue(
      memoryState.indexes.byToken,
      token,
      memoryId
    );

  });

  if(
    memory.relations
  ){

    removeMemoryIndexValue(
      memoryState.indexes.byRelation,
      memory.relations.parentMemoryId,
      memoryId
    );

    if(

      Array.isArray(
        memory.relations.relatedMemoryIds
      )

    ){

      memory.relations
      .relatedMemoryIds
      .forEach((relatedId) => {

        removeMemoryIndexValue(
          memoryState.indexes.byRelation,
          relatedId,
          memoryId
        );

      });

    }

    if(

      Array.isArray(
        memory.relations.childMemoryIds
      )

    ){

      memory.relations
      .childMemoryIds
      .forEach((childId) => {

        removeMemoryIndexValue(
          memoryState.indexes.byRelation,
          childId,
          memoryId
        );

      });

    }

  }

  return true;

}
