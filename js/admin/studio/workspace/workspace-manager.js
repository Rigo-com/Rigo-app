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
  Boolean(
    root
  );

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

        id:
        view.id,

        title:
        view.title,

        icon:
        view.icon,

        closable:
        false

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
    !content
  ){

    return false;

  }

  await ViewManager
  .mount(
    view.id,
    content
  );

  return true;

}



// =====================================
// CREATE TAB BUTTON
// =====================================

function createTabButton(
  tab,
  activeTab
){

  const button =
  document.createElement(
    "button"
  );

  const isActive =
  activeTab?.id ===
  tab.id;

  button.type =
  "button";

  button.dataset.tab =
  tab.id;

  button.title =
  tab.title;

  button.innerHTML =
  `
    ${
      tab.icon
      ? `
        <span
          style="
            display:inline-flex;
            align-items:center;
            justify-content:center;
            font-size:13px;
            line-height:1;
          "
        >
          ${tab.icon}
        </span>
      `
      : ""
    }

    <span>
      ${tab.title}
    </span>
  `;

  button.style.cssText =
  `
    height:34px;
    min-width:0;
    flex:0 0 auto;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:6px;
    padding:0 13px;
    margin:0;
    border:1px solid ${
      isActive
      ? "rgba(148,163,184,.16)"
      : "transparent"
    };
    border-bottom:none;
    border-radius:9px 9px 0 0;
    background:${
      isActive
      ? "rgba(30,41,59,.92)"
      : "transparent"
    };
    color:${
      isActive
      ? "#f8fafc"
      : "#94a3b8"
    };
    font-family:inherit;
    font-size:12px;
    line-height:1;
    font-weight:${
      isActive
      ? "700"
      : "600"
    };
    white-space:nowrap;
    cursor:pointer;
    transition:
      background .16s ease,
      color .16s ease,
      border-color .16s ease;
  `;

  button.addEventListener(
    "mouseenter",
    function(){

      if(
        !isActive
      ){

        button.style.background =
        "rgba(30,41,59,.46)";

        button.style.color =
        "#cbd5e1";

      }

    }
  );

  button.addEventListener(
    "mouseleave",
    function(){

      if(
        !isActive
      ){

        button.style.background =
        "transparent";

        button.style.color =
        "#94a3b8";

      }

    }
  );

  button.addEventListener(
    "click",
    function(){

      openView(
        tab.id
      );

    }
  );

  return button;

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

  const activeTab =
  getActiveTab();

  for(
    const tab
    of WorkspaceState.tabs
  ){

    tabsContainer.appendChild(
      createTabButton(
        tab,
        activeTab
      )
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
