// =====================================
// RIGO AI
// STUDIO WORKSPACE STATE
// =====================================

const WorkspaceState =
Object.seal({

  initialized:false,

  mounted:false,

  root:null,

  tabs:[],

  activeTabId:null,

  views:{},

  history:[],

  diagnostics:{

    opened:0,

    closed:0,

    activated:0

  }

});



function createTab(
  options = {}
){

  return {

    id:
    options.id,

    type:
    options.type || "view",

    title:
    options.title || options.id,

    icon:
    options.icon || "",

    closable:
    options.closable !== false,

    payload:
    options.payload || null,

    createdAt:
    Date.now(),

    updatedAt:
    Date.now()

  };

}



function hasTab(
  tabId
){

  return WorkspaceState
  .tabs
  .some(
    function(tab){

      return tab.id === tabId;

    }
  );

}



function addTab(
  tab
){

  if(
    !tab ||
    !tab.id
  ){

    return false;

  }

  if(
    hasTab(
      tab.id
    )
  ){

    return false;

  }

  WorkspaceState
  .tabs
  .push(
    tab
  );

  WorkspaceState.diagnostics.opened +=
  1;

  return true;

}



function removeTab(
  tabId
){

  const before =
  WorkspaceState
  .tabs
  .length;

  WorkspaceState.tabs =
  WorkspaceState
  .tabs
  .filter(
    function(tab){

      return tab.id !== tabId;

    }
  );

  if(
    WorkspaceState.tabs.length !== before
  ){

    WorkspaceState.diagnostics.closed +=
    1;

    return true;

  }

  return false;

}



function setActiveTab(
  tabId
){

  if(
    !hasTab(
      tabId
    )
  ){

    return false;

  }

  WorkspaceState.activeTabId =
  tabId;

  WorkspaceState.history.push(
    tabId
  );

  WorkspaceState.diagnostics.activated +=
  1;

  return true;

}



function getActiveTab(){

  return WorkspaceState
  .tabs
  .find(
    function(tab){

      return tab.id === WorkspaceState.activeTabId;

    }
  ) || null;

}



function registerView(
  view
){

  if(
    !view ||
    !view.id
  ){

    return false;

  }

  WorkspaceState.views[view.id] =
  view;

  return true;

}



function getView(
  viewId
){

  return WorkspaceState.views[viewId] || null;

}



function reset(){

  WorkspaceState.initialized =
  false;

  WorkspaceState.mounted =
  false;

  WorkspaceState.root =
  null;

  WorkspaceState.tabs =
  [];

  WorkspaceState.activeTabId =
  null;

  WorkspaceState.views =
  {};

  WorkspaceState.history =
  [];

  WorkspaceState.diagnostics = {

    opened:0,

    closed:0,

    activated:0

  };

  return true;

}



function snapshot(){

  return JSON.parse(
    JSON.stringify(
      {
        initialized:WorkspaceState.initialized,
        mounted:WorkspaceState.mounted,
        tabs:WorkspaceState.tabs,
        activeTabId:WorkspaceState.activeTabId,
        viewIds:Object.keys(WorkspaceState.views),
        history:WorkspaceState.history,
        diagnostics:WorkspaceState.diagnostics
      }
    )
  );

}



export {

  WorkspaceState,

  createTab,

  hasTab,

  addTab,

  removeTab,

  setActiveTab,

  getActiveTab,

  registerView,

  getView,

  reset,

  snapshot

};

export default
WorkspaceState;
