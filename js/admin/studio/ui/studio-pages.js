// =====================================
// RIGO AI
// STUDIO PAGES ROUTER
// URL / HASH ONLY
// =====================================

import Workspace
from "../workspace/index.js";


// =====================================
// INTERNAL STATE
// =====================================

const studioPagesState =
Object.seal({

  initialized:false,

  activePageId:null,

  listening:false

});


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
// OPEN FROM HASH
// =====================================

async function openFromHash(){

  initialize();

  const pageId =
  getPageFromHash();

  studioPagesState.activePageId =
  pageId;

  return Workspace.open(
    pageId
  );
}


// =====================================
// NAVIGATE
// =====================================

async function navigate(
  pageId = "dashboard"
){

  initialize();

  const targetPageId =
  pageId || "dashboard";

  const hashChanged =
  setPageHash(
    targetPageId
  );

  if(
    hashChanged
  ){
    return true;
  }

  studioPagesState.activePageId =
  targetPageId;

  return Workspace.open(
    targetPageId
  );
}


// =====================================
// HASH CHANGE
// =====================================

function handleHashChange(){
  openFromHash();
}


// =====================================
// COMPATIBILITY ALIASES
// =====================================

async function renderFromURL(){
  return openFromHash();
}


async function renderPage(
  pageId = "dashboard"
){
  return navigate(
    pageId
  );
}


// =====================================
// REFRESH
// =====================================

async function refresh(){

  const pageId =
  studioPagesState.activePageId ||
  getPageFromHash();

  return Workspace.open(
    pageId
  );
}


// =====================================
// UNMOUNT
// =====================================

function unmount(){

  if(
    studioPagesState.listening
  ){

    window.removeEventListener(
      "hashchange",
      handleHashChange
    );

    studioPagesState.listening =
    false;

  }

  studioPagesState.activePageId =
  null;

  studioPagesState.initialized =
  false;

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

    hash:
    window.location.hash,

    workspace:
    Workspace.snapshot()

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

  openFromHash,

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

  openFromHash,

  navigate,

  refresh,

  unmount,

  snapshot,

  StudioPages

};

export default
StudioPages;
