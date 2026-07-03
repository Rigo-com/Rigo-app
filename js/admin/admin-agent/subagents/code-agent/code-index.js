// =====================================
// RIGO AI
// CODE INDEX
// =====================================

const codeIndex =
Object.seal({

  files:
  [],

  analyses:
  [],

  search:
  [],

  diagnostics:{}

});



// =====================================
// SET
// =====================================

function set(
  files = []
){

  codeIndex.files =
  Array.isArray(files)
  ? files
  : [];

  return true;

}



// =====================================
// CLEAR
// =====================================

function clear(){

  codeIndex.files =
  [];

  codeIndex.analyses =
  [];

  codeIndex.search =
  [];

  codeIndex.diagnostics =
  {};

  return true;

}



// =====================================
// QUERY
// =====================================

function query(
  type
){

  switch(type){

    case "files":

      return codeIndex.files;

    case "analyses":

      return codeIndex.analyses;

    case "search":

      return codeIndex.search;

    case "diagnostics":

      return codeIndex.diagnostics;

    default:

      return null;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return structuredClone(
    codeIndex
  );

}



// =====================================
// API
// =====================================

const CodeIndex =
Object.freeze({

  set,

  clear,

  query,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  set,

  clear,

  query,

  snapshot,

  CodeIndex

};

export default
CodeIndex;
