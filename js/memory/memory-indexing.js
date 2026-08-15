// =====================================
// RIGO AI
// MEMORY INDEXING
// MEMORY INDEX LAYER
// =====================================

import {
  setIndex,
  getIndex,
  incrementIndexed
}
from "./memory-state.js";

import {
  MEMORY_EVENTS
}
from "./memory-constants.js";

import {
  emit
}
from "./memory-events.js";

import {
  loadMemories
}
from "./memory-storage.js";

import {
  tokenizeText
}
from "./memory-utils.js";

import {
  generateEmbedding,
  deleteEmbedding,
  resetEmbeddings
}
from "./memory-embeddings.js";



// =====================================
// CREATE INDEX
// =====================================

function createMemoryIndex(){

  const index =
  new Map();

  const memories =
  loadMemories();

  for(
    const memory
    of memories
  ){

    const tokens =

      tokenizeText(

        memory?.content
      );

    for(
      const token
      of tokens
    ){

      if(
        !index.has(
          token
        )
      ){

        index.set(

          token,

          new Set()

        );

      }

      index
      .get(token)
      .add(
        memory.id
      );

    }

  }

  return index;

}



// =====================================
// BUILD INDEX
// =====================================

function buildIndex(){

  const memories =
  loadMemories();

  const index =
  createMemoryIndex();

  resetEmbeddings();

  for(const memory of memories){
    generateEmbedding(
      memory.id,
      memory.content
    );
  }

  setIndex(
    "memory",
    index
  );

  incrementIndexed();

  emit(
    MEMORY_EVENTS.INDEXED,
    {
      mode:"rebuild",
      tokens:index.size
    }
  );

  return index;

}



// =====================================
// GET INDEX
// =====================================

function getMemoryIndex(){

  return (

    getIndex(
      "memory"
    )

    ??

    new Map()

  );

}



// =====================================
// INDEX MEMORY
// =====================================

function indexMemory(
  memory
){

  if(
    !memory?.id
  ){
    return false;
  }

  const index =
  getMemoryIndex();

  const tokens =

    tokenizeText(

      memory.content
    );

  for(
    const token
    of tokens
  ){

    if(
      !index.has(
        token
      )
    ){

      index.set(

        token,

        new Set()

      );

    }

    index
    .get(token)
    .add(
      memory.id
    );

  }

  generateEmbedding(

    memory.id,

    memory.content

  );

  setIndex(
    "memory",
    index
  );

  incrementIndexed();

  emit(
    MEMORY_EVENTS.INDEXED,
    {
      mode:"incremental",
      memoryId:memory.id,
      tokens:tokens.length
    }
  );

  return true;

}



// =====================================
// REMOVE MEMORY
// =====================================

function removeIndexedMemory(
  memoryId
){

  const index =
  getMemoryIndex();

  for(
    const [

      token,

      ids

    ]

    of index
  ){

    ids.delete(
      memoryId
    );

    if(
      ids.size === 0
    ){

      index.delete(
        token
      );

    }

  }

  setIndex(
    "memory",
    index
  );

  deleteEmbedding(
    memoryId
  );

  return true;

}



// =====================================
// LOOKUP
// =====================================

function lookupToken(
  token
){

  const index =
  getMemoryIndex();

  return Array.from(

    index.get(
      token
    )

    ??

    []

  );

}



// =====================================
// INDEX STATS
// =====================================

function getIndexStats(){

  const index =
  getMemoryIndex();

  let references = 0;

  for(
    const ids
    of index.values()
  ){

    references +=
    ids.size;

  }

  return Object.freeze({

    tokens:
    index.size,

    references

  });

}



// =====================================
// PUBLIC API
// =====================================

const MemoryIndexing =
Object.freeze({

  createMemoryIndex,

  buildIndex,

  getMemoryIndex,

  indexMemory,

  removeIndexedMemory,

  lookupToken,

  getIndexStats

});



// =====================================
// EXPORTS
// =====================================

export {

  createMemoryIndex,

  buildIndex,

  getMemoryIndex,

  indexMemory,

  removeIndexedMemory,

  lookupToken,

  getIndexStats,

  MemoryIndexing

};

export default
MemoryIndexing;
