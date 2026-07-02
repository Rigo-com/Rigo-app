// =====================================
// RIGO AI
// ADMIN PROJECT AGENT STATE
// PRIVATE SUBAGENT
// =====================================

const projectAgentState =
Object.seal({

  id:
  "project-agent",

  initialized:
  false,

  booted:
  false,

  scanning:
  false,

  indexed:
  false,

  mapped:
  false,

  lastScanAt:
  null,

  lastError:
  null,

  files:
  [],

  folders:
  [],

  imports:
  [],

  exports:
  [],

  systems:
  [],

  relationships:
  [],

  graph:
  Object.seal({

    nodes:
    [],

    edges:
    []

  }),

  diagnostics:
  Object.seal({

    scans:
    0,

    files:
    0,

    folders:
    0,

    imports:
    0,

    exports:
    0,

    systems:
    0,

    relationships:
    0,

    errors:
    0

  }),

  logs:
  []

});

function log(
  type,
  message,
  payload = null
){

  const entry = {

    type,
    message,
    payload,
    timestamp:
    Date.now()

  };

  projectAgentState
  .logs
  .push(entry);

  if(
    projectAgentState
    .logs
    .length > 200
  ){

    projectAgentState
    .logs
    .shift();

  }

  return entry;

}

function setInitialized(
  value
){

  projectAgentState
  .initialized =
  Boolean(value);

  return true;

}

function setBooted(
  value
){

  projectAgentState
  .booted =
  Boolean(value);

  return true;

}

function setScanning(
  value
){

  projectAgentState
  .scanning =
  Boolean(value);

  return true;

}

function setError(
  error
){

  projectAgentState
  .lastError =
  error;

  projectAgentState
  .diagnostics
  .errors +=
  1;

  log(
    "error",
    error?.message || String(error),
    error
  );

  return true;

}

function setProjectData(
  data = {}
){

  projectAgentState
  .files =
  Array.isArray(data.files)
  ? data.files
  : [];

  projectAgentState
  .folders =
  Array.isArray(data.folders)
  ? data.folders
  : [];

  projectAgentState
  .imports =
  Array.isArray(data.imports)
  ? data.imports
  : [];

  projectAgentState
  .exports =
  Array.isArray(data.exports)
  ? data.exports
  : [];

  projectAgentState
  .systems =
  Array.isArray(data.systems)
  ? data.systems
  : [];

  projectAgentState
  .relationships =
  Array.isArray(data.relationships)
  ? data.relationships
  : [];

  projectAgentState
  .diagnostics
  .files =
  projectAgentState
  .files
  .length;

  projectAgentState
  .diagnostics
  .folders =
  projectAgentState
  .folders
  .length;

  projectAgentState
  .diagnostics
  .imports =
  projectAgentState
  .imports
  .length;

  projectAgentState
  .diagnostics
  .exports =
  projectAgentState
  .exports
  .length;

  projectAgentState
  .diagnostics
  .systems =
  projectAgentState
  .systems
  .length;

  projectAgentState
  .diagnostics
  .relationships =
  projectAgentState
  .relationships
  .length;

  return true;

}

function setGraph(
  graph = {}
){

  projectAgentState
  .graph
  .nodes =
  Array.isArray(graph.nodes)
  ? graph.nodes
  : [];

  projectAgentState
  .graph
  .edges =
  Array.isArray(graph.edges)
  ? graph.edges
  : [];

  projectAgentState
  .mapped =
  true;

  return true;

}

function markScanned(){

  projectAgentState
  .lastScanAt =
  Date.now();

  projectAgentState
  .diagnostics
  .scans +=
  1;

  projectAgentState
  .indexed =
  true;

  return true;

}

function snapshot(){

  return {

    id:
    projectAgentState
    .id,

    initialized:
    projectAgentState
    .initialized,

    booted:
    projectAgentState
    .booted,

    scanning:
    projectAgentState
    .scanning,

    indexed:
    projectAgentState
    .indexed,

    mapped:
    projectAgentState
    .mapped,

    lastScanAt:
    projectAgentState
    .lastScanAt,

    lastError:
    projectAgentState
    .lastError,

    files:
    [
      ...projectAgentState
      .files
    ],

    folders:
    [
      ...projectAgentState
      .folders
    ],

    imports:
    [
      ...projectAgentState
      .imports
    ],

    exports:
    [
      ...projectAgentState
      .exports
    ],

    systems:
    [
      ...projectAgentState
      .systems
    ],

    relationships:
    [
      ...projectAgentState
      .relationships
    ],

    graph:
    {

      nodes:
      [
        ...projectAgentState
        .graph
        .nodes
      ],

      edges:
      [
        ...projectAgentState
        .graph
        .edges
      ]

    },

    diagnostics:
    {
      ...projectAgentState
      .diagnostics
    },

    logs:
    [
      ...projectAgentState
      .logs
    ]

  };

}

function reset(){

  projectAgentState
  .initialized =
  false;

  projectAgentState
  .booted =
  false;

  projectAgentState
  .scanning =
  false;

  projectAgentState
  .indexed =
  false;

  projectAgentState
  .mapped =
  false;

  projectAgentState
  .lastScanAt =
  null;

  projectAgentState
  .lastError =
  null;

  projectAgentState
  .files =
  [];

  projectAgentState
  .folders =
  [];

  projectAgentState
  .imports =
  [];

  projectAgentState
  .exports =
  [];

  projectAgentState
  .systems =
  [];

  projectAgentState
  .relationships =
  [];

  projectAgentState
  .graph
  .nodes =
  [];

  projectAgentState
  .graph
  .edges =
  [];

  projectAgentState
  .diagnostics
  .scans =
  0;

  projectAgentState
  .diagnostics
  .files =
  0;

  projectAgentState
  .diagnostics
  .folders =
  0;

  projectAgentState
  .diagnostics
  .imports =
  0;

  projectAgentState
  .diagnostics
  .exports =
  0;

  projectAgentState
  .diagnostics
  .systems =
  0;

  projectAgentState
  .diagnostics
  .relationships =
  0;

  projectAgentState
  .diagnostics
  .errors =
  0;

  projectAgentState
  .logs =
  [];

  return true;

}

const ProjectAgentState =
Object.freeze({

  state:
  projectAgentState,

  log,

  setInitialized,

  setBooted,

  setScanning,

  setError,

  setProjectData,

  setGraph,

  markScanned,

  snapshot,

  reset

});

export {

  projectAgentState,

  log,

  setInitialized,

  setBooted,

  setScanning,

  setError,

  setProjectData,

  setGraph,

  markScanned,

  snapshot,

  reset,

  ProjectAgentState

};

export default
ProjectAgentState;
