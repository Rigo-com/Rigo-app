// =====================================
// RIGO AI
// MEMORY EXPORT
// EXPORT / IMPORT LAYER
// =====================================

import {
  loadMemories,
  saveMemories
}
from "./memory-storage.js";

import {
  createSafeExport,
  createSafeImport
}
from "./memory-security.js";

import {
  validateMemoryCollection
}
from "./memory-validation.js";



// =====================================
// EXPORT MEMORIES
// =====================================

function exportMemories(){

  const memories =
  loadMemories();

  return createSafeExport(
    memories
  );

}



// =====================================
// EXPORT SINGLE MEMORY
// =====================================

function exportMemory(
  memoryId
){

  const memories =
  loadMemories();

  const memory =

    memories.find(

      item =>

      item?.id ===
      memoryId

    );

  if(
    !memory
  ){
    return null;
  }

  return createSafeExport(
    memory
  );

}



// =====================================
// IMPORT MEMORIES
// =====================================

function importMemories(
  rawData
){

  const imported =

    createSafeImport(
      rawData
    );

  if(
    !Array.isArray(
      imported
    )
  ){

    return false;

  }

  if(

    !validateMemoryCollection(
      imported
    )

  ){

    return false;

  }

  return saveMemories(
    imported
  );

}



// =====================================
// APPEND IMPORT
// =====================================

function appendImportedMemories(
  rawData
){

  const imported =

    createSafeImport(
      rawData
    );

  if(
    !Array.isArray(
      imported
    )
  ){

    return false;

  }

  if(

    !validateMemoryCollection(
      imported
    )

  ){

    return false;

  }

  const existing =
  loadMemories();

  return saveMemories([

    ...existing,

    ...imported

  ]);

}



// =====================================
// EXPORT STATS
// =====================================

function getExportStats(){

  const memories =
  loadMemories();

  const exported =

    exportMemories();

  return Object.freeze({

    memories:
    memories.length,

    size:

    exported?.length
    ?? 0

  });

}



// =====================================
// PUBLIC API
// =====================================

const MemoryExport =
Object.freeze({

  exportMemories,

  exportMemory,

  importMemories,

  appendImportedMemories,

  getExportStats

});



// =====================================
// EXPORTS
// =====================================

export {

  exportMemories,

  exportMemory,

  importMemories,

  appendImportedMemories,

  getExportStats,

  MemoryExport

};

export default
MemoryExport;
