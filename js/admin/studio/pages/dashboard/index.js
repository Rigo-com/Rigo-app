// =====================================
// RIGO AI
// STUDIO DASHBOARD PAGE
// =====================================

import DashboardState, {
  setInitialized,
  setError,
  reset as resetState,
  snapshot as snapshotState
}
from "./dashboard-state.js";

import {
  loadDashboardData,
  getProjectAgent
}
from "./dashboard-loader.js";

import {
  renderLayout
}
from "./dashboard-layout.js";

import DashboardActions
from "./dashboard-actions.js";



// =====================================
// INTERNAL STATE
// =====================================

const dashboardPageState =
Object.seal({

  initialized:
  false,

  mounted:
  false,

  container:
  null

});



// =====================================
// RENDER
// =====================================

function render(){

  const container =
  dashboardPageState
  .container;

  if(
    !container
  ){

    return false;

  }

  container.innerHTML =
  renderLayout(
    DashboardState
  );

  DashboardActions
  .mount(
    container,
    {

      onRefresh:
      refresh,

      onScanProject:
      scanProject

    }
  );

  return true;

}



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  if(
    dashboardPageState
    .initialized
  ){

    return true;

  }

  setInitialized(
    true
  );

  dashboardPageState
  .initialized =
  true;

  return true;

}



// =====================================
// MOUNT
// =====================================

async function mount(
  container
){

  if(
    !container
  ){

    return false;

  }

  initialize();

  dashboardPageState.container =
  container;

  dashboardPageState.mounted =
  true;

  container.style.cssText =
  `
    height:100%;
    overflow:auto;
    background:#0b1220;
  `;

  render();

  await refresh();

  return true;

}



// =====================================
// REFRESH
// =====================================

async function refresh(){

  if(
    !dashboardPageState
    .mounted
  ){

    return false;

  }

  await loadDashboardData();

  render();

  return true;

}



// =====================================
// SCAN PROJECT
// =====================================

async function scanProject(){

  const projectAgent =
  getProjectAgent();

  try{

    if(
      projectAgent &&
      typeof projectAgent.scan === "function"
    ){

      await projectAgent
      .scan();

    }
    else if(
      projectAgent &&
      typeof projectAgent.scanProject === "function"
    ){

      await projectAgent
      .scanProject();

    }
    else if(
      window?.Admin &&
      typeof window.Admin.scanProject === "function"
    ){

      await window.Admin
      .scanProject();

    }
    else{

      throw new Error(
        "Project scan API is not available."
      );

    }

    await refresh();

    return true;

  }
  catch(error){

    setError(
      error
    );

    render();

    return false;

  }

}



// =====================================
// UNMOUNT
// =====================================

function unmount(){

  DashboardActions
  .unmount();

  if(
    dashboardPageState.container
  ){

    dashboardPageState
    .container
    .innerHTML =
    "";

  }

  dashboardPageState.container =
  null;

  dashboardPageState.mounted =
  false;

  return true;

}



// =====================================
// RESET
// =====================================

function reset(){

  unmount();

  resetState();

  dashboardPageState.initialized =
  false;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    page:"dashboard",

    initialized:
    dashboardPageState.initialized,

    mounted:
    dashboardPageState.mounted,

    state:
    snapshotState(),

    actions:
    DashboardActions.snapshot()

  };

}



// =====================================
// PAGE API
// =====================================

const DashboardPage =
Object.freeze({

  id:
  "dashboard",

  title:
  "Dashboard",

  initialize,

  mount,

  refresh,

  scanProject,

  unmount,

  reset,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  mount,

  refresh,

  scanProject,

  unmount,

  reset,

  snapshot,

  DashboardPage

};

export default
DashboardPage;
