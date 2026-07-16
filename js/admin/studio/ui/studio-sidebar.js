// =====================================
// RIGO AI
// STUDIO SIDEBAR
// UI V2
// =====================================

import StudioPages
from "./studio-pages.js";



// =====================================
// SIDEBAR ITEMS
// =====================================

const SIDEBAR_ITEMS =
Object.freeze([

  {
    id:
    "dashboard",

    icon:
    "⌂",

    label:
    "Dashboard"
  },

  {
    id:
    "project",

    icon:
    "📁",

    label:
    "Project"
  },

  {
    id:
    "code",

    icon:
    "⌨",

    label:
    "System"
  },

  {
    id:
    "admin-agent",

    icon:
    "⚙",

    label:
    "Agents"
  },

  {
    id:
    "architecture",

    icon:
    "</>",

    label:
    "Code Map"
  },

  {
    id:
    "memory",

    icon:
    "🧠",

    label:
    "Memory"
  },

  {
    id:
    "debug",

    icon:
    "🐞",

    label:
    "Debug"
  },

  {
    id:
    "git",

    icon:
    "⑂",

    label:
    "Extensions"
  },

  {
    id:
    "settings",

    icon:
    "⚙",

    label:
    "Settings"
  }

]);



// =====================================
// INTERNAL STATE
// =====================================

const studioSidebarState =
Object.seal({

  mounted:
  false,

  sidebar:
  null,

  hashListenerAttached:
  false

});



// =====================================
// ACTIVE PAGE
// =====================================

function getActivePageId(){

  return StudioPages
  .getPageFromHash();

}



// =====================================
// SIDEBAR STYLES
// =====================================

function createSidebarStyles(){

  return `
    <style id="rigo-studio-sidebar-styles">

      #rigo-studio-sidebar{
        min-width:0;
        min-height:0;
      }

      .rigo-studio-sidebar-shell{
        width:100%;
        height:100%;
        min-width:0;
        min-height:0;
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:2px;
        padding:8px 6px;
        overflow-x:hidden;
        overflow-y:auto;
        border:1px solid var(--rigo-border);
        border-radius:var(--rigo-radius-xl);
        background:
          linear-gradient(
            180deg,
            rgba(11,22,40,.96),
            rgba(4,12,27,.98)
          );
        box-shadow:var(--rigo-shadow-medium);
        scrollbar-width:thin;
        scrollbar-color:
          rgba(148,163,184,.20)
          transparent;
      }

      .rigo-studio-sidebar-shell::-webkit-scrollbar{
        width:4px;
      }

      .rigo-studio-sidebar-shell::-webkit-scrollbar-track{
        background:transparent;
      }

      .rigo-studio-sidebar-shell::-webkit-scrollbar-thumb{
        border-radius:999px;
        background:rgba(148,163,184,.20);
      }

      .rigo-studio-sidebar-button{
        position:relative;
        width:100%;
        min-height:60px;
        flex:0 0 60px;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:5px;
        padding:6px 4px;
        border:1px solid transparent;
        border-radius:var(--rigo-radius-lg);
        color:var(--rigo-text-secondary);
        background:transparent;
        font-family:var(--rigo-font);
        cursor:pointer;
        transition:
          color var(--rigo-transition-normal),
          background var(--rigo-transition-normal),
          border-color var(--rigo-transition-normal),
          box-shadow var(--rigo-transition-normal),
          transform var(--rigo-transition-fast);
      }

      .rigo-studio-sidebar-button:hover{
        color:var(--rigo-text);
        background:rgba(21,36,58,.58);
        border-color:rgba(148,163,184,.08);
        transform:translateY(-1px);
      }

      .rigo-studio-sidebar-button:focus-visible{
        outline:none;
        border-color:rgba(56,189,248,.55);
        box-shadow:
          0 0 0 2px
          rgba(56,189,248,.12);
      }

      .rigo-studio-sidebar-button[data-active="true"]{
        color:var(--rigo-primary);
        background:
          linear-gradient(
            180deg,
            rgba(34,197,94,.14),
            rgba(34,197,94,.07)
          );
        border-color:rgba(34,197,94,.16);
        box-shadow:
          inset 0 0 0 1px
          rgba(34,197,94,.04),
          0 7px 20px
          rgba(0,0,0,.14);
      }

      .rigo-studio-sidebar-button[data-active="true"]::before{
        content:"";
        position:absolute;
        top:10px;
        bottom:10px;
        left:0;
        width:3px;
        border-radius:0 999px 999px 0;
        background:var(--rigo-primary);
        box-shadow:
          0 0 10px
          var(--rigo-primary-glow);
      }

      .rigo-studio-sidebar-icon{
        min-height:24px;
        display:flex;
        align-items:center;
        justify-content:center;
        color:inherit;
        font-size:23px;
        line-height:1;
        font-weight:800;
        letter-spacing:-1px;
        filter:
          drop-shadow(
            0 0 7px
            rgba(255,255,255,.03)
          );
      }

      .rigo-studio-sidebar-button[data-page="architecture"]
      .rigo-studio-sidebar-icon{
        font-size:15px;
        letter-spacing:-1.5px;
      }

      .rigo-studio-sidebar-button[data-page="git"]
      .rigo-studio-sidebar-icon{
        font-size:26px;
      }

      .rigo-studio-sidebar-label{
        width:100%;
        overflow:hidden;
        color:inherit;
        font-size:10px;
        line-height:1.1;
        font-weight:650;
        text-align:center;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .rigo-studio-sidebar-separator{
        width:72%;
        height:1px;
        flex:0 0 1px;
        margin:3px 0;
        background:rgba(148,163,184,.10);
      }

      @media(max-width:760px){

        .rigo-studio-sidebar-shell{
          padding:7px 5px;
          border-radius:var(--rigo-radius-lg);
        }

        .rigo-studio-sidebar-button{
          min-height:56px;
          flex-basis:56px;
          gap:4px;
        }

        .rigo-studio-sidebar-icon{
          font-size:21px;
        }

        .rigo-studio-sidebar-label{
          font-size:9px;
        }

      }

    </style>
  `;

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

  button.className =
  "rigo-studio-sidebar-button";

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

  button.addEventListener(
    "click",
    async function(){

      await StudioPages
      .navigate(
        item.id
      );

    }
  );

  return button;

}



