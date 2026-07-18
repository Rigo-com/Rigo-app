// =====================================
// RIGO AI
// STUDIO SIDEBAR
// UI V2
// =====================================

import StudioPages
from "./studio-pages.js";



// =====================================
// SVG FACTORIES
// =====================================

function createOutlineSvg(
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



function createSolidSvg(
  content
){

  return `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      class="rigo-studio-sidebar-solid-icon"
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
  createSolidSvg(`
    <path
      fill="currentColor"
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="
        M11.47 2.84
        a.75.75 0 0 1 1.06 0
        l8.25 8.25
        a.75.75 0 1 1-1.06 1.06
        l-.47-.47
        v7.57
        A1.75 1.75 0 0 1 17.5 21
        h-3.25
        a.75.75 0 0 1-.75-.75
        v-4.5
        h-3
        v4.5
        a.75.75 0 0 1-.75.75
        H6.5
        a1.75 1.75 0 0 1-1.75-1.75
        v-7.57
        l-.47.47
        a.75.75 0 0 1-1.06-1.06
        l8.25-8.25
        Z
      "
    ></path>
  `),

  project:
  createOutlineSvg(`
    <path
      d="
        M3.75 6.75
        A1.75 1.75 0 0 1 5.5 5
        h4.15
        c.47 0 .92.19 1.25.52
        l1.08 1.08
        c.33.33.78.52 1.25.52
        h5.27
        a1.75 1.75 0 0 1 1.75 1.75
        v8.88
        a1.75 1.75 0 0 1-1.75 1.75
        h-13
        a1.75 1.75 0 0 1-1.75-1.75
        V6.75
        Z
      "
    ></path>

    <path d="M3.75 9.25h16.5"></path>
  `),

  system:
  createOutlineSvg(`
    <rect
      x="3.25"
      y="4"
      width="17.5"
      height="12.5"
      rx="1.75"
    ></rect>

    <path d="M8.25 20h7.5"></path>
    <path d="M12 16.5V20"></path>
  `),

  agents:
  createOutlineSvg(`
    <rect
      x="5"
      y="7"
      width="14"
      height="11"
      rx="2.5"
    ></rect>

    <path d="M12 3.5V7"></path>
    <path d="M9 12h.01"></path>
    <path d="M15 12h.01"></path>
    <path d="M9.5 15h5"></path>
    <path d="M3 11v3"></path>
    <path d="M21 11v3"></path>
  `),

  architecture:
  createOutlineSvg(`
    <path d="m8.25 5.25-5.5 6.75 5.5 6.75"></path>
    <path d="m15.75 5.25 5.5 6.75-5.5 6.75"></path>
    <path d="m14.25 3.5-4.5 17"></path>
  `),

  memory:
  createOutlineSvg(`
    <ellipse
      cx="12"
      cy="5.25"
      rx="7"
      ry="2.75"
    ></ellipse>

    <path
      d="
        M5 5.25
        v6
        c0 1.52 3.13 2.75 7 2.75
        s7-1.23 7-2.75
        v-6
      "
    ></path>

    <path
      d="
        M5 11.25
        v6
        c0 1.52 3.13 2.75 7 2.75
        s7-1.23 7-2.75
        v-6
      "
    ></path>
  `),

  debug:
  createOutlineSvg(`
    <path
      d="
        M8 9
        h8
        v7
        a4 4 0 0 1-8 0
        V9
        Z
      "
    ></path>

    <path d="M9 9V7.5a3 3 0 0 1 6 0V9"></path>
    <path d="M4 12h4"></path>
    <path d="M16 12h4"></path>
    <path d="m5 7 3 2"></path>
    <path d="m19 7-3 2"></path>
    <path d="m5 19 3-2"></path>
    <path d="m19 19-3-2"></path>
    <path d="M12 9v11"></path>
  `),

  extensions:
  createOutlineSvg(`
    <path
      d="
        M8.5 3.5
        H5.75
        a2 2 0 0 0-2 2
        V8.5
        h.75
        a2.5 2.5 0 1 1 0 5
        h-.75
        v3
        a2 2 0 0 0 2 2
        h3
        v-.75
        a2.5 2.5 0 1 1 5 0
        v.75
        h3
        a2 2 0 0 0 2-2
        v-3
        h.75
        a2.5 2.5 0 1 0 0-5
        h-.75
        v-3
        a2 2 0 0 0-2-2
        h-3
        v.75
        a2.5 2.5 0 1 1-5 0
        V3.5
        Z
      "
    ></path>
  `),

  settings:
  createOutlineSvg(`
    <circle
      cx="12"
      cy="12"
      r="3"
    ></circle>

    <path
      d="
        M19.4 15
        a1.65 1.65 0 0 0 .33 1.82
        l.06.06
        a2 2 0 1 1-2.83 2.83
        l-.06-.06
        a1.65 1.65 0 0 0-1.82-.33
        a1.65 1.65 0 0 0-.98 1.52
        V21
        a2 2 0 1 1-4 0
        v-.16
        a1.65 1.65 0 0 0-.98-1.52
        a1.65 1.65 0 0 0-1.82.33
        l-.06.06
        a2 2 0 1 1-2.83-2.83
        l.06-.06
        A1.65 1.65 0 0 0 4.6 15
        a1.65 1.65 0 0 0-1.52-.98
        H3
        a2 2 0 1 1 0-4
        h.08
        A1.65 1.65 0 0 0 4.6 9.04
        a1.65 1.65 0 0 0-.33-1.82
        l-.06-.06
        a2 2 0 1 1 2.83-2.83
        l.06.06
        a1.65 1.65 0 0 0 1.82.33
        A1.65 1.65 0 0 0 9.9 3.2
        V3
        a2 2 0 1 1 4 0
        v.2
        a1.65 1.65 0 0 0 .98 1.52
        a1.65 1.65 0 0 0 1.82-.33
        l.06-.06
        a2 2 0 1 1 2.83 2.83
        l-.06.06
        a1.65 1.65 0 0 0-.33 1.82
        a1.65 1.65 0 0 0 1.52.98
        H21
        a2 2 0 1 1 0 4
        h-.08
        A1.65 1.65 0 0 0 19.4 15
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
    id:
    "dashboard",

    label:
    "Dashboard",

    icon:
    ICONS.dashboard,

    color:
    "var(--rigo-primary)"
  },

  {
    id:
    "project",

    label:
    "Project",

    icon:
    ICONS.project,

    color:
    "var(--rigo-yellow)"
  },

  {
    id:
    "code",

    label:
    "System",

    icon:
    ICONS.system,

    color:
    "var(--rigo-blue)"
  },

  {
    id:
    "admin-agent",

    label:
    "Agents",

    icon:
    ICONS.agents,

    color:
    "var(--rigo-pink)"
  },

  {
    id:
    "architecture",

    label:
    "Code Map",

    icon:
    ICONS.architecture,

    color:
    "var(--rigo-primary)"
  },

  {
    id:
    "memory",

    label:
    "Memory",

    icon:
    ICONS.memory,

    color:
    "var(--rigo-purple)",

    separatorAfter:
    true
  },

  {
    id:
    "debug",

    label:
    "Debug",

    icon:
    ICONS.debug,

    color:
    "var(--rigo-red)"
  },

  {
    id:
    "git",

    label:
    "Extensions",

    icon:
    ICONS.extensions,

    color:
    "var(--rigo-lime)"
  },

  {
    id:
    "settings",

    label:
    "Settings",

    icon:
    ICONS.settings,

    color:
    "#b7c2d3",

    placement:
    "bottom"
  }

]);



