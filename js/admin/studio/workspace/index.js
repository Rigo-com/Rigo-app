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
// INITIALIZE
// =====================================

function initialize(){

  WorkspaceManager.initialize();

  WorkspaceManager.register(
    DashboardPage
  );

  WorkspaceManager.register(
    AdminAgentPage
  );

  return true;

}



// =====================================
// MOUNT
// =====================================

function mount(
  container
){

  initialize();

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
