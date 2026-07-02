// =====================================
// RIGO AI
// ADMIN AGENT CORE
// =====================================

import AdminAgentState
from "./admin-agent-state.js";

import AdminAgentPermissions
from "./admin-agent-permissions.js";



// =====================================
// INITIALIZE
// =====================================

async function initialize(){

  try{

    if(
      AdminAgentState
      .state
      .initialized
    ){

      return true;

    }

    AdminAgentState
    .setInitialized(
      true
    );

    AdminAgentState
    .log(
      "system",
      "ADMIN AGENT INITIALIZED"
    );

    return true;

  }
  catch(error){

    AdminAgentState
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
      !AdminAgentState
      .state
      .initialized
    ){

      await initialize();

    }

    AdminAgentState
    .setBooted(
      true
    );

    AdminAgentState
    .log(
      "system",
      "ADMIN AGENT BOOTED"
    );

    return true;

  }
  catch(error){

    AdminAgentState
    .setError(
      error
    );

    return false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdown(){

  AdminAgentState
  .setBooted(
    false
  );

  AdminAgentState
  .log(
    "system",
    "ADMIN AGENT SHUTDOWN"
  );

  return true;

}



// =====================================
// RESET
// =====================================

async function reset(){

  AdminAgentState
  .reset();

  AdminAgentState
  .log(
    "system",
    "ADMIN AGENT RESET"
  );

  return true;

}



// =====================================
// COMMAND
// =====================================

async function command(
  input
){

  if(
    !input
  ){

    return {
      ok:
      false,

      error:
      "EMPTY_ADMIN_AGENT_COMMAND"
    };

  }

  AdminAgentState
  .state
  .lastCommand =
  input;

  AdminAgentState
  .state
  .diagnostics
  .commands +=
  1;

  AdminAgentState
  .log(
    "command",
    input
  );

  const result = {

    ok:
    true,

    mode:
    "analysis-only",

    message:
    "Admin Agent command received. Execution layer is disabled until approval and backend file access are connected.",

    permissions:
    AdminAgentPermissions
    .snapshot(),

    timestamp:
    Date.now()

  };

  AdminAgentState
  .state
  .lastResult =
  result;

  return result;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    state:
    AdminAgentState
    .snapshot(),

    permissions:
    AdminAgentPermissions
    .snapshot()

  };

}



// =====================================
// API
// =====================================

const AdminAgent =
Object.freeze({

  id:
  "admin-agent",

  priority:
  30,

  initialize,

  boot,

  shutdown,

  reset,

  command,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  boot,

  shutdown,

  reset,

  command,

  snapshot,

  AdminAgent

};

export default
AdminAgent;
