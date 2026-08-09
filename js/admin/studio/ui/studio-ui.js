// =====================================
// RIGO AI
// STUDIO UI
// =====================================

import Workspace
from "../workspace/index.js";

import StudioPages
from "./studio-pages.js";

import {
  mountStudioLayout,
  unmountStudioLayout
}
from "./studio-layout.js";

import renderSidebar
from "./studio-sidebar.js";

async function mount(container){
  StudioPages.initialize();
  mountStudioLayout(container);
  renderSidebar();

  const workspaceContainer = document.getElementById("rigo-studio-workspace");
  await Workspace.mount(workspaceContainer);

  const pageId = StudioPages.getPageFromHash();
  await Workspace.open(pageId);
  return true;
}

async function unmount(){
  StudioPages.unmount();
  await Workspace.unmount();
  unmountStudioLayout();
  return true;
}

const StudioUI = Object.freeze({mount,unmount});

export {mount,unmount,StudioUI};
export default StudioUI;
