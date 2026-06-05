// =====================================
// RIGO AI
// MEMORY VALIDATION
// VALIDATION LAYER
// =====================================

import {
  MEMORY_TYPES,
  MEMORY_PRIORITIES,
  MEMORY_STATUS
}
from "./memory-types.js";

import {
  MEMORY_LIMITS
}
from "./memory-constants.js";

import {
  isObject,
  isString
}
from "./memory-utils.js";



// =====================================
// CONTENT
// =====================================

function validateMemoryContent(
  content
){

  return (

    isString(
      content
    )

    &&

    content
    .trim()
    .length > 0

  );

}



// =====================================
// TYPE
// =====================================

function validateMemoryType(
  type
){

  return Object.values(

    MEMORY_TYPES

  )
  .includes(
    type
  );

}



// =====================================
// PRIORITY
// =====================================

function validateMemoryPriority(
  priority
){

  return Object.values(

    MEMORY_PRIORITIES

  )
  .includes(
    priority
  );

}



// =====================================
// STATUS
// =====================================

function validateMemoryStatus(
  status
){

  return Object.values(

    MEMORY_STATUS

  )
  .includes(
    status
  );

}



// =====================================
// TAGS
// =====================================

function validateMemoryTags(
  tags
){

  if(
    !Array.isArray(
      tags
    )
  ){
    return false;
  }

  return (

    tags.length <=

    MEMORY_LIMITS
    .MAX_TAGS

  );

}



// =====================================
// MEMORY RECORD
// =====================================

function validateMemoryRecord(
  memory
){

  if(
    !isObject(
      memory
    )
  ){
    return false;
  }

  return (

    validateMemoryContent(
      memory.content
    )

    &&

    validateMemoryType(
      memory.type
    )

    &&

    validateMemoryPriority(
      memory.priority
    )

    &&

    validateMemoryTags(

      memory.tags ?? []

    )

  );

}



// =====================================
// MEMORY COLLECTION
// =====================================

function validateMemoryCollection(
  memories
){

  if(
    !Array.isArray(
      memories
    )
  ){
    return false;
  }

  return memories.every(

    validateMemoryRecord

  );

}



// =====================================
// SEARCH QUERY
// =====================================

function validateSearchQuery(
  query
){

  return (

    isString(
      query
    )

    &&

    query.trim()
    .length > 0

  );

}



// =====================================
// EMBEDDING
// =====================================

function validateEmbedding(
  embedding
){

  return Array.isArray(
    embedding
  );

}



// =====================================
// PUBLIC API
// =====================================

const MemoryValidation =
Object.freeze({

  validateMemoryContent,

  validateMemoryType,

  validateMemoryPriority,

  validateMemoryStatus,

  validateMemoryTags,

  validateMemoryRecord,

  validateMemoryCollection,

  validateSearchQuery,

  validateEmbedding

});



// =====================================
// EXPORTS
// =====================================

export {

  validateMemoryContent,

  validateMemoryType,

  validateMemoryPriority,

  validateMemoryStatus,

  validateMemoryTags,

  validateMemoryRecord,

  validateMemoryCollection,

  validateSearchQuery,

  validateEmbedding,

  MemoryValidation

};

export default
MemoryValidation;
