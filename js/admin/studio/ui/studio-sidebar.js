// =====================================
// RIGO AI
// STUDIO SIDEBAR
// UI V2
// =====================================

import StudioPages
from "./studio-pages.js";



// =====================================
// SVG
// =====================================

function createSvg(
  content
){

  return `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
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
createSvg(`
  <path
    d="
      M3.5 10.2
      12 3.6
      20.5 10.2
    "
  ></path>

  <path
    d="
      M5.8 9.4
      V20
      H18.2
      V9.4
    "
  ></path>

  <path
    d="
      M9.4 20
      V13.6
      H14.6
      V20
    "
  ></path>
`),

  project:
  createSvg(`
    <path
      d="
        M3.5 7.5
        h6
        l2 2
        h9
        v9.5
        h-17
        Z
      "
    ></path>
    <path d="M3.5 9.5h17"></path>
  `),

  system:
  createSvg(`
    <rect
      x="3"
      y="4"
      width="18"
      height="13"
      rx="2"
    ></rect>
    <path d="M8 21h8"></path>
    <path d="M12 17v4"></path>
  `),

  agents:
  createSvg(`
    <rect
      x="5"
      y="7"
      width="14"
      height="11"
      rx="3"
    ></rect>
    <path d="M9 12h.01"></path>
    <path d="M15 12h.01"></path>
    <path d="M9.5 15h5"></path>
    <path d="M12 3v4"></path>
    <path d="M8 3h8"></path>
  `),

  architecture:
  createSvg(`
    <path d="m8 5-5 7 5 7"></path>
    <path d="m16 5 5 7-5 7"></path>
    <path d="m14 3-4 18"></path>
  `),

  memory:
  createSvg(`
    <ellipse
      cx="12"
      cy="5"
      rx="7"
      ry="3"
    ></ellipse>
    <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5"></path>
    <path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"></path>
  `),

  debug:
  createSvg(`
    <path d="M8 9h8v7a4 4 0 0 1-8 0Z"></path>
    <path d="M9 9V7a3 3 0 0 1 6 0v2"></path>
    <path d="M4 12h4"></path>
    <path d="M16 12h4"></path>
    <path d="m5 7 3 2"></path>
    <path d="m19 7-3 2"></path>
    <path d="m5 19 3-2"></path>
    <path d="m19 19-3-2"></path>
    <path d="M12 9v11"></path>
  `),

  extensions:
  createSvg(`
    <path
      d="
        M8.5 3
        H5
        a2 2 0 0 0-2 2
        v3.5
        a2.5 2.5 0 1 1 0 5
        V17
        a2 2 0 0 0 2 2
        h3.5
        a2.5 2.5 0 1 1 5 0
        H17
        a2 2 0 0 0 2-2
        v-3.5
        a2.5 2.5 0 1 0 0-5
        V5
        a2 2 0 0 0-2-2
        h-3.5
        a2.5 2.5 0 1 1-5 0
        Z
      "
    ></path>
  `),

  settings:
  createSvg(`
    <circle
      cx="12"
      cy="12"
      r="3"
    ></circle>

    <path
      d="
        M19.4 15
        a1.7 1.7 0 0 0 .3 1.9
        l.1.1
        a2 2 0 0 1-2.8 2.8
        l-.1-.1
        a1.7 1.7 0 0 0-1.9-.3
        a1.7 1.7 0 0 0-1 1.6
        v.2
        a2 2 0 0 1-4 0
        V21
        a1.7 1.7 0 0 0-1-1.6
        a1.7 1.7 0 0 0-1.9.3
        l-.1.1
        A2 2 0 0 1 4.2 17
        l.1-.1
        a1.7 1.7 0 0 0 .3-1.9
        A1.7 1.7 0 0 0 3 14
        h-.2
        a2 2 0 0 1 0-4
        H3
        a1.7 1.7 0 0 0 1.6-1
        a1.7 1.7 0 0 0-.3-1.9
        l-.1-.1
        A2 2 0 0 1 7 4.2
        l.1.1
        a1.7 1.7 0 0 0 1.9.3
        A1.7 1.7 0 0 0 10 3
        v-.2
        a2 2 0 0 1 4 0
        V3
        a1.7 1.7 0 0 0 1 1.6
        a1.7 1.7 0 0 0 1.9-.3
        l.1-.1
        A2 2 0 0 1 19.8 7
        l-.1.1
        a1.7 1.7 0 0 0-.3 1.9
        A1.7 1.7 0 0 0 21 10
        h.2
        a2 2 0 0 1 0 4
        H21
        a1.7 1.7 0 0 0-1.6 1
        Z
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
    separatorAfter:true
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
    color:"#b7c2d3",
    placement:"bottom"
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
        min-width:0;
        min-height:0;
        display:flex;
        flex-direction:column;
        padding:5px;
        overflow:hidden;
        border:1px solid rgba(94,126,163,.20);
        border-radius:14px;
        background:
          linear-gradient(
            180deg,
            #071426 0%,
            #051020 100%
          );
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.018),
          0 10px 26px rgba(0,0,0,.18);
      }

      .rigo-studio-sidebar-group{
        width:100%;
        min-width:0;
        display:flex;
        flex-direction:column;
        align-items:stretch;
      }

      .rigo-studio-sidebar-group[data-placement="top"]{
        flex:0 0 auto;
      }

      .rigo-studio-sidebar-group[data-placement="bottom"]{
        flex:0 0 auto;
        margin-top:auto;
        padding-bottom:16px;
      }

      .rigo-studio-sidebar-button{
        --sidebar-color:
        var(--rigo-text-secondary);

        position:relative;
        width:100%;
        height:56px;
        min-height:56px;
        flex:0 0 56px;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:4px;
        padding:3px 2px;
        border:1px solid transparent;
        border-radius:9px;
        color:var(--rigo-text-secondary);
        background:transparent;
        font-family:var(--rigo-font);
        cursor:pointer;
        transition:
          color var(--rigo-transition-normal),
          background var(--rigo-transition-normal),
          border-color var(--rigo-transition-normal),
          box-shadow var(--rigo-transition-normal);
      }

      .rigo-studio-sidebar-button:hover{
        color:var(--rigo-text);
        border-color:rgba(148,163,184,.07);
        background:rgba(15,35,55,.56);
      }

      .rigo-studio-sidebar-button:focus-visible{
        outline:none;
        border-color:rgba(0,230,157,.38);
        box-shadow:
          0 0 0 2px rgba(0,230,157,.08);
      }

      .rigo-studio-sidebar-button[data-active="true"]{
        height:66px;
        min-height:66px;
        flex-basis:66px;
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
        top:13px;
        bottom:13px;
        left:-6px;
        width:4px;
        border-radius:0 8px 8px 0;
        background:var(--rigo-primary);
        box-shadow:
          0 0 10px
          var(--rigo-primary-glow);
      }

      .rigo-studio-sidebar-icon{
        width:22px;
        height:22px;
        flex:0 0 22px;
        display:flex;
        align-items:center;
        justify-content:center;
        color:var(--sidebar-color);
        filter:
          drop-shadow(
            0 0 4px
            color-mix(
              in srgb,
              var(--sidebar-color) 20%,
              transparent
            )
          );
      }

      .rigo-studio-sidebar-icon svg{
  width:22px;
  height:22px;
  display:block;
  overflow:visible;
  fill:none;
  stroke:currentColor;
  stroke-width:2;
  stroke-linecap:round;
  stroke-linejoin:round;
}

      .rigo-studio-sidebar-label{
        width:100%;
        overflow:visible;
        color:var(--rigo-text-secondary);
        font-size:10px;
        line-height:1.35;
        font-weight:600;
        text-align:center;
        white-space:nowrap;
      }

      .rigo-studio-sidebar-button:hover
      .rigo-studio-sidebar-label{
        color:var(--rigo-text);
      }

      .rigo-studio-sidebar-button[data-active="true"]
      .rigo-studio-sidebar-icon,
      .rigo-studio-sidebar-button[data-active="true"]
      .rigo-studio-sidebar-label{
        color:var(--rigo-primary);
      }

      .rigo-studio-sidebar-separator{
        width:68%;
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
          height:51px;
          min-height:51px;
          flex-basis:51px;
          gap:3px;
        }

        .rigo-studio-sidebar-button[data-active="true"]{
          height:59px;
          min-height:59px;
          flex-basis:59px;
        }

        .rigo-studio-sidebar-button[data-active="true"]::before{
          top:11px;
          bottom:11px;
        }

        .rigo-studio-sidebar-icon,
        .rigo-studio-sidebar-icon svg{
          width:20px;
          height:20px;
        }

        .rigo-studio-sidebar-icon{
          flex-basis:20px;
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
    function(){

      return StudioPages
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
// CREATE GROUP
// =====================================

function createSidebarGroup(
  placement
){

  const group =
  document.createElement(
    "div"
  );

  group.className =
  "rigo-studio-sidebar-group";

  group.dataset.placement =
  placement;

  return group;

}



// =====================================
// APPEND ITEM
// =====================================

function appendSidebarItem(
  container,
  item
){

  container.appendChild(
    createSidebarButton(
      item
    )
  );

  if(
    item.separatorAfter
  ){

    container.appendChild(
      createSeparator()
    );

  }

  return true;

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

  const topGroup =
  createSidebarGroup(
    "top"
  );

  const bottomGroup =
  createSidebarGroup(
    "bottom"
  );

  SIDEBAR_ITEMS
  .forEach(
    function(item){

      const targetGroup =
      item.placement === "bottom"
      ? bottomGroup
      : topGroup;

      appendSidebarItem(
        targetGroup,
        item
      );

    }
  );

  navigation.append(
    topGroup,
    bottomGroup
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

  const sidebar =
  studioSidebarState.sidebar;

  if(
    sidebar
  ){

    sidebar.replaceChildren();

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
          item.label,

          placement:
          item.placement ||
          "top"

        };

      }
    )

  };

}



// =====================================
// API
// =====================================

const StudioSidebar =
Object.freeze({

  render:
  renderSidebar,

  unmount:
  unmountSidebar,

  updateActive:
  updateActiveSidebarItem,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  ICONS,

  SIDEBAR_ITEMS,

  createSidebarStyles,

  createSidebarButton,

  createSeparator,

  createSidebarGroup,

  appendSidebarItem,

  markActiveButton,

  updateActiveSidebarItem,

  renderSidebar,

  unmountSidebar,

  snapshot,

  StudioSidebar

};

export default
renderSidebar;
