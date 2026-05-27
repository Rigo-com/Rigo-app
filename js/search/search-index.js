// =====================================
// RIGO AI
// SEARCH INDEX
// OPTIMIZED FINAL
// =====================================



// =====================================
// SEARCH INDEX STATE
// =====================================

const searchIndexState =
Object.seal({

  initialized:false,

  rebuilding:false,

  indexedMemories:0,

  indexedTokens:0,

  failedIndexes:0,

  lastIndexedAt:null,

  lastRebuildAt:null,

  tokenIndex:new Map(),

  memoryIndex:new Map()

});



// =====================================
// TOKENIZE CONTENT
// =====================================

function tokenizeSearchContent(
  content
){

  const tokens =
  tokenizeMemoryText?.(

    normalizeMemoryContent?.(
      content
    )

  ) || [];

  return [

    ...new Set(tokens)

  ];

}



// =====================================
// INDEX MEMORY
// =====================================

function indexMemoryTokens(
  memory
){

  try{

    if(
      !memory?.id
    ){

      return false;

    }



    // ================================
    // CLEAN OLD INDEX
    // ================================

    removeIndexedMemory(
      memory.id
    );



    // ================================
    // BUILD CONTENT
    // ================================

    const searchableContent = [

      memory.title,

      memory.summary,

      memory.content,

      Array.isArray(
        memory.tags
      )

      ? memory.tags.join(" ")

      : ""

    ]
    .filter(Boolean)
    .join(" ");



    // ================================
    // TOKENS
    // ================================

    const tokens =
    tokenizeSearchContent(
      searchableContent
    );

    if(
      tokens.length <= 0
    ){

      return false;

    }



    // ================================
    // MEMORY INDEX
    // ================================

    searchIndexState
    .memoryIndex
    .set(
      memory.id,
      tokens
    );



    // ================================
    // TOKEN INDEX
    // ================================

    tokens.forEach((token) => {

      if(

        !searchIndexState
        .tokenIndex
        .has(token)

      ){

        searchIndexState
        .tokenIndex
        .set(
          token,
          new Set()
        );

      }

      searchIndexState
      .tokenIndex
      .get(token)
      .add(
        memory.id
      );

    });



    // ================================
    // STATS
    // ================================

    searchIndexState
    .indexedMemories =

      searchIndexState
      .memoryIndex
      .size;

    searchIndexState
    .indexedTokens =

      searchIndexState
      .tokenIndex
      .size;

    searchIndexState
    .lastIndexedAt =
    Date.now();

    return true;

  }

  catch(error){

    searchIndexState
    .failedIndexes++;

    return false;

  }

}



// =====================================
// REMOVE INDEXED MEMORY
// =====================================

function removeIndexedMemory(
  memoryId
){

  const normalizedId =
  normalizeMemoryString?.(
    memoryId
  );

  if(!normalizedId){

    return false;

  }

  const tokens =

    searchIndexState
    .memoryIndex
    .get(
      normalizedId
    );

  if(!tokens){

    return false;

  }

  tokens.forEach((token) => {

    const indexed =

      searchIndexState
      .tokenIndex
      .get(token);

    if(!indexed){

      return;
    }

    indexed.delete(
      normalizedId
    );

    if(
      indexed.size <= 0
    ){

      searchIndexState
      .tokenIndex
      .delete(token);

    }

  });

  searchIndexState
  .memoryIndex
  .delete(
    normalizedId
  );

  searchIndexState
  .indexedMemories =

    searchIndexState
    .memoryIndex
    .size;

  searchIndexState
  .indexedTokens =

    searchIndexState
    .tokenIndex
    .size;

  return true;

}



// =====================================
// REBUILD INDEXES
// =====================================

function rebuildSearchIndexes(){

  searchIndexState
  .rebuilding = true;

  try{

    searchIndexState
    .tokenIndex
    .clear();

    searchIndexState
    .memoryIndex
    .clear();

    const memories =

      Array.isArray(
        memoryState?.memories
      )

      ? memoryState.memories

      : [];

    memories.forEach((memory) => {

      if(
        memory?.state ===
        "deleted"
      ){

        return;
      }

      indexMemoryTokens(
        memory
      );

    });

    searchIndexState
    .initialized = true;

    searchIndexState
    .lastRebuildAt =
    Date.now();

    return true;

  }

  catch(error){

    searchIndexState
    .failedIndexes++;

    return false;

  }

  finally{

    searchIndexState
    .rebuilding = false;

  }

}



// =====================================
// SEARCH INDEX LOOKUP
// =====================================

function searchIndexedMemories(
  query
){

  const tokens =
  tokenizeSearchContent(
    query
  );

  if(
    tokens.length <= 0
  ){

    return [];
  }

  const memoryIds =
  new Set();

  tokens.forEach((token) => {

    const indexed =

      searchIndexState
      .tokenIndex
      .get(token);

    if(!indexed){

      return;
    }

    indexed.forEach((id) => {

      memoryIds.add(id);

    });

  });

  return [

    ...memoryIds

  ]

  .map((id) => {

    return getMemoryById?.(
      id
    );

  })

  .filter((memory) => {

    return (

      memory

      &&

      memory.state !==
      "deleted"

    );

  });

}



// =====================================
// CLEAR INDEXES
// =====================================

function clearSearchIndexes(){

  searchIndexState
  .tokenIndex
  .clear();

  searchIndexState
  .memoryIndex
  .clear();

  searchIndexState
  .indexedMemories = 0;

  searchIndexState
  .indexedTokens = 0;

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getSearchIndexDiagnostics(){

  return {

    initialized:
    searchIndexState
    .initialized,

    rebuilding:
    searchIndexState
    .rebuilding,

    indexedMemories:
    searchIndexState
    .indexedMemories,

    indexedTokens:
    searchIndexState
    .indexedTokens,

    failedIndexes:
    searchIndexState
    .failedIndexes,

    lastIndexedAt:
    searchIndexState
    .lastIndexedAt,

    lastRebuildAt:
    searchIndexState
    .lastRebuildAt

  };

}



// =====================================
// EXPORTS
// =====================================

export {

  searchIndexState,

  tokenizeSearchContent,

  indexMemoryTokens,

  removeIndexedMemory,

  rebuildSearchIndexes,

  searchIndexedMemories,

  clearSearchIndexes,

  getSearchIndexDiagnostics

};
