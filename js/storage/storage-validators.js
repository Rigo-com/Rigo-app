// =====================================
// RIGO AI
// STORAGE VALIDATORS
// VALIDATION LAYER
// =====================================

import {
  STORAGE_LIMITS,
  STORAGE_NAMESPACES
}
from "./storage-config.js";

import {
  isObject,
  isString,
  isValidKey,
  getSerializedSize,
  isValidNamespace
}
from "./storage-utils.js";



// =====================================
// KEY VALIDATION
// =====================================

function validateStorageKey(
  key
){

  return isValidKey(
    key
  );

}



// =====================================
// VALUE VALIDATION
// =====================================

function validateStorageValue(
  value
){

  if(
    value === undefined
  ){
    return false;
  }

  const size =

    getSerializedSize(
      value
    );

  return (

    size > 0

    &&

    size <=
    STORAGE_LIMITS
    .MAX_STORAGE_SIZE

  );

}



// =====================================
// NAMESPACE VALIDATION
// =====================================

function validateNamespace(
  namespace
){

  return isValidNamespace(
    namespace
  );

}



// =====================================
// RECORD VALIDATION
// =====================================

function validateStorageRecord(

  key,

  value

){

  return (

    validateStorageKey(
      key
    )

    &&

    validateStorageValue(
      value
    )

  );

}



// =====================================
// CHAT VALIDATION
// =====================================

function validateChatRecord(
  chat
){

  if(
    !isObject(
      chat
    )
  ){
    return false;
  }

  return (

    isString(
      chat.id
    )

    &&

    Array.isArray(
      chat.messages
    )

  );

}



// =====================================
// MEMORY VALIDATION
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

    isString(
      memory.id
    )

    &&

    memory.content !==
    undefined

  );

}



// =====================================
// BATCH VALIDATION
// =====================================

function validateBatch(
  records = []
){

  return Array.isArray(
    records
  );

}



// =====================================
// STORAGE HEALTH
// =====================================

function validateStorageHealth(
  snapshot
){

  if(
    !isObject(
      snapshot
    )
  ){
    return false;
  }

  return (

    typeof snapshot
    .healthy ===
    "boolean"

  );

}



// =====================================
// PUBLIC API
// =====================================

const StorageValidators =
Object.freeze({

  validateStorageKey,

  validateStorageValue,

  validateNamespace,

  validateStorageRecord,

  validateChatRecord,

  validateMemoryRecord,

  validateBatch,

  validateStorageHealth

});



// =====================================
// EXPORTS
// =====================================

export {

  validateStorageKey,

  validateStorageValue,

  validateNamespace,

  validateStorageRecord,

  validateChatRecord,

  validateMemoryRecord,

  validateBatch,

  validateStorageHealth,

  StorageValidators

};

export default
StorageValidators;
