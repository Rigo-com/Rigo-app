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
    label:"System"
  },

  {
    id:"admin-agent",
    icon:"🧠",
    label:"Agents"
  },

  {
    id:"architecture",
    icon:"</>",
    label:"Code Map"
  },

  {
    id:"memory",
    icon:"🧠",
    label:"Memory"
  },

  {
    id:"debug",
    icon:"🐞",
    label:"Debug"
  },

  {
    id:"git",
    icon:"🌿",
    label:"Extensions"
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
    width:112px;
    min-height:78px;
    border:none;
    border-radius:14px;
    background:transparent;
    color:#f8fafc;
    cursor:pointer;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:8px;
    transition:.18s ease;
    font-family:inherit;
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
      font-size:30px;
      filter:drop-shadow(0 0 12px rgba(34,197,94,.16));
    `;

  }

  if(
    label
  ){

    label.style.cssText =
    `
      font-size:13px;
      line-height:1;
      font-weight:700;
      color:#f8fafc;
      max-width:104px;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    `;

  }

  button.addEventListener(
    "mouseenter",
    function(){

      if(
        button.dataset.active !== "true"
      ){

        button.style.background =
        "rgba(15,23,42,.9)";

      }

    }
  );

  button.addEventListener(
    "mouseleave",
    function(){

      if(
        button.dataset.active !== "true"
      ){

        button.style.background =
        "transparent";

      }

    }
  );

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

  button.dataset.active =
  isActive ? "true" : "false";

  const label =
  button.querySelector(
    ".rigo-studio-sidebar-label"
  );

  if(
    isActive
  ){

    button.style.background =
    "linear-gradient(180deg, rgba(16,185,129,.18), rgba(6,95,70,.14))";

    button.style.boxShadow =
    "inset 0 0 0 1px rgba(34,197,94,.16), 0 0 24px rgba(34,197,94,.08)";

    button.style.color =
    "#34d399";

    if(
      label
    ){

      label.style.color =
      "#34d399";

    }

    return true;

  }

  button.style.background =
  "transparent";

  button.style.boxShadow =
  "none";

  button.style.color =
  "#f8fafc";

  if(
    label
  ){

    label.style.color =
    "#f8fafc";

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
    width:150px;
    margin:0 0 0 16px;
    padding:14px 10px;
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:4px;
    background:linear-gradient(180deg, rgba(15,23,42,.92), rgba(2,8,23,.96));
    border:1px solid rgba(148,163,184,.14);
    border-radius:16px;
    overflow:auto;
    box-shadow:0 18px 50px rgba(0,0,0,.28);
  `;

  for(
    const item
    of SIDEBAR_ITEMS
  ){

    sidebar.appendChild(
      createSidebarButton(
        item
      )
    );

  }

  updateActiveSidebarItem();

  window.removeEventListener(
    "hashchange",
    updateActiveSidebarItem
  );

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
