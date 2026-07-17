// =====================================
// RIGO AI
// STUDIO SIDEBAR
// UI V2
// =====================================

import StudioPages
from "./studio-pages.js";



// =====================================
// SVG ICON
// =====================================

function svg(
  content
){

  return `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      ${content}
    </svg>
  `;

}



// =====================================
// ICONS
// =====================================

const ICONS =
Object.freeze({

  dashboard:
  svg(`
    <path d="M3.5 10.5 12 3.8l8.5 6.7"></path>
    <path d="M5.7 9.7v10.5h12.6V9.7"></path>
    <path d="M9.5 20.2v-6h5v6"></path>
  `),

  project:
  svg(`
    <path d="M3 7.2h6.5l2 2H21v10.3H3Z"></path>
    <path d="M3 9.2h18"></path>
  `),

  system:
  svg(`
    <rect
      x="3"
      y="4"
      width="18"
      height="13"
      rx="1.5"
    ></rect>

    <path d="M8 21h8"></path>
    <path d="M12 17v4"></path>
  `),

  agents:
  svg(`
    <circle
      cx="12"
      cy="12"
      r="3.2"
    ></circle>

    <path
      d="
        M19.2 13.5v-3l-2-.5
        a6.7 6.7 0 0 0-.8-1.8
        l1.1-1.8-2.1-2.1-1.8 1.1
        a6.7 6.7 0 0 0-1.8-.8L11.3 2h-3l-.5 2
        a6.7 6.7 0 0 0-1.8.8L4.2 3.7 2.1 5.8l1.1 1.8
        a6.7 6.7 0 0 0-.8 1.8L0 10v3l2.4.5
        a6.7 6.7 0 0 0 .8 1.8l-1.1 1.8 2.1 2.1L6 18.1
        a6.7 6.7 0 0 0 1.8.8l.5 2.4h3l.5-2.4
        a6.7 6.7 0 0 0 1.8-.8l1.8 1.1 2.1-2.1-1.1-1.8
        a6.7 6.7 0 0 0 .8-1.8Z
      "
    ></path>
  `),

  architecture:
  svg(`
    <path d="m8.2 6-5 6 5 6"></path>
    <path d="m15.8 6 5 6-5 6"></path>
    <path d="m13.8 4-3.6 16"></path>
  `),

  memory:
  svg(`
    <path d="M10 5a4 4 0 0 0-4 4v1a4 4 0 0 0 1 7.8V19a2 2 0 0 0 2 2h1Z"></path>
    <path d="M14 5a4 4 0 0 1 4 4v1a4 4 0 0 1-1 7.8V19a2 2 0 0 1-2 2h-1Z"></path>
    <path d="M12 5v16"></path>
    <path d="M7.5 10H12"></path>
    <path d="M12 14h4.5"></path>
  `),

  debug:
  svg(`
    <path d="M8 9h8v7a4 4 0 0 1-8 0Z"></path>
    <path d="M9 9V7a3 3 0 0 1 6 0v2"></path>
    <path d="M4 12h4"></path>
    <path d="M16 12h4"></path>
    <path d="M5 7.5 8 9"></path>
    <path d="m19 7.5-3 1.5"></path>
    <path d="M5 18.5 8 17"></path>
    <path d="m19 18.5-3-1.5"></path>
    <path d="M12 10v10"></path>
  `),

  extensions:
  svg(`
    <path d="M12 21v-9"></path>
    <path d="M12 14c-4.7 0-7-2.7-7-7 4.5 0 7 2.4 7 7Z"></path>
    <path d="M12 11c0-4.8 2.7-7.4 7-8 0 4.7-2.4 7.4-7 8Z"></path>
    <path d="M12 18c3.5 0 5.5-1.8 6-5-3.4 0-5.5 1.6-6 5Z"></path>
  `),

  settings:
  svg(`
    <circle
      cx="12"
      cy="12"
      r="3.2"
    ></circle>

    <path
      d="
        M19.2 13.5v-3l-2-.5
        a6.7 6.7 0 0 0-.8-1.8
        l1.1-1.8-2.1-2.1-1.8 1.1
        a6.7 6.7 0 0 0-1.8-.8L11.3 2h-3l-.5 2
        a6.7 6.7 0 0 0-1.8.8L4.2 3.7 2.1 5.8l1.1 1.8
        a6.7 6.7 0 0 0-.8 1.8L0 10v3l2.4.5
        a6.7 6.7 0 0 0 .8 1.8l-1.1 1.8 2.1 2.1L6 18.1
        a6.7 6.7 0 0 0 1.8.8l.5 2.4h3l.5-2.4
        a6.7 6.7 0 0 0 1.8-.8l1.8 1.1 2.1-2.1-1.1-1.8
        a6.7 6.7 0 0 0 .8-1.8Z
      "
    ></path>
  `)

});



