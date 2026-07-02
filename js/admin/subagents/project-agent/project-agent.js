// =====================================
// RIGO AI
// PROJECT AGENT
// PRIVATE ADMIN SUBAGENT
// =====================================

import ProjectAgentState
from "./project-agent-state.js";



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

    const projectData = {

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
      []

    };

    const graph = {

      nodes:
      [],

      edges:
      []

    };

    ProjectAgentState
    .setProjectData(
      projectData
    );

    ProjectAgentState
    .setGraph(
      graph
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
      "PROJECT SCAN COMPLETED"
    );

    return {

      ok:
      true,

      mode:
      "browser-safe-empty-scan",

      message:
      "Project Agent scan completed. Real filesystem scanning requires backend file access.",

      snapshot:
      ProjectAgentState
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

  const snapshot =
  ProjectAgentState
  .snapshot();

  if(
    type === "snapshot"
  ){

    return {

      ok:
      true,

      result:
      snapshot

    };

  }

  if(
    type === "files"
  ){

    return {

      ok:
      true,

      result:
      snapshot
      .files

    };

  }

  if(
    type === "folders"
  ){

    return {

      ok:
      true,

      result:
      snapshot
      .folders

    };

  }

  if(
    type === "systems"
  ){

    return {

      ok:
      true,

      result:
      snapshot
      .systems

    };

  }

  if(
    type === "search-file"
  ){

    return {

      ok:
      true,

      result:
      snapshot
      .files
      .filter(
        file =>
        String(file)
        .includes(
          String(value || "")
        )
      )

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
      "files",
      "folders",
      "systems",
      "search-file"
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

  return ProjectAgentState
  .snapshot();

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
