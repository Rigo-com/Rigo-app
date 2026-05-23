// =====================================
// RIGO AI
// SEARCH INDEX
// ENTERPRISE ULTRA FINAL
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

  lastIndexedAt:null,

  lastRebuildAt:null,

  tokenIndex:new Map(),

  memoryIndex:new Map(),

  failedIndexes:0

});



// =====================================
// TOKENIZE SEARCH CONTENT
// =====================================

function tokenizeSearchContent(
  content
){

  return tokenizeMemoryText(
    normalizeMemoryContent(
      content
    )
  );

}



// =====================================
// INDEX MEMORY TOKENS
// =====================================

function indexMemoryTokens(
  memory
){

  if(
    !memory?.id
  ){

    return false;
  }

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
  .join(" ");

  const tokens =
  tokenizeSearchContent(
    searchableContent
  );

  searchIndexState
  .memoryIndex
  .set(
    memory.id,
    tokens
  );

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

  searchIndexState
  .indexedMemories++;

  searchIndexState
  .lastIndexedAt =
  Date.now();

  return true;

}



// =====================================
// REMOVE MEMORY INDEX
// =====================================

function removeIndexedMemory(
  memoryId
){

  const tokens =

    searchIndexState
    .memoryIndex
    .get(memoryId);

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
      memoryId
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
    memoryId
  );

  return true;

}



// =====================================
// REBUILD INDEX
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

    searchIndexState
    .indexedMemories = 0;

    memoryState.memories
    .forEach((memory) => {

      indexMemoryTokens(
        memory
      );

    });

    searchIndexState
    .indexedTokens =

      searchIndexState
      .tokenIndex
      .size;

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

    return getMemoryById(id);

  })
  .filter(Boolean);

}