// =====================================
// SIDEBAR ITEMS
// =====================================

const SIDEBAR_ITEMS =
Object.freeze([

  {
    id:"dashboard",
    label:"Dashboard",
    icon:ICONS.dashboard,
    color:"var(--rigo-primary)"
  },

  {
    id:"project",
    label:"Project",
    icon:ICONS.project,
    color:"var(--rigo-yellow)"
  },

  {
    id:"code",
    label:"System",
    icon:ICONS.system,
    color:"var(--rigo-blue)"
  },

  {
    id:"admin-agent",
    label:"Agents",
    icon:ICONS.agents,
    color:"var(--rigo-pink)"
  },

  {
    id:"architecture",
    label:"Code Map",
    icon:ICONS.architecture,
    color:"var(--rigo-primary)"
  },

  {
    id:"memory",
    label:"Memory",
    icon:ICONS.memory,
    color:"var(--rigo-purple)",
    separator:true
  },

  {
    id:"debug",
    label:"Debug",
    icon:ICONS.debug,
    color:"var(--rigo-red)"
  },

  {
    id:"git",
    label:"Extensions",
    icon:ICONS.extensions,
    color:"var(--rigo-lime)"
  },

  {
    id:"settings",
    label:"Settings",
    icon:ICONS.settings,
    color:"#b7c2d3"
  }

]);



// =====================================
// STATE
// =====================================

const studioSidebarState =
Object.seal({

  mounted:false,

  sidebar:null,

  hashListenerAttached:false

});



// =====================================
// ACTIVE PAGE
// =====================================

function getActivePageId(){

  return StudioPages
  .getPageFromHash();

}



