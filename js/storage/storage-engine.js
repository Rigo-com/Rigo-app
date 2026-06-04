// =====================================
// RIGO AI
// STORAGE ENGINE
// PERSISTENCE ENGINE LAYER
// =====================================

import {
  serialize,
  deserialize
}
from "./storage-utils.js";

import {
  validateStorageKey
}
from "./storage-validators.js";



// =====================================
// SAVE
// =====================================

function saveItem(
  key,
  value
){

  if(
    !validateStorageKey(
      key
    )
  ){
    return false;
  }

  try{

    const serialized =

      serialize(
        value
      );

    if(
      serialized === null
    ){
      return false;
    }

    localStorage.setItem(

      key,

      serialized

    );

    return true;

  }

  catch{

    return false;

  }

}



// =====================================
// LOAD
// =====================================

function loadItem(
  key
){

  if(
    !validateStorageKey(
      key
    )
  ){
    return null;
  }

  try{

    const value =

      localStorage.getItem(
        key
      );

    if(
      value === null
    ){
      return null;
    }

    return deserialize(
      value
    );

  }

  catch{

    return null;

  }

}



// =====================================
// REMOVE
// =====================================

function removeItem(
  key
){

  if(
    !validateStorageKey(
      key
    )
  ){
    return false;
  }

  try{

    localStorage.removeItem(
      key
    );

    return true;

  }

  catch{

    return false;

  }

}



// =====================================
// CLEAR
// =====================================

function clearStorage(){

  try{

    localStorage.clear();

    return true;

  }

  catch{

    return false;

  }

}



// =====================================
// EXISTS
// =====================================

function hasItem(
  key
){

  if(
    !validateStorageKey(
      key
    )
  ){
    return false;
  }

  try{

    return (

      localStorage.getItem(
        key
      )

      !== null

    );

  }

  catch{

    return false;

  }

}



// =====================================
// STATS
// =====================================

function getEngineStats(){

  try{

    return Object.freeze({

      entries:
      localStorage.length

    });

  }

  catch{

    return Object.freeze({

      entries:0

    });

  }

}



// =====================================
// PUBLIC API
// =====================================

const StorageEngine =
Object.freeze({

  saveItem,

  loadItem,

  removeItem,

  clearStorage,

  hasItem,

  getEngineStats

});



// =====================================
// EXPORTS
// =====================================

export {

  saveItem,

  loadItem,

  removeItem,

  clearStorage,

  hasItem,

  getEngineStats,

  StorageEngine

};

export default
StorageEngine;
