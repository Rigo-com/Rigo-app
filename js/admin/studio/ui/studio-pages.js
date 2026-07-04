// =====================================
// RIGO AI
// STUDIO PAGES ROUTER
// =====================================

import DashboardPage
from "../pages/dashboard/index.js";



// =====================================
// PAGE REGISTRY
// =====================================

const pages =
Object.freeze({

  dashboard:
  DashboardPage

});



// =====================================
// INTERNAL STATE
// =====================================

const studioPagesState =
Object.seal({

  initialized:
  false,

  activePage:
  null,

  workspace:
  null

});



// =====================================
// WORKSPACE
// =====================================

function getWorkspace(){

  return document
  .getElementById(
    "rigo-studio-workspace"
  );

}



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  if(
    studioPagesState
    .initialized
  ){

    return true;

  }

  Object
  .values(
    pages
  )
  .forEach(
    function initializePage(
      page
    ){

      if(
        page &&
        typeof page.initialize === "function"
      ){

        page
        .initialize();

      }

    }
  );

  studioPagesState.initialized =
  true;

  return true;

}



// =====================================
// GET PAGE
// =====================================

function getPage(
  pageId = "dashboard"
){

  return (
    pages[pageId] ||
    pages.dashboard
  );

}



// =====================================
// RENDER PAGE
// =====================================

async function renderPage(
  pageId = "dashboard"
){

  initialize();

  const workspace =
  getWorkspace();

  if(
    !workspace
  ){

    return false;

  }

  const nextPage =
  getPage(
    pageId
  );

  if(
    studioPagesState.activePage &&
    studioPagesState.activePage !== nextPage &&
    typeof studioPagesState.activePage.unmount === "function"
  ){

    studioPagesState.activePage
    .unmount();

  }

  studioPagesState.workspace =
  workspace;

  studioPagesState.activePage =
  nextPage;

  if(
    nextPage &&
    typeof nextPage.mount === "function"
  ){

    await nextPage
    .mount(
      workspace
    );

    return true;

  }

  workspace.innerHTML =
  `
    <div style="padding:16px;color:#e5e7eb;">
      Page not available.
    </div>
  `;

  return false;

}



// =====================================
// REFRESH ACTIVE PAGE
// =====================================

async function refresh(){

  const activePage =
  studioPagesState
  .activePage;

  if(
    activePage &&
    typeof activePage.refresh === "function"
  ){

    await activePage
    .refresh();

    return true;

  }

  return false;

}



// =====================================
// UNMOUNT
// =====================================

function unmount(){

  if(
    studioPagesState.activePage &&
    typeof studioPagesState.activePage.unmount === "function"
  ){

    studioPagesState.activePage
    .unmount();

  }

  studioPagesState.activePage =
  null;

  studioPagesState.workspace =
  null;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    initialized:
    studioPagesState.initialized,

    activePage:
    studioPagesState.activePage?.id || null,

    registeredPages:
    Object.keys(
      pages
    )

  };

}



// =====================================
// API
// =====================================

const StudioPages =
Object.freeze({

  initialize,

  renderPage,

  refresh,

  unmount,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  renderPage,

  refresh,

  unmount,

  snapshot,

  StudioPages

};

export default
StudioPages;