// =====================================
// STATE
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
        border-radius:
          0
          8px
          8px
          0;
        background:var(--rigo-primary);
        box-shadow:
          0 0 10px
          var(--rigo-primary-glow);
      }

      .rigo-studio-sidebar-icon{
        width:24px;
        height:24px;
        flex:0 0 24px;
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
        width:24px;
        height:24px;
        display:block;
        overflow:visible;
        fill:none;
        stroke:currentColor;
        stroke-width:1.9;
        stroke-linecap:round;
        stroke-linejoin:round;
      }

      .rigo-studio-sidebar-icon
      .rigo-studio-sidebar-solid-icon{
        fill:currentColor;
        stroke:none;
      }

      .rigo-studio-sidebar-button[data-page="dashboard"]
      .rigo-studio-sidebar-icon{
        width:28px;
        height:28px;
        flex-basis:28px;
      }

      .rigo-studio-sidebar-button[data-page="dashboard"]
      .rigo-studio-sidebar-icon svg{
        width:28px;
        height:28px;
      }

      .rigo-studio-sidebar-button[data-page="project"]
      .rigo-studio-sidebar-icon{
        width:26px;
        height:26px;
        flex-basis:26px;
      }

      .rigo-studio-sidebar-button[data-page="project"]
      .rigo-studio-sidebar-icon svg{
        width:26px;
        height:26px;
        stroke-width:1.9;
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
          width:21px;
          height:21px;
        }

        .rigo-studio-sidebar-icon{
          flex-basis:21px;
        }

        .rigo-studio-sidebar-button[data-page="dashboard"]
        .rigo-studio-sidebar-icon,
        .rigo-studio-sidebar-button[data-page="dashboard"]
        .rigo-studio-sidebar-icon svg{
          width:25px;
          height:25px;
        }

        .rigo-studio-sidebar-button[data-page="dashboard"]
        .rigo-studio-sidebar-icon{
          flex-basis:25px;
        }

        .rigo-studio-sidebar-button[data-page="project"]
        .rigo-studio-sidebar-icon,
        .rigo-studio-sidebar-button[data-page="project"]
        .rigo-studio-sidebar-icon svg{
          width:23px;
          height:23px;
        }

        .rigo-studio-sidebar-button[data-page="project"]
        .rigo-studio-sidebar-icon{
          flex-basis:23px;
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
