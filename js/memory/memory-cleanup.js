// =====================================
// RIGO AI
// MEMORY CLEANUP
// CLEANUP LAYER
// =====================================

import {
  MEMORY_LIMITS
}
from "./memory-constants.js";

import {
  loadMemories,
  saveMemories
}
from "./memory-storage.js";

import {
  memoryState
}
from "./memory-state.js";



// =====================================
// LIMIT MEMORIES
// =====================================

function enforceMemoryLimit(){

  const memories =
  loadMemories();

  if(

    memories.length <=

    MEMORY_LIMITS
    .MAX_MEMORIES

  ){

    return false;

  }

  const trimmed =

    memories.slice(

      -MEMORY_LIMITS
      .MAX_MEMORIES

    );

  saveMemories(
    trimmed
  );

  return true;

}



// =====================================
// ORPHAN EMBEDDINGS
// =====================================

function cleanupOrphanEmbeddings(){

  const validIds =
  new Set(

    loadMemories()
    .map(

      memory =>

      memory.id

    )

  );

  let removed = 0;

  for(
    const [

      id

    ]

    of

    memoryState
    .embeddings
  ){

    if(
      validIds.has(
        id
      )
    ){
      continue;
    }

    memoryState
    .embeddings
    .delete(
      id
    );

    removed++;

  }

  return removed;

}



// =====================================
// ORPHAN INDEXES
// =====================================

function cleanupOrphanIndexes(){

  const validIds =
  new Set(

    loadMemories()
    .map(

      memory =>

      memory.id

    )

  );

  let removed = 0;

  for(
    const [

      token,

      ids

    ]

    of

    memoryState
    .indexes
  ){

    for(
      const id
      of ids
    ){

      if(
        validIds.has(
          id
        )
      ){
        continue;
      }

      ids.delete(
        id
      );

      removed++;

    }

    if(
      ids.size === 0
    ){

      memoryState
      .indexes
      .delete(
        token
      );

    }

  }

  return removed;

}



// =====================================
// EMPTY MEMORIES
// =====================================

function cleanupEmptyMemories(){

  const memories =
  loadMemories();

  const filtered =

    memories.filter(

      memory =>

      memory?.content

      &&

      String(
        memory.content
      )
      .trim()
      .length > 0

    );

  if(

    filtered.length ===

    memories.length

  ){

    return 0;

  }

  saveMemories(
    filtered
  );

  return (

    memories.length -

    filtered.length

  );

}



// =====================================
// FULL CLEANUP
// =====================================

function cleanupMemorySystem(){

  const removedEmpty =

    cleanupEmptyMemories();

  const removedEmbeddings =

    cleanupOrphanEmbeddings();

  const removedIndexes =

    cleanupOrphanIndexes();

  enforceMemoryLimit();

  return Object.freeze({

    removedEmpty,

    removedEmbeddings,

    removedIndexes

  });

}



// =====================================
// PUBLIC API
// =====================================

const MemoryCleanup =
Object.freeze({

  enforceMemoryLimit,

  cleanupOrphanEmbeddings,

  cleanupOrphanIndexes,

  cleanupEmptyMemories,

  cleanupMemorySystem

});



// =====================================
// EXPORTS
// =====================================

export {

  enforceMemoryLimit,

  cleanupOrphanEmbeddings,

  cleanupOrphanIndexes,

  cleanupEmptyMemories,

  cleanupMemorySystem,

  MemoryCleanup

};

export default
MemoryCleanup;
