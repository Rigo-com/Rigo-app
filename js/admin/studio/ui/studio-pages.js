// =====================================
// RIGO AI
// STUDIO PAGES ROUTER
// =====================================

import DashboardPage
from "../pages/dashboard/index.js";

import AdminAgentPage
from "../pages/admin-agent/index.js";



// =====================================
// PAGE REGISTRY
// =====================================

const pages =
Object.freeze({

  dashboard:
  DashboardPage,

  "admin-agent":
  AdminAgentPage

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

  activePageId:
  null,

  workspace:
  null,

  listening:
  false

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
// HASH
// =====================================

function getPageFromHash(){

  const hash =
  window.location.hash || "";

  if(
    hash.startsWith(
      "#studio/"
    )
  ){

    const pageId =
    hash
    .replace(
      "#studio/",
      ""
    )
    .trim();

    return pageId || "dashboard";

  }

  return "dashboard";

}



function setPageHash(
  pageId
){

  const nextHash =
  "#studio/" + pageId;

  if(
    window.location.hash !== nextHash
  ){

    window.location.hash =
    nextHash;

    return true;

  }

  return false;

}



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  if(
    studioPagesState.initialized
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

        page.initialize();

      }

    }
  );

  if(
    !studioPagesState.listening
  ){

    window.addEventListener(
      "hashchange",
      handleHashChange
    );

    studioPagesState.listening =
    true;

  }

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

  const nextPageId =
  nextPage?.id || "dashboard";

  if(
    studioPagesState.activePage &&
    studioPagesState.activePage !== nextPage &&
    typeof studioPagesState.activePage.unmount === "function"
  ){

    studioPagesState.activePage.unmount();

  }

  studioPagesState.workspace =
  workspace;

  studioPagesState.activePage =
  nextPage;

  studioPagesState.activePageId =
  nextPageId;

  if(
    nextPage &&
    typeof nextPage.mount === "function"
  ){

    await nextPage.mount(
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
// NAVIGATE
// =====================================

async function navigate(
  pageId = "dashboard"
){

  const page =
  getPage(
    pageId
  );

  const resolvedPageId =
  page?.id || "dashboard";

  const hashChanged =
  setPageHash(
    resolvedPageId
  );

  if(
    hashChanged
  ){

    return true;

  }

  return renderPage(
    resolvedPageId
  );

}



// =====================================
// HASH CHANGE
// =====================================

function handleHashChange(){

  const pageId =
  getPageFromHash();

  renderPage(
    pageId
  );

}



// =====================================
// RENDER FROM URL
// =====================================

async function renderFromURL(){

  const pageId =
  getPageFromHash();

  return renderPage(
    pageId
  );

}



// =====================================
// REFRESH ACTIVE PAGE
// =====================================

async function refresh(){

  const activePage =
  studioPagesState.activePage;

  if(
    activePage &&
    typeof activePage.refresh === "function"
  ){

    await activePage.refresh();

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

    studioPagesState.activePage.unmount();

  }

  studioPagesState.activePage =
  null;

  studioPagesState.activePageId =
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
    studioPagesState.activePageId,

    registeredPages:
    Object.keys(
      pages
    ),

    hash:
    window.location.hash

  };

}



// =====================================
// API
// =====================================

const StudioPages =
Object.freeze({

  initialize,

  getPageFromHash,

  renderPage,

  renderFromURL,

  navigate,

  refresh,

  unmount,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  getPageFromHash,

  renderPage,

  renderFromURL,

  navigate,

  refresh,

  unmount,

  snapshot,

  StudioPages

};

export default
StudioPages;
