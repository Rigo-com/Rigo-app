// =====================================
// RIGO AI
// PROJECT INDEX
// ADMIN PROJECT KNOWLEDGE BASE
// =====================================

const projectIndex =
Object.seal({

  version:
  "1.0.0",

  createdAt:
  Date.now(),

  updatedAt:
  null,

  source:
  "runtime",

  ready:
  false,

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

  services:
  [],

  routes:
  [],

  ui:
  [],

  ai:
  [],

  memory:
  [],

  debug:
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

    services:
    0,

    routes:
    0,

    ui:
    0,

    ai:
    0,

    memory:
    0,

    debug:
    0,

    relationships:
    0,

    graphNodes:
    0,

    graphEdges:
    0

  })

});

function updateDiagnostics(){

  projectIndex
  .diagnostics
  .files =
  projectIndex
  .files
  .length;

  projectIndex
  .diagnostics
  .folders =
  projectIndex
  .folders
  .length;

  projectIndex
  .diagnostics
  .imports =
  projectIndex
  .imports
  .length;

  projectIndex
  .diagnostics
  .exports =
  projectIndex
  .exports
  .length;

  projectIndex
  .diagnostics
  .systems =
  projectIndex
  .systems
  .length;

  projectIndex
  .diagnostics
  .services =
  projectIndex
  .services
  .length;

  projectIndex
  .diagnostics
  .routes =
  projectIndex
  .routes
  .length;

  projectIndex
  .diagnostics
  .ui =
  projectIndex
  .ui
  .length;

  projectIndex
  .diagnostics
  .ai =
  projectIndex
  .ai
  .length;

  projectIndex
  .diagnostics
  .memory =
  projectIndex
  .memory
  .length;

  projectIndex
  .diagnostics
  .debug =
  projectIndex
  .debug
  .length;

  projectIndex
  .diagnostics
  .relationships =
  projectIndex
  .relationships
  .length;

  projectIndex
  .diagnostics
  .graphNodes =
  projectIndex
  .graph
  .nodes
  .length;

  projectIndex
  .diagnostics
  .graphEdges =
  projectIndex
  .graph
  .edges
  .length;

  return true;

}

function setProjectIndexData(
  data = {}
){

  projectIndex
  .files =
  Array.isArray(data.files)
  ? data.files
  : [];

  projectIndex
  .folders =
  Array.isArray(data.folders)
  ? data.folders
  : [];

  projectIndex
  .imports =
  Array.isArray(data.imports)
  ? data.imports
  : [];

  projectIndex
  .exports =
  Array.isArray(data.exports)
  ? data.exports
  : [];

  projectIndex
  .systems =
  Array.isArray(data.systems)
  ? data.systems
  : [];

  projectIndex
  .services =
  Array.isArray(data.services)
  ? data.services
  : [];

  projectIndex
  .routes =
  Array.isArray(data.routes)
  ? data.routes
  : [];

  projectIndex
  .ui =
  Array.isArray(data.ui)
  ? data.ui
  : [];

  projectIndex
  .ai =
  Array.isArray(data.ai)
  ? data.ai
  : [];

  projectIndex
  .memory =
  Array.isArray(data.memory)
  ? data.memory
  : [];

  projectIndex
  .debug =
  Array.isArray(data.debug)
  ? data.debug
  : [];

  projectIndex
  .relationships =
  Array.isArray(data.relationships)
  ? data.relationships
  : [];

  projectIndex
  .graph
  .nodes =
  Array.isArray(data.graph?.nodes)
  ? data.graph.nodes
  : [];

  projectIndex
  .graph
  .edges =
  Array.isArray(data.graph?.edges)
  ? data.graph.edges
  : [];

  projectIndex
  .updatedAt =
  Date.now();

  projectIndex
  .ready =
  true;

  updateDiagnostics();

  return true;

}

function clearProjectIndex(){

  setProjectIndexData({

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

    services:
    [],

    routes:
    [],

    ui:
    [],

    ai:
    [],

    memory:
    [],

    debug:
    [],

    relationships:
    [],

    graph:
    {

      nodes:
      [],

      edges:
      []

    }

  });

  projectIndex
  .ready =
  false;

  return true;

}

function getProjectIndexSnapshot(){

  updateDiagnostics();

  return {

    version:
    projectIndex
    .version,

    createdAt:
    projectIndex
    .createdAt,

    updatedAt:
    projectIndex
    .updatedAt,

    source:
    projectIndex
    .source,

    ready:
    projectIndex
    .ready,

    files:
    [
      ...projectIndex
      .files
    ],

    folders:
    [
      ...projectIndex
      .folders
    ],

    imports:
    [
      ...projectIndex
      .imports
    ],

    exports:
    [
      ...projectIndex
      .exports
    ],

    systems:
    [
      ...projectIndex
      .systems
    ],

    services:
    [
      ...projectIndex
      .services
    ],

    routes:
    [
      ...projectIndex
      .routes
    ],

    ui:
    [
      ...projectIndex
      .ui
    ],

    ai:
    [
      ...projectIndex
      .ai
    ],

    memory:
    [
      ...projectIndex
      .memory
    ],

    debug:
    [
      ...projectIndex
      .debug
    ],

    relationships:
    [
      ...projectIndex
      .relationships
    ],

    graph:
    {

      nodes:
      [
        ...projectIndex
        .graph
        .nodes
      ],

      edges:
      [
        ...projectIndex
        .graph
        .edges
      ]

    },

    diagnostics:
    {
      ...projectIndex
      .diagnostics
    }

  };

}

function queryProjectIndex(
  type,
  value = null
){

  const snapshot =
  getProjectIndexSnapshot();

  if(
    type === "snapshot"
  ){

    return snapshot;

  }

  if(
    Object.prototype
    .hasOwnProperty
    .call(
      snapshot,
      type
    )
  ){

    return snapshot[
      type
    ];

  }

  if(
    type === "search"
  ){

    const keyword =
    String(value || "")
    .toLowerCase();

    return snapshot
    .files
    .filter(
      item =>
      JSON.stringify(item)
      .toLowerCase()
      .includes(
        keyword
      )
    );

  }

  return null;

}

const ProjectIndex =
Object.freeze({

  index:
  projectIndex,

  set:
  setProjectIndexData,

  clear:
  clearProjectIndex,

  snapshot:
  getProjectIndexSnapshot,

  query:
  queryProjectIndex

});

export {

  projectIndex,

  setProjectIndexData,

  clearProjectIndex,

  getProjectIndexSnapshot,

  queryProjectIndex,

  ProjectIndex

};

export default
ProjectIndex;
