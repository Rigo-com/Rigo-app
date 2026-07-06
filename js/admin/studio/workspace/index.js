// =====================================
// RIGO AI
// STUDIO WORKSPACE
// ROOT API
// =====================================

import WorkspaceManager
from "./workspace-manager.js";

import DashboardPage
from "../pages/dashboard/index.js";

import AdminAgentPage
from "../pages/admin-agent/index.js";



// =====================================
// INTERNAL STATE
// =====================================

const workspaceRootState =
Object.seal({

  initialized:false

});



// =====================================
// INITIALIZE
// =====================================

async function initialize(){

  if(
    workspaceRootState.initialized
  ){

    return true;

  }

  WorkspaceManager.initialize();

  await WorkspaceManager.register(
    DashboardPage
  );

  await WorkspaceManager.register(
    AdminAgentPage
  );

  workspaceRootState.initialized =
  true;

  return true;

}



// =====================================
// MOUNT
// =====================================

async function mount(
  container
){

  await initialize();

  return WorkspaceManager.mount(
    container
  );

}



// =====================================
// OPEN
// =====================================

async function open(
  viewId
){

  await initialize();

  return WorkspaceManager.openView(
    viewId
  );

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return WorkspaceManager.snapshot();

}



// =====================================
// API
// =====================================

const Workspace =
Object.freeze({

  initialize,

  mount,

  open,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  mount,

  open,

  snapshot,

  Workspace

};

export default
Workspace;
