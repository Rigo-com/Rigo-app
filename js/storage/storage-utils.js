// =====================================
// RIGO AI
// STORAGE UTILS
// UTILITY LAYER
// =====================================

import {
  STORAGE_KEYS,
  STORAGE_NAMESPACES
}
from "./storage-config.js";



// =====================================
// IDS
// =====================================

function createStorageId(
  prefix = "storage"
){

  return (

    String(prefix)

    + "_"

    + Date.now()

    + "_"

    + Math.random()
    .toString(36)
    .slice(2,10)

  );

}



// =====================================
// TYPE HELPERS
// =====================================

function isObject(
  value
){

  return (

    value !== null

    &&

    typeof value ===
    "object"

    &&

    !Array.isArray(
      value
    )

  );

}



function isString(
  value
){

  return typeof value ===
  "string";

}



function isValidKey(
  key
){

  return (

    isString(key)

    &&

    key.trim()
    .length > 0

  );

}



// =====================================
// CLONE
// =====================================

function deepClone(
  value
){

  return structuredClone(
    value
  );

}



// =====================================
// SERIALIZATION
// =====================================

function serialize(
  value
){

  try{

    return JSON.stringify(
      value
    );

  }

  catch{

    return null;

  }

}



function deserialize(
  value
){

  try{

    return JSON.parse(
      value
    );

  }

  catch{

    return null;

  }

}



// =====================================
// STORAGE KEYS
// =====================================

function createStorageKey(

  namespace,

  key

){

  return (

    String(namespace)

    + ":"

    + String(key)

  );

}



function isValidNamespace(
  namespace
){

  return Object.values(

    STORAGE_NAMESPACES

  )
  .includes(
    namespace
  );

}



function getStorageRootKey(
  namespace
){

  switch(namespace){

    case
    STORAGE_NAMESPACES.CHAT:

      return STORAGE_KEYS
      .CHATS;

    case
    STORAGE_NAMESPACES.MEMORY:

      return STORAGE_KEYS
      .MEMORY;

    case
    STORAGE_NAMESPACES.SETTINGS:

      return STORAGE_KEYS
      .SETTINGS;

    case
    STORAGE_NAMESPACES.RUNTIME:

      return STORAGE_KEYS
      .RUNTIME;

    default:

      return null;

  }

}



// =====================================
// SIZE HELPERS
// =====================================

function getSerializedSize(
  value
){

  const serialized =

    serialize(
      value
    );

  if(
    !serialized
  ){
    return 0;
  }

  return serialized
  .length;

}



// =====================================
// PUBLIC API
// =====================================

const StorageUtils =
Object.freeze({

  createStorageId,

  isObject,

  isString,

  isValidKey,

  deepClone,

  serialize,

  deserialize,

  createStorageKey,

  isValidNamespace,

  getStorageRootKey,

  getSerializedSize

});



// =====================================
// EXPORTS
// =====================================

export {

  createStorageId,

  isObject,

  isString,

  isValidKey,

  deepClone,

  serialize,

  deserialize,

  createStorageKey,

  isValidNamespace,

  getStorageRootKey,

  getSerializedSize,

  StorageUtils

};

export default
StorageUtils;
