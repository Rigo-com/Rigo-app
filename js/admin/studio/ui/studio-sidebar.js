// =====================================
// RIGO AI
// STUDIO SIDEBAR
// UI V2
// =====================================

import StudioPages
from "./studio-pages.js";



// =====================================
// ICON FACTORY
// =====================================

function createIcon(
  content,
  options = {}
){

  const {

    fill =
    "none",

    stroke =
    "currentColor",

    strokeWidth =
    2

  } = options;

  return `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="${fill}"
      stroke="${stroke}"
      stroke-width="${strokeWidth}"
      stroke-linecap="round"
      stroke-linejoin="round"
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
  createIcon(`
    <path d="M3 11.2 12 4l9 7.2"></path>
    <path d="M5.5 10v10h13V10"></path>
    <path d="M9.5 20v-6h5v6"></path>
  `),

  project:
  createIcon(`
    <path d="M3 7h7l2 2h9v10H3Z"></path>
    <path d="M3 9h18"></path>
  `),

  system:
  createIcon(`
    <rect x="3" y="4" width="18" height="13" rx="1.5"></rect>
    <path d="M8 21h8"></path>
    <path d="M12 17v4"></path>
  `),

  agents:
  createIcon(`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19 13.5v-3l-2-.5a7 7 0 0 0-.8-1.9l1.1-1.8-2.1-2.1-1.8 1.1a7 7 0 0 0-1.9-.8L11 2H8l-.5 2.5a7 7 0 0 0-1.9.8L3.8 4.2 1.7 6.3l1.1 1.8A7 7 0 0 0 2 10l-2 .5v3l2 .5a7 7 0 0 0 .8 1.9l-1.1 1.8 2.1 2.1 1.8-1.1a7 7 0 0 0 1.9.8L8 22h3l.5-2.5a7 7 0 0 0 1.9-.8l1.8 1.1 2.1-2.1-1.1-1.8A7 7 0 0 0 17 14Z"></path>
  `),

  architecture:
  createIcon(`
    <path d="m8 6-5 6 5 6"></path>
    <path d="m16 6 5 6-5 6"></path>
    <path d="m14 4-4 16"></path>
  `),

  memory:
  createIcon(`
    <path d="M9 5a4 4 0 0 0-4 4v1a4 4 0 0 0 1 7.9V19a2 2 0 0 0 2 2h2V5Z"></path>
    <path d="M15 5a4 4 0 0 1 4 4v1a4 4 0 0 1-1 7.9V19a2 2 0 0 1-2 2h-2V5Z"></path>
    <path d="M7 10h3"></path>
    <path d="M14 14h3"></path>
  `),

  debug:
  createIcon(`
    <path d="M8 9h8v7a4 4 0 0 1-8 0Z"></path>
    <path d="M9 9V7a3 3 0 0 1 6 0v2"></path>
    <path d="M4 12h4"></path>
    <path d="M16 12h4"></path>
    <path d="M5 7l3 2"></path>
    <path d="m19 7-3 2"></path>
    <path d="M5 18l3-2"></path>
    <path d="m19 18-3-2"></path>
  `),

  extensions:
  createIcon(`
    <path d="M12 21v-9"></path>
    <path d="M12 14C7 14 5 11 5 7c4 0 7 2 7 7Z"></path>
    <path d="M12 11c0-5 3-7 7-8 0 5-2 8-7 8Z"></path>
    <path d="M12 18c3.5 0 5.5-2 6-5-3.5 0-5.5 1.5-6 5Z"></path>
  `),

  settings:
  createIcon(`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19 13.5v-3l-2-.5a7 7 0 0 0-.8-1.9l1.1-1.8-2.1-2.1-1.8 1.1a7 7 0 0 0-1.9-.8L11 2H8l-.5 2.5a7 7 0 0 0-1.9.8L3.8 4.2 1.7 6.3l1.1 1.8A7 7 0 0 0 2 10l-2 .5v3l2 .5a7 7 0 0 0 .8 1.9l-1.1 1.8 2.1 2.1 1.8-1.1a7 7 0 0 0 1.9.8L8 22h3l.5-2.5a7 7 0 0 0 1.9-.8l1.8 1.1 2.1-2.1-1.1-1.8A7 7 0 0 0 17 14Z"></path>
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
    color:"#b8c5d7"
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
        padding:5px;
        overflow:hidden;
        border:1px solid var(--rigo-border);
        border-radius:14px;
        background:
          linear-gradient(
            180deg,
            rgba(7,18,34,.98),
            rgba(4,13,27,.99)
          );
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.02),
          0 12px 28px rgba(0,0,0,.18);
      }

      .rigo-studio-sidebar-button{
        --sidebar-color:
        var(--rigo-text-secondary);

        position:relative;
        width:100%;
        height:66px;
        min-height:66px;
        flex:1 1 66px;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:5px;
        padding:4px 2px;
        border:1px solid transparent;
        border-radius:11px;
        color:var(--rigo-text-secondary);
        background:transparent;
        font-family:var(--rigo-font);
        cursor:pointer;
        transition:
          background var(--rigo-transition-normal),
          border-color var(--rigo-transition-normal),
          color var(--rigo-transition-normal);
      }

      .rigo-studio-sidebar-button:hover{
        color:var(--rigo-text);
        background:rgba(17,33,54,.62);
        border-color:rgba(148,163,184,.08);
      }

      .rigo-studio-sidebar-button:focus-visible{
        outline:none;
        border-color:rgba(0,230,157,.42);
      }

      .rigo-studio-sidebar-button[data-active="true"]{
        height:76px;
        min-height:76px;
        flex-grow:1.1;
        color:var(--rigo-primary);
        border-color:rgba(0,230,157,.15);
        background:
          linear-gradient(
            180deg,
            rgba(0,230,157,.10),
            rgba(0,230,157,.055)
          );
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.025);
      }

      .rigo-studio-sidebar-button[data-active="true"]::before{
        content:"";
        position:absolute;
        top:13px;
        bottom:13px;
        left:-6px;
        width:4px;
        border-radius:0 999px 999px 0;
        background:var(--rigo-primary);
        box-shadow:
          0 0 10px var(--rigo-primary-glow);
      }

      .rigo-studio-sidebar-icon{
        width:30px;
        height:30px;
        display:flex;
        align-items:center;
        justify-content:center;
        color:var(--sidebar-color);
        filter:
          drop-shadow(
            0 0 5px
            color-mix(
              in srgb,
              var(--sidebar-color) 24%,
              transparent
            )
          );
      }

      .rigo-studio-sidebar-icon svg{
        width:27px;
        height:27px;
        display:block;
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
        font-weight:650;
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
        width:72%;
        height:1px;
        min-height:1px;
        align-self:center;
        margin:2px 0;
        background:rgba(148,163,184,.13);
      }

      @media(max-height:800px){

        .rigo-studio-sidebar-shell{
          padding:4px;
        }

        .rigo-studio-sidebar-button{
          height:57px;
          min-height:57px;
          flex-basis:57px;
          gap:3px;
        }

        .rigo-studio-sidebar-button[data-active="true"]{
          height:65px;
          min-height:65px;
        }

        .rigo-studio-sidebar-icon{
          width:27px;
          height:27px;
        }

        .rigo-studio-sidebar-icon svg{
          width:24px;
          height:24px;
        }

        .rigo-studio-sidebar-label{
          font-size:9px;
        }

      }

      @media(max-width:760px){

        .rigo-studio-sidebar-button{
          height:58px;
          min-height:58px;
          flex-basis:58px;
        }

        .rigo-studio-sidebar-button[data-active="true"]{
          height:66px;
          min-height:66px;
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
  String(
    isActive
  );

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

  sidebar
  .querySelectorAll(
    ".rigo-studio-sidebar-button"
  )
  .forEach(
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
