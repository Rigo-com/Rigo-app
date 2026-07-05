// =====================================
// RIGO AI
// STUDIO SIDEBAR
// =====================================

import StudioPages
from "./studio-pages.js";

const SIDEBAR_ITEMS = [

  {
    id:"dashboard",
    icon:"🏠",
    label:"Dashboard"
  },

  {
    id:"project",
    icon:"📁",
    label:"Project"
  },

  {
    id:"code",
    icon:"💻",
    label:"Code"
  },

  {
    id:"debug",
    icon:"🐞",
    label:"Debug"
  },

  {
    id:"architecture",
    icon:"🏗️",
    label:"Architecture"
  },

  {
    id:"git",
    icon:"🌿",
    label:"Git"
  },

  {
    id:"admin-agent",
    icon:"🧠",
    label:"Agent"
  },

  {
    id:"settings",
    icon:"⚙️",
    label:"Settings"
  }

];



function getActivePageId(){

  return StudioPages
  .getPageFromHash();

}



function createSidebarButton(
  item
){

  const button =
  document.createElement(
    "button"
  );

  button.dataset.page =
  item.id;

  button.title =
  item.label;

  button.innerHTML =
  `
    <span class="rigo-studio-sidebar-icon">
      ${item.icon}
    </span>

    <span class="rigo-studio-sidebar-label">
      ${item.label}
    </span>
  `;

  button.style.cssText =
  `
    width:64px;
    min-height:58px;
    border:none;
    border-radius:14px;
    background:#111827;
    color:#cbd5e1;
    cursor:pointer;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:4px;
    font-size:20px;
    transition:.2s;
  `;

  const icon =
  button.querySelector(
    ".rigo-studio-sidebar-icon"
  );

  const label =
  button.querySelector(
    ".rigo-studio-sidebar-label"
  );

  if(
    icon
  ){

    icon.style.cssText =
    `
      line-height:1;
      font-size:22px;
    `;

  }

  if(
    label
  ){

    label.style.cssText =
    `
      font-size:9px;
      line-height:1;
      color:#94a3b8;
      max-width:58px;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    `;

  }

  button.addEventListener(
    "click",
    function(){

      StudioPages
      .navigate(
        item.id
      );

    }
  );

  return button;

}



function markActiveButton(
  button,
  isActive
){

  if(
    isActive
  ){

    button.style.background =
    "#1d4ed8";

    button.style.color =
    "#ffffff";

    const label =
    button.querySelector(
      ".rigo-studio-sidebar-label"
    );

    if(
      label
    ){

      label.style.color =
      "#dbeafe";

    }

    return true;

  }

  button.style.background =
  "#111827";

  button.style.color =
  "#cbd5e1";

  const label =
  button.querySelector(
    ".rigo-studio-sidebar-label"
  );

  if(
    label
  ){

    label.style.color =
    "#94a3b8";

  }

  return true;

}



function updateActiveSidebarItem(){

  const sidebar =
  document.getElementById(
    "rigo-studio-sidebar"
  );

  if(
    !sidebar
  ){

    return false;

  }

  const activePageId =
  getActivePageId();

  const buttons =
  sidebar.querySelectorAll(
    "[data-page]"
  );

  buttons.forEach(
    function(button){

      markActiveButton(
        button,
        button.dataset.page === activePageId
      );

    }
  );

  return true;

}



function renderSidebar(){

  const sidebar =
  document.getElementById(
    "rigo-studio-sidebar"
  );

  if(
    !sidebar
  ){

    return false;

  }

  sidebar.innerHTML =
  "";

  sidebar.style.cssText =
  `
    width:86px;
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:10px;
    padding:12px 10px;
    background:#0f172a;
    border-right:1px solid #1f2937;
    overflow:auto;
  `;

  for(
    const item
    of SIDEBAR_ITEMS
  ){

    const button =
    createSidebarButton(
      item
    );

    sidebar.appendChild(
      button
    );

  }

  updateActiveSidebarItem();

  window.addEventListener(
    "hashchange",
    updateActiveSidebarItem
  );

  return true;

}



export {

  SIDEBAR_ITEMS,

  renderSidebar,

  updateActiveSidebarItem

};

export default
renderSidebar;
