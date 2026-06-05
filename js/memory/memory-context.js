// =====================================
// RIGO AI
// MEMORY CONTEXT
// CONTEXT MANAGEMENT LAYER
// =====================================

import {
  MEMORY_LIMITS
}
from "./memory-constants.js";

import {
  getContext,
  setContext
}
from "./memory-state.js";

import {
  deepClone
}
from "./memory-utils.js";



// =====================================
// ADD
// =====================================

function addContextItem(
  item
){

  const context =
  getContext();

  context.push(

    deepClone(
      item
    )

  );

  while(

    context.length >

    MEMORY_LIMITS
    .MAX_CONTEXT_ITEMS

  ){

    context.shift();

  }

  setContext(
    context
  );

  return true;

}



// =====================================
// REMOVE
// =====================================

function removeContextItem(
  id
){

  const context =

    getContext();

  const filtered =

    context.filter(

      item =>

      item?.id !== id

    );

  setContext(
    filtered
  );

  return true;

}



// =====================================
// FIND
// =====================================

function findContextItem(
  id
){

  const context =

    getContext();

  return (

    context.find(

      item =>

      item?.id === id

    )

    ??

    null

  );

}



// =====================================
// GET ALL
// =====================================

function getContextItems(){

  return deepClone(

    getContext()

  );

}



// =====================================
// COUNT
// =====================================

function getContextCount(){

  return getContext()
  .length;

}



// =====================================
// CLEAR
// =====================================

function clearContext(){

  setContext(
    []
  );

  return true;

}



// =====================================
// RECENT
// =====================================

function getRecentContext(
  limit = 10
){

  return getContext()
  .slice(
    -limit
  );

}



// =====================================
// STATS
// =====================================

function getContextStats(){

  return Object.freeze({

    items:
    getContextCount(),

    limit:
    MEMORY_LIMITS
    .MAX_CONTEXT_ITEMS

  });

}



// =====================================
// PUBLIC API
// =====================================

const MemoryContext =
Object.freeze({

  addContextItem,

  removeContextItem,

  findContextItem,

  getContextItems,

  getContextCount,

  clearContext,

  getRecentContext,

  getContextStats

});



// =====================================
// EXPORTS
// =====================================

export {

  addContextItem,

  removeContextItem,

  findContextItem,

  getContextItems,

  getContextCount,

  clearContext,

  getRecentContext,

  getContextStats,

  MemoryContext

};

export default
MemoryContext;
