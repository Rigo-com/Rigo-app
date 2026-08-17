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

import CodeMapPage
from "../pages/code-map-page.js";

import MemoryPage
from "../pages/memory-page.js";

import ExtensionsPage
from "../pages/extensions-page.js";

import SettingsPage
from "../pages/settings-page.js";

import DebugPage
from "../pages/debug-page.js";

import ProjectPage
from "../pages/project-page.js";

import SystemCenterPage
from "../pages/system-center-page.js";

const workspaceRootState = Object.seal({initialized:false});

async function initialize(){
  if(workspaceRootState.initialized){return true;}
  WorkspaceManager.initialize();
  await WorkspaceManager.register(DashboardPage);
  await WorkspaceManager.register(AdminAgentPage);
  await WorkspaceManager.register(CodeMapPage);
  await WorkspaceManager.register(MemoryPage);
  await WorkspaceManager.register(ExtensionsPage);
  await WorkspaceManager.register(SettingsPage);
  await WorkspaceManager.register(DebugPage);
  await WorkspaceManager.register(ProjectPage);
  await WorkspaceManager.register(SystemCenterPage);
  workspaceRootState.initialized = true;
  return true;
}

async function mount(container){
  await initialize();
  return WorkspaceManager.mount(container);
}

async function open(viewId){
  await initialize();
  return WorkspaceManager.openView(viewId);
}

async function unmount(){
  return WorkspaceManager.unmount();
}

function snapshot(){return WorkspaceManager.snapshot();}

const Workspace = Object.freeze({initialize,mount,open,unmount,snapshot});

export {initialize,mount,open,unmount,snapshot,Workspace};
export default Workspace;
