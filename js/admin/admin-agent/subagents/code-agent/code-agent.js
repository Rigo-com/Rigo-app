// =====================================
// RIGO AI
// CODE AGENT
// =====================================

import CodeAgentState
from "./code-agent-state.js";

import CodeIndex
from "./code-index.js";

import ProjectAgent
from "../project-agent/index.js";



// =====================================
// INITIALIZE
// =====================================

async function initialize(){

  if(
    CodeAgentState
    .state
    .initialized
  ){

    return true;

  }

  CodeAgentState
  .setInitialized(
    true
  );

  CodeAgentState
  .log(
    "system",
    "CODE AGENT INITIALIZED"
  );

  return true;

}



// =====================================
// BOOT
// =====================================

async function boot(){

  if(
    !CodeAgentState
    .state
    .initialized
  ){

    await initialize();

  }

  CodeAgentState
  .setBooted(
    true
  );

  CodeAgentState
  .log(
    "system",
    "CODE AGENT BOOTED"
  );

  return true;

}



// =====================================
// ANALYZE
// =====================================

async function analyze(){

  const project =

  ProjectAgent
  .query({

    type:
    "snapshot"

  });

  if(
    !project?.ok
  ){

    return {

      ok:
      false,

      error:
      "PROJECT_NOT_READY"

    };

  }

  const files =

    project
    .result
    .files || [];

  CodeIndex
  .set(
    files
  );

  CodeAgentState
  .setFiles(
    files
  );

  CodeAgentState
  .state
  .diagnostics
  .analyses++;

  return {

    ok:
    true,

    files:
    files.length

  };

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdown(){

  CodeAgentState
  .setBooted(
    false
  );

  return true;

}



// =====================================
// RESET
// =====================================

async function reset(){

  CodeIndex
  .clear();

  CodeAgentState
  .reset();

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    state:
    CodeAgentState
    .snapshot(),

    index:
    CodeIndex
    .snapshot()

  };

}



// =====================================
// API
// =====================================

const CodeAgent =
Object.freeze({

  id:
  "code-agent",

  priority:
  40,

  initialize,

  boot,

  analyze,

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

  analyze,

  shutdown,

  reset,

  snapshot,

  CodeAgent

};

export default
CodeAgent;
