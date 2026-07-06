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

  registerView,

  getView,

  snapshot

}
from "./workspace-state.js";

import {

  mountWorkspaceLayout,

  getWorkspaceContent,

  getWorkspaceTabs

}
from "./workspace-layout.js";



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

function register(

  view

){

  return registerView(
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
  getView(
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
    content &&
    typeof view.mount === "function"
  ){

    await view.mount(
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

    button.textContent =
    `${tab.icon || ""} ${tab.title}`;

    button.style.cssText =
    `
      height:36px;
      padding:0 14px;
      border:none;
      border-radius:10px 10px 0 0;
      cursor:pointer;
      background:${
        active?.id === tab.id
        ? "#1e293b"
        : "#111827"
      };
      color:white;
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

  return snapshot();

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

  getSnapshot,

  WorkspaceManager

};

export default
WorkspaceManager;
