// =====================================
// RIGO AI
// STUDIO SIDEBAR
// =====================================

import SidebarItems
from "./sidebar-data.js";

import mountSidebarStyle
from "./sidebar-style.js";



const SidebarState =
Object.seal({

  root:
  null,

  active:
  "dashboard"

});



// =====================================
// CREATE ITEM
// =====================================

function createSidebarItem(
  item
){

  const wrapper =
  document.createElement(
    "div"
  );

  wrapper.className =
  "rigo-sidebar-item";



  const button =
  document.createElement(
    "button"
  );

  button.className =
  "rigo-sidebar-button";

  button.dataset.id =
  item.id;

  button.innerHTML =
  item.icon;



  const label =
  document.createElement(
    "div"
  );

  label.className =
  "rigo-sidebar-label";

  label.textContent =
  item.title;



  const tooltip =
  document.createElement(
    "div"
  );

  tooltip.className =
  "rigo-sidebar-tooltip";

  tooltip.textContent =
  item.title;



  button.onclick =
  () => {

    setActiveSidebarItem(
      item.id
    );

    if(
      item.route
    ){

      location.hash =
      item.route;

    }

  };



  wrapper.append(

    button,

    label,

    tooltip

  );



  return wrapper;

}



// =====================================
// ACTIVE
// =====================================

function setActiveSidebarItem(
  id
){

  SidebarState.active =
  id;

  if(
    !SidebarState.root
  ){

    return;

  }

  SidebarState.root

    .querySelectorAll(
      ".rigo-sidebar-button"
    )

    .forEach(

      button =>

        button.classList.toggle(

          "active",

          button.dataset.id ===
          id

        )

    );

}



// =====================================
// RENDER
// =====================================

function renderSidebar(){

  mountSidebarStyle();

  const sidebar =
  document.createElement(
    "aside"
  );

  sidebar.className =
  "rigo-sidebar";



  const scroll =
  document.createElement(
    "div"
  );

  scroll.className =
  "rigo-sidebar-scroll";



  SidebarItems.forEach(

    item =>

      scroll.appendChild(

        createSidebarItem(
          item
        )

      )

  );



  sidebar.appendChild(
    scroll
  );



  SidebarState.root =
  sidebar;



  setActiveSidebarItem(

    SidebarState.active

  );



  return sidebar;

}



// =====================================
// API
// =====================================

function mountSidebar(
  container
){

  const sidebar =
  renderSidebar();

  container.appendChild(
    sidebar
  );

  return sidebar;

}



function getActiveSidebarItem(){

  return SidebarState.active;

}



function snapshotSidebar(){

  return {

    active:
    SidebarState.active

  };

}



// =====================================
// EXPORTS
// =====================================

export {

  mountSidebar,

  renderSidebar,

  setActiveSidebarItem,

  getActiveSidebarItem,

  snapshotSidebar

};

export default {

  mountSidebar,

  renderSidebar,

  setActiveSidebarItem,

  getActiveSidebarItem,

  snapshotSidebar

};
