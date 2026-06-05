// =====================================
// RIGO AI
// SIDEBAR RUNTIME
// SIDEBAR SYSTEM RUNTIME
// =====================================

import {
  SidebarState,
  SIDEBAR_CONFIG
}
from "./sidebar-state.js";

import {
  SidebarElements
}
from "./sidebar-elements.js";

import {
  SidebarActions
}
from "./sidebar-actions.js";

import {
  SidebarRenderer
}
from "./sidebar-renderer.js";

import {
  SIDEBAR_EVENTS,
  emit
}
from "./sidebar-events.js";



// =====================================
// MOBILE
// =====================================

function detectMobile(){

  return window.innerWidth <=

    SIDEBAR_CONFIG
    .MOBILE_BREAKPOINT;

}



// =====================================
// RESIZE
// =====================================

function handleResize(){

  SidebarState
  .setMobile(

    detectMobile()

  );

  SidebarRenderer
  .renderSidebar();

  return true;

}



// =====================================
// EVENTS
// =====================================

function bindEvents(){

  const toggleButton =

    SidebarElements
    .getElement(
      "toggleButton"
    );

  const closeButton =

    SidebarElements
    .getElement(
      "closeButton"
    );

  const overlay =

    SidebarElements
    .getElement(
      "overlay"
    );

  if(
    toggleButton
  ){

    toggleButton
    .addEventListener(

      "click",

      SidebarActions
      .toggle

    );

  }

  if(
    closeButton
  ){

    closeButton
    .addEventListener(

      "click",

      SidebarActions
      .close

    );

  }

  if(
    overlay
  ){

    overlay
    .addEventListener(

      "click",

      SidebarActions
      .close

    );

  }

  window.addEventListener(

    "resize",

    handleResize

  );

  return true;

}



// =====================================
// UNBIND
// =====================================

function unbindEvents(){

  window.removeEventListener(

    "resize",

    handleResize

  );

  return true;

}



// =====================================
// INITIALIZE
// =====================================

function initializeSidebar(){

  if(

    SidebarState
    .snapshot()
    .initialized

  ){

    return true;

  }

  SidebarState
  .setMobile(

    detectMobile()

  );

  SidebarState
  .setInitialized(
    true
  );

  bindEvents();

  SidebarRenderer
  .renderSidebar();

  emit(

    SIDEBAR_EVENTS
    .INITIALIZED

  );

  return true;

}



// =====================================
// REFRESH
// =====================================

function refreshSidebar(){

  SidebarRenderer
  .renderSidebar();

  return true;

}



// =====================================
// STATUS
// =====================================

function getSidebarStatus(){

  return Object.freeze({

    ...SidebarState
    .snapshot()

  });

}



// =====================================
// DESTROY
// =====================================

function destroySidebar(){

  unbindEvents();

  SidebarState
  .reset();

  emit(

    SIDEBAR_EVENTS
    .DESTROYED

  );

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const SidebarRuntime =
Object.freeze({

  initialize:
  initializeSidebar,

  refresh:
  refreshSidebar,

  status:
  getSidebarStatus,

  destroy:
  destroySidebar

});



// =====================================
// EXPORTS
// =====================================

export {

  initializeSidebar,

  refreshSidebar,

  getSidebarStatus,

  destroySidebar,

  SidebarRuntime

};

export default
SidebarRuntime;