// =====================================
// STYLES
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
        min-height:0;
        display:flex;
        flex-direction:column;
        align-items:stretch;
        gap:0;
        padding:5px;
        overflow:hidden;
        border:1px solid rgba(94,126,163,.20);
        border-radius:14px;
        background:
          linear-gradient(
            180deg,
            #071426,
            #051020
          );
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.018),
          0 10px 26px rgba(0,0,0,.18);
      }

      .rigo-studio-sidebar-button{
        --sidebar-color:
        var(--rigo-text-secondary);

        position:relative;
        width:100%;
        height:61px;
        min-height:61px;
        flex:0 0 61px;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:4px;
        padding:4px 2px;
        border:1px solid transparent;
        border-radius:10px;
        color:var(--rigo-text-secondary);
        background:transparent;
        font-family:var(--rigo-font);
        cursor:pointer;
        transition:
          color var(--rigo-transition-normal),
          background var(--rigo-transition-normal),
          border-color var(--rigo-transition-normal);
      }

      .rigo-studio-sidebar-button:hover{
        color:var(--rigo-text);
        background:rgba(15,35,55,.56);
        border-color:rgba(148,163,184,.07);
      }

      .rigo-studio-sidebar-button:focus-visible{
        outline:none;
        border-color:rgba(0,230,157,.38);
      }

      .rigo-studio-sidebar-button[data-active="true"]{
        height:75px;
        min-height:75px;
        flex-basis:75px;
        color:var(--rigo-primary);
        border-color:rgba(0,230,157,.16);
        background:
          linear-gradient(
            180deg,
            rgba(0,230,157,.105),
            rgba(0,230,157,.055)
          );
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.025);
      }

      .rigo-studio-sidebar-button[data-active="true"]::before{
        content:"";
        position:absolute;
        top:15px;
        bottom:15px;
        left:-6px;
        width:4px;
        border-radius:0 8px 8px 0;
        background:var(--rigo-primary);
        box-shadow:
          0 0 10px var(--rigo-primary-glow);
      }

      .rigo-studio-sidebar-icon{
        width:29px;
        height:29px;
        flex:0 0 29px;
        display:flex;
        align-items:center;
        justify-content:center;
        color:var(--sidebar-color);
        filter:
          drop-shadow(
            0 0 5px
            color-mix(
              in srgb,
              var(--sidebar-color) 22%,
              transparent
            )
          );
      }

      .rigo-studio-sidebar-icon svg{
        width:27px;
        height:27px;
        display:block;
        overflow:visible;
        fill:none;
        stroke:currentColor;
        stroke-width:2;
        stroke-linecap:round;
        stroke-linejoin:round;
      }

      .rigo-studio-sidebar-button[data-active="true"]
      .rigo-studio-sidebar-icon{
        color:var(--rigo-primary);
      }

      .rigo-studio-sidebar-label{
        width:100%;
        overflow:hidden;
        color:var(--rigo-text-secondary);
        font-size:10px;
        line-height:1.1;
        font-weight:600;
        text-align:center;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .rigo-studio-sidebar-button:hover
      .rigo-studio-sidebar-label{
        color:var(--rigo-text);
      }

      .rigo-studio-sidebar-button[data-active="true"]
      .rigo-studio-sidebar-label{
        color:var(--rigo-primary);
      }

      .rigo-studio-sidebar-separator{
        width:70%;
        height:1px;
        min-height:1px;
        flex:0 0 1px;
        align-self:center;
        margin:4px 0;
        background:rgba(112,145,180,.14);
      }

      @media(max-height:760px){

        .rigo-studio-sidebar-shell{
          padding:4px;
        }

        .rigo-studio-sidebar-button{
          height:55px;
          min-height:55px;
          flex-basis:55px;
          gap:3px;
        }

        .rigo-studio-sidebar-button[data-active="true"]{
          height:66px;
          min-height:66px;
          flex-basis:66px;
        }

        .rigo-studio-sidebar-icon{
          width:26px;
          height:26px;
          flex-basis:26px;
        }

        .rigo-studio-sidebar-icon svg{
          width:24px;
          height:24px;
        }

        .rigo-studio-sidebar-label{
          font-size:9px;
        }

        .rigo-studio-sidebar-separator{
          margin:2px 0;
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

  button.style.setProperty(
    "--sidebar-color",
    item.color
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
// CREATE SEPARATOR
// =====================================

function createSeparator(){

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

  return separator;

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

  if(
    isActive
  ){

    button.setAttribute(
      "aria-current",
      "page"
    );

  }
  else{

    button.removeAttribute(
      "aria-current"
    );

  }

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
        item.separator
      ){

        navigation.appendChild(
          createSeparator()
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
    .replaceChildren();

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

          id:
          item.id,

          label:
          item.label

        };

      }
    )

  };

}



// =====================================
// EXPORTS
// =====================================

export {

  ICONS,

  SIDEBAR_ITEMS,

  createSidebarStyles,

  createSidebarButton,

  createSeparator,

  markActiveButton,

  updateActiveSidebarItem,

  renderSidebar,

  unmountSidebar,

  snapshot

};

export default
renderSidebar;
