// =====================================
// RIGO AI
// SIDEBAR ACTIONS
// SIDEBAR OPERATIONS
// =====================================

import {
  SidebarState
}
from "./sidebar-state.js";

import {
  SIDEBAR_EVENTS,
  emit
}
from "./sidebar-events.js";



// =====================================
// OPEN
// =====================================

function openSidebar(){

  if(
    SidebarState
    .snapshot()
    .open
  ){

    return true;

  }

  SidebarState
  .setOpen(
    true
  );

  emit(

    SIDEBAR_EVENTS
    .OPENED

  );

  emit(

    SIDEBAR_EVENTS
    .TOGGLED,

    {
      open:true
    }

  );

  return true;

}



// =====================================
// CLOSE
// =====================================

function closeSidebar(){

  if(
    !SidebarState
    .snapshot()
    .open
  ){

    return true;

  }

  SidebarState
  .setOpen(
    false
  );

  emit(

    SIDEBAR_EVENTS
    .CLOSED

  );

  emit(

    SIDEBAR_EVENTS
    .TOGGLED,

    {
      open:false
    }

  );

  return true;

}



// =====================================
// TOGGLE
// =====================================

function toggleSidebar(){

  const isOpen =

    SidebarState
    .snapshot()
    .open;

  return isOpen

    ?

    closeSidebar()

    :

    openSidebar();

}



// =====================================
// COLLAPSE
// =====================================

function collapseSidebar(){

  SidebarState
  .setCollapsed(
    true
  );

  emit(

    SIDEBAR_EVENTS
    .COLLAPSED

  );

  return true;

}



// =====================================
// EXPAND
// =====================================

function expandSidebar(){

  SidebarState
  .setCollapsed(
    false
  );

  emit(

    SIDEBAR_EVENTS
    .EXPANDED

  );

  return true;

}



// =====================================
// SELECT ITEM
// =====================================

function selectSidebarItem(
  item
){

  SidebarState
  .setActiveItem(
    item
  );

  emit(

    SIDEBAR_EVENTS
    .ITEM_SELECTED,

    {
      item
    }

  );

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const SidebarActions =
Object.freeze({

  open:
  openSidebar,

  close:
  closeSidebar,

  toggle:
  toggleSidebar,

  collapse:
  collapseSidebar,

  expand:
  expandSidebar,

  select:
  selectSidebarItem

});



// =====================================
// EXPORTS
// =====================================

export {

  openSidebar,

  closeSidebar,

  toggleSidebar,

  collapseSidebar,

  expandSidebar,

  selectSidebarItem,

  SidebarActions

};

export default
SidebarActions;
