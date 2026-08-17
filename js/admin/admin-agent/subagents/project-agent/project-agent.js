// =====================================
// RIGO AI
// PROJECT AGENT
// PRIVATE ADMIN SUBAGENT
// =====================================

import ProjectAgentState
from "./project-agent-state.js";

import ProjectIndex
from "./project-index.js";

import ProjectProviderManager
from "./providers/provider-manager.js";

import GitHubProvider
from "./providers/github-provider.js";



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

    ProjectProviderManager
    .initialize();

    ProjectProviderManager
    .register(
      GitHubProvider
    );

    ProjectProviderManager
    .setActive(
      "github-provider"
    );

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

    const scanResult =
    await ProjectProviderManager
    .scanProject();


    if(
      !scanResult
      ?.ok
    ){

      throw new Error(
        scanResult?.error ||
        "PROJECT_PROVIDER_SCAN_FAILED"
      );

    }

    ProjectIndex
    .set(
      scanResult
      .data
    );
  
    ProjectAgentState
    .setProjectData({
  
      files:
      scanResult
      .data
      .files,

      folders:
      scanResult
      .data
      .folders,

      imports:
      scanResult
      .data
      .imports,

      exports:
      scanResult
      .data
      .exports,

      systems:
      scanResult
      .data
      .systems,

      relationships:
      scanResult
      .data
      .relationships

    });

    
    ProjectAgentState
    .setGraph(
      scanResult
      .data
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
      "PROJECT SCAN COMPLETED",
      {
        source:
        scanResult
        .source,

        files:
        scanResult
        .data
        .files
        .length,

        folders:
        scanResult
        .data
        .folders
        .length
      }
    );
    
    return {

      ok:
      true,

      mode:
      "github-project-scan",

      source:
      scanResult
      .source,

      owner:
      scanResult
      .owner,

      repo:
      scanResult
      .repo,

      branch:
      scanResult
      .branch,

      root:
      scanResult
      .root,

      diagnostics:
      ProjectIndex
      .snapshot()
      .diagnostics,

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

  if(
    type === "providers"
  ){

    return {

      ok:
      true,

      result:
      ProjectProviderManager
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
      "providers",
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
    .snapshot(),

    providers:
    ProjectProviderManager
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
