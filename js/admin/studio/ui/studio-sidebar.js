// =====================================
// RIGO AI
// STUDIO SIDEBAR
// =====================================

import StudioPages
from "./studio-pages.js";



// =====================================
// SIDEBAR ITEMS
// =====================================

const SIDEBAR_ITEMS = [

  {
    id:"dashboard",
    icon:"⌂",
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
    icon:"⚙",
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
    icon:"⚙",
    label:"Settings"
  }

];



// =====================================
// ACTIVE PAGE
// =====================================

function getActivePageId(){

  return StudioPages
  .getPageFromHash();

}



// =====================================
// CREATE BUTTON
// =====================================

function createSidebarButton(
  item
){

  const button =
  document.createElement(
    "button"
  );

  button.type =
  "button";

  button.dataset.page =
  item.id;

  button.dataset.active =
  "false";

  button.title =
  item.label;

  button.setAttribute(
    "aria-label",
    item.label
  );

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
    width:104px;
    min-height:68px;
    flex:0 0 68px;
    padding:7px 5px;
    border:none;
    border-radius:12px;
    background:transparent;
    color:#f8fafc;
    cursor:pointer;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:6px;
    font-family:inherit;
    transition:
      background .16s ease,
      color .16s ease,
      box-shadow .16s ease,
      transform .16s ease;
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
      min-height:26px;
      display:flex;
      align-items:center;
      justify-content:center;
      color:inherit;
      font-size:25px;
      line-height:1;
      font-weight:800;
      filter:drop-shadow(
        0 0 9px
        rgba(34,197,94,.10)
      );
    `;

  }

  if(
    label
  ){

    label.style.cssText =
    `
      width:100%;
      overflow:hidden;
      color:#f8fafc;
      font-size:11px;
      line-height:1.1;
      font-weight:650;
      text-align:center;
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
        "rgba(15,23,42,.72)";

        button.style.transform =
        "translateY(-1px)";

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

      button.style.transform =
      "translateY(0)";

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



// =====================================
// ACTIVE BUTTON
// =====================================

function markActiveButton(
  button,
  isActive
){

  button.dataset.active =
  isActive
  ? "true"
  : "false";

  const icon =
  button.querySelector(
    ".rigo-studio-sidebar-icon"
  );

  const label =
  button.querySelector(
    ".rigo-studio-sidebar-label"
  );

  if(
    isActive
  ){

    button.style.background =
    `
      linear-gradient(
        180deg,
        rgba(16,185,129,.16),
        rgba(6,95,70,.11)
      )
    `;

    button.style.boxShadow =
    `
      inset 0 0 0 1px
      rgba(52,211,153,.14),
      0 9px 24px
      rgba(0,0,0,.14)
    `;

    button.style.color =
    "#34d399";

    if(
      icon
    ){

      icon.style.color =
      "#34d399";

      icon.style.filter =
      "drop-shadow(0 0 9px rgba(52,211,153,.24))";

    }

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
    icon
  ){

    icon.style.color =
    "#f8fafc";

    icon.style.filter =
    "drop-shadow(0 0 9px rgba(34,197,94,.08))";

  }

  if(
    label
  ){

    label.style.color =
    "#f8fafc";

  }

  return true;

}



// =====================================
// UPDATE ACTIVE ITEM
// =====================================

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



// =====================================
// RENDER
// =====================================

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
    width:124px;
    height:calc(100% - 8px);
    margin:0 0 8px 14px;
    padding:10px 8px;
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:2px;
    overflow-x:hidden;
    overflow-y:auto;
    border:1px solid rgba(148,163,184,.13);
    border-radius:14px;
    background:
      linear-gradient(
        180deg,
        rgba(15,23,42,.88),
        rgba(3,10,24,.94)
      );
    box-shadow:
      0 14px 38px
      rgba(0,0,0,.20);
    scrollbar-width:thin;
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



// =====================================
// EXPORTS
// =====================================

export {

  SIDEBAR_ITEMS,

  renderSidebar,

  updateActiveSidebarItem

};

export default
renderSidebar;
