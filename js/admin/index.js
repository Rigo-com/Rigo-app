// =====================================
// RIGO AI
// ADMIN ROOT API
// PRIVATE ADMIN SYSTEM
// =====================================

import AdminRuntime
from "./runtime/index.js";

import createAdminDebugPanel
from "./admin-debug-panel.js";



// =====================================
// INITIALIZE
// =====================================

async function initialize(){

  return AdminRuntime
  .initialize();

}



// =====================================
// BOOT
// =====================================

async function boot(){

  const result =
  await AdminRuntime
  .boot();

  if(
    typeof window !== "undefined"
  ){

    window.Admin =
    Admin;

    const params =
    new URLSearchParams(
      window.location.search
    );

    if(
      params.get("adminDebug") === "1"
    ){

      createAdminDebugPanel(
        Admin
      );

    }

  }

  return result;

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdown(){

  return AdminRuntime
  .shutdown();

}



// =====================================
// RECOVER
// =====================================

async function recover(){

  return AdminRuntime
  .recover();

}



// =====================================
// RESET
// =====================================

async function reset(){

  return AdminRuntime
  .reset();

}



// =====================================
// COMMAND
// =====================================

async function command(
  input
){

  const agentModule =
  AdminRuntime
  .registry
  .get(
    "admin-agent"
  );

  if(
    !agentModule ||
    typeof agentModule.command !== "function"
  ){

    return {
      ok:
      false,

      error:
      "ADMIN_AGENT_COMMAND_NOT_AVAILABLE"
    };

  }

  return agentModule
  .command(
    input
  );

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return AdminRuntime
  .snapshot();

}



// =====================================
// API
// =====================================

const Admin =
Object.freeze({

  id:
  "admin",

  priority:
  30,

  initialize,

  boot,

  shutdown,

  recover,

  reset,

  command,

  snapshot,

  runtime:
  AdminRuntime

});



// =====================================
// DEV EXPOSURE
// TEMPORARY ADMIN CONSOLE ACCESS
// =====================================

if(
  typeof window !== "undefined"
){

  window.Admin =
  Admin;

}



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  boot,

  shutdown,

  recover,

  reset,

  command,

  snapshot,

  Admin

};

export default
Admin;
