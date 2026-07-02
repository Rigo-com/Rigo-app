// =====================================
// RIGO AI
// PROJECT AGENT
// PRIVATE ADMIN SUBAGENT
// =====================================

import ProjectAgentState
from "./project-agent-state.js";

import ProjectIndex
from "./project-index.js";



// =====================================
// INITIALIZE
// =====================================

async function initialize(){

  try{

    if(
      ProjectAgentState
      .state
      .initialized
    ){

      return true;

    }

    ProjectAgentState
    .setInitialized(
      true
    );

    ProjectAgentState
    .log(
      "system",
      "PROJECT AGENT INITIALIZED"
    );

    return true;

  }
  catch(error){

    ProjectAgentState
    .setError(
      error
    );

    return false;

  }

}



// =====================================
// BOOT
// =====================================

async function boot(){

  try{

    if(
      !ProjectAgentState
      .state
      .initialized
    ){

      await initialize();

    }

    ProjectAgentState
    .setBooted(
      true
    );

    ProjectAgentState
    .log(
      "system",
      "PROJECT AGENT BOOTED"
    );

    return true;

  }
  catch(error){

    ProjectAgentState
    .setError(
      error
    );

    return false;

  }

}



// =====================================
// SCAN
// =====================================

async function scan(){

  try{

    ProjectAgentState
    .setScanning(
      true
    );

    const emptyProjectData = {

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

    };

    ProjectIndex
    .set(
      emptyProjectData
    );

    ProjectAgentState
    .setProjectData({

      files:
      emptyProjectData
      .files,

      folders:
      emptyProjectData
      .folders,

      imports:
      emptyProjectData
      .imports,

      exports:
      emptyProjectData
      .exports,

      systems:
      emptyProjectData
      .systems,

      relationships:
      emptyProjectData
      .relationships

    });

    ProjectAgentState
    .setGraph(
      emptyProjectData
      .graph
    );

    ProjectAgentState
    .markScanned();

    ProjectAgentState
    .setScanning(
      false
    );

    ProjectAgentState
    .log(
      "scan",
      "PROJECT INDEX CREATED"
    );

    return {

      ok:
      true,

      mode:
      "project-index-empty",

      message:
      "Project Index created. Real project scanning requires backend file access or repository API.",

      index:
      ProjectIndex
      .snapshot()

    };

  }
  catch(error){

    ProjectAgentState
    .setScanning(
      false
    );

    ProjectAgentState
    .setError(
      error
    );

    return {

      ok:
      false,

      error:
      error?.message || String(error)

    };

  }

}



// =====================================
// QUERY
// =====================================

function query(
  request = {}
){

  const type =
  request
  ?.type;

  const value =
  request
  ?.value;

  if(
    type === "snapshot"
  ){

    return {

      ok:
      true,

      result:
      ProjectIndex
      .snapshot()

    };

  }

  if(
    type === "state"
  ){

    return {

      ok:
      true,

      result:
      ProjectAgentState
      .snapshot()

    };

  }

  const result =
  ProjectIndex
  .query(
    type,
    value
  );

  if(
    result !== null
  ){

    return {

      ok:
      true,

      result

    };

  }

  return {

    ok:
    false,

    error:
    "UNKNOWN_PROJECT_AGENT_QUERY",

    supported:
    [
      "snapshot",
      "state",
      "files",
      "folders",
      "systems",
      "services",
      "routes",
      "ui",
      "ai",
      "memory",
      "debug",
      "imports",
      "exports",
      "relationships",
      "graph",
      "diagnostics",
      "search"
    ]

  };

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdown(){

  ProjectAgentState
  .setBooted(
    false
  );

  ProjectAgentState
  .log(
    "system",
    "PROJECT AGENT SHUTDOWN"
  );

  return true;

}



// =====================================
// RESET
// =====================================

async function reset(){

  ProjectIndex
  .clear();

  ProjectAgentState
  .reset();

  ProjectAgentState
  .log(
    "system",
    "PROJECT AGENT RESET"
  );

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    state:
    ProjectAgentState
    .snapshot(),

    index:
    ProjectIndex
    .snapshot()

  };

}



// =====================================
// API
// =====================================

const ProjectAgent =
Object.freeze({

  id:
  "project-agent",

  private:
  true,

  initialize,

  boot,

  scan,

  query,

  shutdown,

  reset,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  boot,

  scan,

  query,

  shutdown,

  reset,

  snapshot,

  ProjectAgent

};

export default
ProjectAgent;
