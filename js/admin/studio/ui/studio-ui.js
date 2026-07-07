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



// =====================================
// MOUNT
// =====================================

async function mount(
  container
){

  mountStudioLayout(
    container
  );

  renderSidebar();

  const workspaceContainer =
  document.getElementById(
    "rigo-studio-workspace"
  );

  await Workspace.mount(
    workspaceContainer
  );

  const pageId =
  StudioPages.getPageFromHash();

  await Workspace.open(
    pageId
  );

  return true;

}



// =====================================
// UNMOUNT
// =====================================

function unmount(){

  StudioPages.unmount();

  unmountStudioLayout();

  return true;

}



// =====================================
// API
// =====================================

const StudioUI =
Object.freeze({

  mount,

  unmount

});



// =====================================
// EXPORTS
// =====================================

export {

  mount,

  unmount,

  StudioUI

};

export default
StudioUI;
