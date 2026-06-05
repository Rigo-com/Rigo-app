// =====================================
// RIGO AI
// MEMORY UTILS
// UTILITY LAYER
// =====================================

import {
  MEMORY_TYPES,
  MEMORY_PRIORITIES
}
from "./memory-types.js";



// =====================================
// IDS
// =====================================

function createMemoryId(
  prefix = "memory"
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
// TIMESTAMPS
// =====================================

function createTimestamp(){

  return Date.now();

}



function createIsoTimestamp(){

  return new Date()
  .toISOString();

}



// =====================================
// MEMORY FACTORY
// =====================================

function createMemoryRecord(
  content,
  options = {}
){

  return {

    id:

    options.id ??

    createMemoryId(),

    content:

    String(
      content ?? ""
    ),

    type:

    options.type ??

    MEMORY_TYPES
    .SHORT_TERM,

    priority:

    options.priority ??

    MEMORY_PRIORITIES
    .NORMAL,

    tags:

    Array.isArray(
      options.tags
    )

    ? [...options.tags]

    : [],

    createdAt:
    createTimestamp(),

    updatedAt:
    createTimestamp()

  };

}



// =====================================
// TEXT HELPERS
// =====================================

function normalizeText(
  value = ""
){

  return String(
    value
  )
  .trim()
  .toLowerCase();

}



function tokenizeText(
  value = ""
){

  return normalizeText(
    value
  )
  .split(/\s+/)
  .filter(Boolean);

}



// =====================================
// MEMORY HELPERS
// =====================================

function updateMemoryTimestamp(
  memory
){

  if(
    !isObject(
      memory
    )
  ){
    return memory;
  }

  return {

    ...memory,

    updatedAt:
    createTimestamp()

  };

}



function hasMemoryContent(
  memory
){

  return Boolean(

    memory?.content

  );

}



// =====================================
// PUBLIC API
// =====================================

const MemoryUtils =
Object.freeze({

  createMemoryId,

  isObject,

  isString,

  deepClone,

  createTimestamp,

  createIsoTimestamp,

  createMemoryRecord,

  normalizeText,

  tokenizeText,

  updateMemoryTimestamp,

  hasMemoryContent

});



// =====================================
// EXPORTS
// =====================================

export {

  createMemoryId,

  isObject,

  isString,

  deepClone,

  createTimestamp,

  createIsoTimestamp,

  createMemoryRecord,

  normalizeText,

  tokenizeText,

  updateMemoryTimestamp,

  hasMemoryContent,

  MemoryUtils

};

export default
MemoryUtils;
