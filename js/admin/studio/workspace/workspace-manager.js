// =====================================
// RIGO AI
// STUDIO WORKSPACE MANAGER
// =====================================

import {

  WorkspaceState,

  createTab,

  addTab,

  hasTab,

  setActiveTab,

  getActiveTab,

  snapshot

}
from "./workspace-state.js";

import {

  mountWorkspaceLayout,

  getWorkspaceContent,

  getWorkspaceTabs

}
from "./workspace-layout.js";

import ViewManager
from "./view-manager.js";



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  if(
    WorkspaceState.initialized
  ){

    return true;

  }

  WorkspaceState.initialized =
  true;

  return true;

}



// =====================================
// MOUNT
// =====================================

function mount(
  container
){

  initialize();

  const root =
  mountWorkspaceLayout(
    container
  );

  WorkspaceState.root =
  root;

  WorkspaceState.mounted =
  true;

  return root;

}



// =====================================
// REGISTER VIEW
// =====================================

async function register(
  view
){

  return ViewManager
  .register(
    view
  );

}



// =====================================
// OPEN VIEW
// =====================================

async function openView(
  viewId
){

  const view =
  ViewManager
  .get(
    viewId
  );

  if(
    !view
  ){

    return false;

  }

  if(
    !hasTab(
      viewId
    )
  ){

    addTab(
      createTab({
        id:view.id,
        title:view.title,
        icon:view.icon,
        closable:false
      })
    );

  }

  setActiveTab(
    view.id
  );

  renderTabs();

  const content =
  getWorkspaceContent();

  if(
    content
  ){

    await ViewManager
    .mount(
      view.id,
      content
    );

  }

  return true;

}



// =====================================
// RENDER TABS
// =====================================

function renderTabs(){

  const tabsContainer =
  getWorkspaceTabs();

  if(
    !tabsContainer
  ){

    return false;

  }

  tabsContainer.innerHTML =
  "";

  const active =
  getActiveTab();

  for(
    const tab
    of WorkspaceState.tabs
  ){

    const button =
    document.createElement(
      "button"
    );

    button.dataset.tab =
    tab.id;

    button.textContent =
    `${tab.icon || ""} ${tab.title}`;

    button.style.cssText =
    `
      height:38px;
      padding:0 16px;
      border:none;
      border-radius:12px 12px 0 0;
      cursor:pointer;
      background:${
        active?.id === tab.id
        ? "#1e293b"
        : "#0f172a"
      };
      color:${
        active?.id === tab.id
        ? "#f8fafc"
        : "#94a3b8"
      };
      border:1px solid rgba(148,163,184,.10);
      border-bottom:none;
      font-weight:700;
      white-space:nowrap;
    `;

    button.onclick =
    function(){

      openView(
        tab.id
      );

    };

    tabsContainer.appendChild(
      button
    );

  }

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function getSnapshot(){

  return {

    workspace:
    snapshot(),

    views:
    ViewManager.snapshot()

  };

}



// =====================================
// API
// =====================================

const WorkspaceManager =
Object.freeze({

  initialize,

  mount,

  register,

  openView,

  renderTabs,

  snapshot:
  getSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  mount,

  register,

  openView,

  renderTabs,

  getSnapshot,

  WorkspaceManager

};

export default
WorkspaceManager;