// =====================================
// ACTIVE STATE
// =====================================

function markActiveButton(
  button,
  isActive
){

  if(
    !button
  ){

    return false;

  }

  button.dataset.active =
  isActive
  ? "true"
  : "false";

  button.setAttribute(
    "aria-current",
    isActive
    ? "page"
    : "false"
  );

  return true;

}



// =====================================
// UPDATE ACTIVE ITEM
// =====================================

function updateActiveSidebarItem(){

  const sidebar =
  studioSidebarState.sidebar ||
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
    ".rigo-studio-sidebar-button"
  );

  buttons.forEach(
    function(button){

      markActiveButton(
        button,
        button.dataset.page ===
        activePageId
      );

    }
  );

  return true;

}



// =====================================
// HASH LISTENER
// =====================================

function attachHashListener(){

  if(
    studioSidebarState
    .hashListenerAttached
  ){

    return true;

  }

  window.addEventListener(
    "hashchange",
    updateActiveSidebarItem
  );

  studioSidebarState
  .hashListenerAttached =
  true;

  return true;

}



function detachHashListener(){

  if(
    !studioSidebarState
    .hashListenerAttached
  ){

    return true;

  }

  window.removeEventListener(
    "hashchange",
    updateActiveSidebarItem
  );

  studioSidebarState
  .hashListenerAttached =
  false;

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

  studioSidebarState.sidebar =
  sidebar;

  sidebar.innerHTML =
  `
    ${createSidebarStyles()}

    <nav
      class="rigo-studio-sidebar-shell"
      aria-label="Studio navigation"
    ></nav>
  `;

  const navigation =
  sidebar.querySelector(
    ".rigo-studio-sidebar-shell"
  );

  if(
    !navigation
  ){

    return false;

  }

  SIDEBAR_ITEMS
  .forEach(
    function(item){

      navigation.appendChild(
        createSidebarButton(
          item
        )
      );

      if(
        item.id === "memory"
      ){

        const separator =
        document.createElement(
          "div"
        );

        separator.className =
        "rigo-studio-sidebar-separator";

        separator.setAttribute(
          "aria-hidden",
          "true"
        );

        navigation.appendChild(
          separator
        );

      }

    }
  );

  attachHashListener();

  updateActiveSidebarItem();

  studioSidebarState.mounted =
  true;

  return true;

}



// =====================================
// UNMOUNT
// =====================================

function unmountSidebar(){

  detachHashListener();

  if(
    studioSidebarState.sidebar
  ){

    studioSidebarState
    .sidebar
    .innerHTML =
    "";

  }

  studioSidebarState.sidebar =
  null;

  studioSidebarState.mounted =
  false;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    mounted:
    studioSidebarState.mounted,

    activePage:
    getActivePageId(),

    items:
    SIDEBAR_ITEMS.map(
      function(item){

        return {
          id:item.id,
          label:item.label
        };

      }
    )

  };

}



// =====================================
// EXPORTS
// =====================================

export {

  SIDEBAR_ITEMS,

  createSidebarStyles,

  createSidebarButton,

  markActiveButton,

  updateActiveSidebarItem,

  renderSidebar,

  unmountSidebar,

  snapshot

};

export default
renderSidebar;
