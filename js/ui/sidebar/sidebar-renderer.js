// =====================================
// RIGO AI
// SIDEBAR RENDERER
// UI RENDERING LAYER
// =====================================

import {
  SidebarState
}
from "./sidebar-state.js";

import {
  SidebarElements
}
from "./sidebar-elements.js";



// =====================================
// CSS CLASSES
// =====================================

const SIDEBAR_CLASSES =
Object.freeze({

  OPEN:
  "sidebar-open",

  CLOSED:
  "sidebar-closed",

  COLLAPSED:
  "sidebar-collapsed",

  MOBILE:
  "sidebar-mobile"

});



// =====================================
// RENDER OPEN STATE
// =====================================

function renderOpenState(){

  const sidebar =

    SidebarElements
    .getElement(
      "sidebar"
    );

  if(
    !sidebar
  ){

    return false;

  }

  const snapshot =

    SidebarState
    .snapshot();

  sidebar.classList.toggle(

    SIDEBAR_CLASSES.OPEN,

    snapshot.open

  );

  sidebar.classList.toggle(

    SIDEBAR_CLASSES.CLOSED,

    !snapshot.open

  );

  return true;

}



// =====================================
// RENDER COLLAPSED
// =====================================

function renderCollapsedState(){

  const sidebar =

    SidebarElements
    .getElement(
      "sidebar"
    );

  if(
    !sidebar
  ){

    return false;

  }

  sidebar.classList.toggle(

    SIDEBAR_CLASSES.COLLAPSED,

    SidebarState
    .snapshot()
    .collapsed

  );

  return true;

}



// =====================================
// RENDER MOBILE
// =====================================

function renderMobileState(){

  const sidebar =

    SidebarElements
    .getElement(
      "sidebar"
    );

  if(
    !sidebar
  ){

    return false;

  }

  sidebar.classList.toggle(

    SIDEBAR_CLASSES.MOBILE,

    SidebarState
    .snapshot()
    .mobile

  );

  return true;

}



// =====================================
// RENDER ACTIVE ITEM
// =====================================

function renderActiveItem(){

  const navigation =

    SidebarElements
    .getElement(
      "navigation"
    );

  if(
    !navigation
  ){

    return false;

  }

  const activeItem =

    SidebarState
    .snapshot()
    .activeItem;

  navigation
  .querySelectorAll(
    "[data-sidebar-item]"
  )
  .forEach(item => {

    item.classList.toggle(

      "active",

      item.dataset
      .sidebarItem ===
      String(activeItem)

    );

  });

  return true;

}



// =====================================
// RENDER ALL
// =====================================

function renderSidebar(){

  SidebarState
  .setRendering(
    true
  );

  renderOpenState();

  renderCollapsedState();

  renderMobileState();

  renderActiveItem();

  SidebarState
  .setRendering(
    false
  );

  return true;

}



// =====================================
// FORCE RENDER
// =====================================

function forceRender(){

  return renderSidebar();

}



// =====================================
// PUBLIC API
// =====================================

const SidebarRenderer =
Object.freeze({

  renderOpenState,

  renderCollapsedState,

  renderMobileState,

  renderActiveItem,

  renderSidebar,

  forceRender

});



// =====================================
// EXPORTS
// =====================================

export {

  SIDEBAR_CLASSES,

  renderOpenState,

  renderCollapsedState,

  renderMobileState,

  renderActiveItem,

  renderSidebar,

  forceRender,

  SidebarRenderer

};

export default
SidebarRenderer;
