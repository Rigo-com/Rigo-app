// =====================================
// RIGO AI
// CODE AGENT STATE
// =====================================

const state =
Object.seal({

  initialized:
  false,

  booted:
  false,

  analyzing:
  false,

  project:
  null,

  files:
  [],

  results:
  [],

  lastQuery:
  null,

  lastError:
  null,

  diagnostics:{

    analyses:
    0,

    searches:
    0,

    edits:
    0,

    generations:
    0

  },

  logs:
  []

});



// =====================================
// SETTERS
// =====================================

function setInitialized(
  value
){

  state.initialized =
  Boolean(value);

}



function setBooted(
  value
){

  state.booted =
  Boolean(value);

}



function setAnalyzing(
  value
){

  state.analyzing =
  Boolean(value);

}



function setProject(
  project
){

  state.project =
  project;

}



function setFiles(
  files
){

  state.files =
  Array.isArray(files)
  ? files
  : [];

}



function setResults(
  results
){

  state.results =
  Array.isArray(results)
  ? results
  : [];

}



function setError(
  error
){

  state.lastError =
  error;

}



// =====================================
// LOG
// =====================================

function log(
  type,
  message,
  data = null
){

  state.logs.push({

    type,

    message,

    data,

    timestamp:
    Date.now()

  });

}



// =====================================
// RESET
// =====================================

function reset(){

  state.initialized =
  false;

  state.booted =
  false;

  state.analyzing =
  false;

  state.project =
  null;

  state.files =
  [];

  state.results =
  [];

  state.lastQuery =
  null;

  state.lastError =
  null;

  state.logs =
  [];

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return
  structuredClone(
    state
  );

}



// =====================================
// EXPORTS
// =====================================

const CodeAgentState =
Object.freeze({

  state,

  setInitialized,

  setBooted,

  setAnalyzing,

  setProject,

  setFiles,

  setResults,

  setError,

  log,

  reset,

  snapshot

});

export {

  state,

  setInitialized,

  setBooted,

  setAnalyzing,

  setProject,

  setFiles,

  setResults,

  setError,

  log,

  reset,

  snapshot,

  CodeAgentState

};

export default
CodeAgentState;
