// =====================================
// RIGO AI
// STUDIO SIDEBAR
// STATE
// =====================================

const SidebarState =
Object.seal({

  initialized:
  false,

  mounted:
  false,

  visible:
  true,

  collapsed:
  false,

  root:
  null,

  container:
  null,

  scroll:
  null,

  items:
  [],

  activeId:
  "dashboard",

  hoveredId:
  null,

  selectedIndex:
  0,

  width:
  84,

  version:
  1

});



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  if(
    SidebarState.initialized
  ){

    return true;

  }

  SidebarState.initialized =
  true;

  return true;

}



// =====================================
// ROOT
// =====================================

function setRoot(
  root
){

  SidebarState.root =
  root;

  return true;

}



function getRoot(){

  return SidebarState.root;

}



// =====================================
// CONTAINER
// =====================================

function setContainer(
  container
){

  SidebarState.container =
  container;

  return true;

}



function getContainer(){

  return SidebarState.container;

}



// =====================================
// ITEMS
// =====================================

function setItems(
  items
){

  SidebarState.items =
  Array.isArray(
    items
  )
  ? items
  : [];

  return true;

}



function getItems(){

  return SidebarState.items;

}



// =====================================
// ACTIVE
// =====================================

function setActive(
  id
){

  SidebarState.activeId =
  id;

  return true;

}



function getActive(){

  return SidebarState.activeId;

}



// =====================================
// HOVER
// =====================================

function setHovered(
  id
){

  SidebarState.hoveredId =
  id;

}



function getHovered(){

  return SidebarState.hoveredId;

}



// =====================================
// COLLAPSE
// =====================================

function collapse(){

  SidebarState.collapsed =
  true;

}



function expand(){

  SidebarState.collapsed =
  false;

}



function isCollapsed(){

  return SidebarState.collapsed;

}



// =====================================
// VISIBILITY
// =====================================

function show(){

  SidebarState.visible =
  true;

}



function hide(){

  SidebarState.visible =
  false;

}



function isVisible(){

  return SidebarState.visible;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    initialized:
    SidebarState.initialized,

    mounted:
    SidebarState.mounted,

    visible:
    SidebarState.visible,

    collapsed:
    SidebarState.collapsed,

    active:
    SidebarState.activeId,

    hovered:
    SidebarState.hoveredId,

    items:
    SidebarState.items.length,

    width:
    SidebarState.width,

    version:
    SidebarState.version

  };

}



// =====================================
// EXPORTS
// =====================================

export {

  SidebarState,

  initialize,

  setRoot,

  getRoot,

  setContainer,

  getContainer,

  setItems,

  getItems,

  setActive,

  getActive,

  setHovered,

  getHovered,

  collapse,

  expand,

  isCollapsed,

  show,

  hide,

  isVisible,

  snapshot

};

export default
SidebarState;
