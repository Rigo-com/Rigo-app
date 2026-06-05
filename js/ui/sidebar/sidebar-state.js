// =====================================
// RIGO AI
// SIDEBAR STATE
// FOUNDATION STATE LAYER
// =====================================



// =====================================
// SIDEBAR CONFIG
// =====================================

const SIDEBAR_CONFIG =
Object.freeze({

  MAX_ITEMS:
  500,

  ANIMATION_DURATION:
  250,

  MOBILE_BREAKPOINT:
  768,

  ENABLE_ANIMATIONS:true,

  ENABLE_GESTURES:true

});



// =====================================
// SIDEBAR STATE
// =====================================

const sidebarState =
Object.seal({

  initialized:false,

  destroyed:false,

  open:false,

  collapsed:false,

  loading:false,

  rendering:false,

  mobile:false,

  pinned:false,



  // ================================
  // ACTIVE
  // ================================

  activeView:null,

  activeItem:null,



  // ================================
  // DATA
  // ================================

  items:[],



  // ================================
  // DOM
  // ================================

  elements:
  new Map(),

  listeners:
  new Set(),



  // ================================
  // TIMESTAMPS
  // ================================

  initializedAt:null,

  destroyedAt:null,

  lastOpenedAt:null,

  lastClosedAt:null

});



// =====================================
// STATE FLAGS
// =====================================

function setInitialized(
  value
){

  sidebarState.initialized =
  Boolean(value);

  if(value){

    sidebarState.initializedAt =
    Date.now();

  }

}



function setDestroyed(
  value
){

  sidebarState.destroyed =
  Boolean(value);

  if(value){

    sidebarState.destroyedAt =
    Date.now();

  }

}



function setOpen(
  value
){

  sidebarState.open =
  Boolean(value);

  if(value){

    sidebarState.lastOpenedAt =
    Date.now();

  }

  else{

    sidebarState.lastClosedAt =
    Date.now();

  }

}



function setCollapsed(
  value
){

  sidebarState.collapsed =
  Boolean(value);

}



function setLoading(
  value
){

  sidebarState.loading =
  Boolean(value);

}



function setRendering(
  value
){

  sidebarState.rendering =
  Boolean(value);

}



function setMobile(
  value
){

  sidebarState.mobile =
  Boolean(value);

}



function setPinned(
  value
){

  sidebarState.pinned =
  Boolean(value);

}



// =====================================
// ACTIVE
// =====================================

function setActiveView(
  view
){

  sidebarState.activeView =
  view;

}



function setActiveItem(
  item
){

  sidebarState.activeItem =
  item;

}



// =====================================
// ITEMS
// =====================================

function setItems(
  items = []
){

  sidebarState.items =

    Array.isArray(
      items
    )

    ? [...items]

    : [];

  return true;

}



function getItems(){

  return [

    ...sidebarState
    .items

  ];

}



function clearItems(){

  sidebarState.items =
  [];

  return true;

}



// =====================================
// ELEMENTS
// =====================================

function setElement(
  key,
  element
){

  sidebarState
  .elements
  .set(

    key,

    element

  );

  return true;

}



function getElement(
  key
){

  return (

    sidebarState
    .elements
    .get(key)

    ??

    null

  );

}



function removeElement(
  key
){

  return sidebarState
  .elements
  .delete(
    key
  );

}



// =====================================
// SNAPSHOT
// =====================================

function getSidebarSnapshot(){

  return Object.freeze({

    initialized:
    sidebarState.initialized,

    destroyed:
    sidebarState.destroyed,

    open:
    sidebarState.open,

    collapsed:
    sidebarState.collapsed,

    loading:
    sidebarState.loading,

    rendering:
    sidebarState.rendering,

    mobile:
    sidebarState.mobile,

    pinned:
    sidebarState.pinned,

    activeView:
    sidebarState.activeView,

    items:
    sidebarState.items.length,

    elements:
    sidebarState.elements.size,

    listeners:
    sidebarState.listeners.size

  });

}



// =====================================
// RESET
// =====================================

function resetSidebarState(){

  sidebarState.initialized = false;
  sidebarState.destroyed = false;

  sidebarState.open = false;
  sidebarState.collapsed = false;
  sidebarState.loading = false;
  sidebarState.rendering = false;
  sidebarState.mobile = false;
  sidebarState.pinned = false;

  sidebarState.activeView = null;
  sidebarState.activeItem = null;

  sidebarState.items = [];

  sidebarState.elements.clear();
  sidebarState.listeners.clear();

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const SidebarState =
Object.freeze({

  setInitialized,
  setDestroyed,

  setOpen,
  setCollapsed,

  setLoading,
  setRendering,

  setMobile,
  setPinned,

  setActiveView,
  setActiveItem,

  setItems,
  getItems,
  clearItems,

  setElement,
  getElement,
  removeElement,

  snapshot:
  getSidebarSnapshot,

  reset:
  resetSidebarState

});



// =====================================
// EXPORTS
// =====================================

export {

  SIDEBAR_CONFIG,

  sidebarState,

  SidebarState

};

export default
SidebarState;
