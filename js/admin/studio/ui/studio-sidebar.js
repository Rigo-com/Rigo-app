// =====================================
// RIGO AI
// STUDIO SIDEBAR
// UI V2
// =====================================

import StudioPages
from "./studio-pages.js";



// =====================================
// ICONS
// =====================================

const SIDEBAR_ICONS =
Object.freeze({

  dashboard:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M3 10.7 12 3l9 7.7"
      ></path>

      <path
        d="M5.5 9.7V21h13V9.7"
      ></path>

      <path
        d="M9.2 21v-6.3h5.6V21"
      ></path>
    </svg>
  `,

  project:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M3 6.5h6l2 2H21v10.8A1.7 1.7 0 0 1 19.3 21H4.7A1.7 1.7 0 0 1 3 19.3Z"
      ></path>

      <path
        d="M3 8.5h18"
      ></path>
    </svg>
  `,

  system:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="13"
        rx="1.5"
      ></rect>

      <path
        d="M8 21h8"
      ></path>

      <path
        d="M12 17v4"
      ></path>
    </svg>
  `,

  agents:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="3.3"
      ></circle>

      <path
        d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z"
      ></path>
    </svg>
  `,

  architecture:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="m8.5 6-5 6 5 6"
      ></path>

      <path
        d="m15.5 6 5 6-5 6"
      ></path>

      <path
        d="m13.5 4-3 16"
      ></path>
    </svg>
  `,

  memory:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M9.5 4.5A3.5 3.5 0 0 0 6 8v.2A3.4 3.4 0 0 0 4 11.3 3.5 3.5 0 0 0 7.5 15H9v3.5"
      ></path>

      <path
        d="M14.5 4.5A3.5 3.5 0 0 1 18 8v.2a3.4 3.4 0 0 1 2 3.1 3.5 3.5 0 0 1-3.5 3.7H15v3.5"
      ></path>

      <path
        d="M9.5 4.5a2.7 2.7 0 0 1 5 0"
      ></path>

      <path
        d="M12 4v15"
      ></path>

      <path
        d="M8 9.5h4"
      ></path>

      <path
        d="M12 13.5h4"
      ></path>
    </svg>
  `,

  debug:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M8 9h8v7a4 4 0 0 1-8 0Z"
      ></path>

      <path
        d="M9 9V7a3 3 0 0 1 6 0v2"
      ></path>

      <path
        d="M4 13h4"
      ></path>

      <path
        d="M16 13h4"
      ></path>

      <path
        d="M5 8l3 2"
      ></path>

      <path
        d="m19 8-3 2"
      ></path>

      <path
        d="M5 18l3-2"
      ></path>

      <path
        d="m19 18-3-2"
      ></path>

      <path
        d="M12 10v10"
      ></path>
    </svg>
  `,

  extensions:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 21v-8"
      ></path>

      <path
        d="M12 15c-4.5 0-7-2.5-7-7 4.5 0 7 2.5 7 7Z"
      ></path>

      <path
        d="M12 12c0-5 2.5-8 7-9 0 5-2.5 8-7 9Z"
      ></path>

      <path
        d="M12 18c3.6 0 5.7-1.8 6.5-5.2-3.5-.2-5.7 1.5-6.5 5.2Z"
      ></path>
    </svg>
  `,

  settings:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="3.2"
      ></circle>

      <path
        d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z"
      ></path>
    </svg>
  `

});



// =====================================
// SIDEBAR ITEMS
// =====================================

const SIDEBAR_ITEMS =
Object.freeze([

  {
    id:
    "dashboard",

    icon:
    SIDEBAR_ICONS.dashboard,

    label:
    "Dashboard",

    color:
    "var(--rigo-primary)"
  },

  {
    id:
    "project",

    icon:
    SIDEBAR_ICONS.project,

    label:
    "Project",

    color:
    "var(--rigo-yellow)"
  },

  {
    id:
    "code",

    icon:
    SIDEBAR_ICONS.system,

    label:
    "System",

    color:
    "var(--rigo-blue)"
  },

  {
    id:
    "admin-agent",

    icon:
    SIDEBAR_ICONS.agents,

    label:
    "Agents",

    color:
    "var(--rigo-pink)"
  },

  {
    id:
    "architecture",

    icon:
    SIDEBAR_ICONS.architecture,

    label:
    "Code Map",

    color:
    "var(--rigo-primary)"
  },

  {
    id:
    "memory",

    icon:
    SIDEBAR_ICONS.memory,

    label:
    "Memory",

    color:
    "var(--rigo-purple)"
  },

  {
    id:
    "debug",

    icon:
    SIDEBAR_ICONS.debug,

    label:
    "Debug",

    color:
    "var(--rigo-red)"
  },

  {
    id:
    "git",

    icon:
    SIDEBAR_ICONS.extensions,

    label:
    "Extensions",

    color:
    "var(--rigo-lime)"
  },

  {
    id:
    "settings",

    icon:
    SIDEBAR_ICONS.settings,

    label:
    "Settings",

    color:
    "#b8c4d6"
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
        align-items:stretch;
        gap:2px;
        padding:8px;
        overflow-x:hidden;
        overflow-y:auto;
        border:1px solid rgba(94,126,163,.20);
        border-radius:14px;
        background:
          radial-gradient(
            circle at 50% 0%,
            rgba(0,230,157,.035),
            transparent 24%
          ),
          linear-gradient(
            180deg,
            rgba(7,18,34,.99),
            rgba(4,13,27,.99)
          );
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.018),
          0 12px 32px rgba(0,0,0,.20);
        scrollbar-width:thin;
        scrollbar-color:
          rgba(105,125,154,.34)
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
        background:rgba(105,125,154,.34);
      }

      .rigo-studio-sidebar-button{
        --sidebar-item-color:
        var(--rigo-text-secondary);

        position:relative;
        width:100%;
        min-height:70px;
        flex:1 1 70px;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:7px;
        padding:7px 4px;
        border:1px solid transparent;
        border-radius:12px;
        color:var(--rigo-text-secondary);
        background:transparent;
        font-family:var(--rigo-font);
        cursor:pointer;
        isolation:isolate;
        transition:
          color var(--rigo-transition-normal),
          background var(--rigo-transition-normal),
          border-color var(--rigo-transition-normal),
          box-shadow var(--rigo-transition-normal),
          transform var(--rigo-transition-fast);
      }

      .rigo-studio-sidebar-button:hover{
        color:var(--rigo-text);
        background:rgba(18,34,54,.66);
        border-color:rgba(115,145,180,.12);
        transform:translateY(-1px);
      }

      .rigo-studio-sidebar-button:focus-visible{
        outline:none;
        border-color:rgba(0,200,255,.50);
        box-shadow:
          0 0 0 2px
          rgba(0,200,255,.10);
      }

      .rigo-studio-sidebar-button[data-active="true"]{
        color:var(--rigo-primary);
        background:
          linear-gradient(
            180deg,
            rgba(0,230,157,.095),
            rgba(0,230,157,.055)
          );
        border-color:rgba(0,230,157,.15);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.025),
          0 8px 20px rgba(0,0,0,.12);
      }

      .rigo-studio-sidebar-button[data-active="true"]::before{
        content:"";
        position:absolute;
        top:12px;
        bottom:12px;
        left:-9px;
        width:4px;
        border-radius:0 999px 999px 0;
        background:var(--rigo-primary);
        box-shadow:
          0 0 12px
          var(--rigo-primary-glow);
      }

      .rigo-studio-sidebar-icon{
        width:34px;
        height:34px;
        min-width:34px;
        min-height:34px;
        display:flex;
        align-items:center;
        justify-content:center;
        color:var(--sidebar-item-color);
        filter:
          drop-shadow(
            0 0 7px
            color-mix(
              in srgb,
              var(--sidebar-item-color) 32%,
              transparent
            )
          );
        transition:
          color var(--rigo-transition-normal),
          filter var(--rigo-transition-normal),
          transform var(--rigo-transition-normal);
      }

      .rigo-studio-sidebar-icon svg{
        width:29px;
        height:29px;
        display:block;
        overflow:visible;
        fill:none;
        stroke:currentColor;
        stroke-width:1.9;
        stroke-linecap:round;
        stroke-linejoin:round;
      }

      .rigo-studio-sidebar-button[data-active="true"]
      .rigo-studio-sidebar-icon{
        color:var(--rigo-primary);
        filter:
          drop-shadow(
            0 0 8px
            rgba(0,230,157,.32)
          );
      }

      .rigo-studio-sidebar-button:hover
      .rigo-studio-sidebar-icon{
        transform:translateY(-1px);
      }

      .rigo-studio-sidebar-label{
        width:100%;
        overflow:hidden;
        color:var(--rigo-text-secondary);
        font-size:11px;
        line-height:1.1;
        font-weight:650;
        text-align:center;
        text-overflow:ellipsis;
        white-space:nowrap;
        transition:
          color var(--rigo-transition-normal);
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
        flex:0 0 1px;
        align-self:center;
        margin:5px 0;
        background:rgba(112,145,180,.14);
      }

      @media(max-height:820px){

        .rigo-studio-sidebar-shell{
          gap:1px;
          padding:7px;
        }

        .rigo-studio-sidebar-button{
          min-height:61px;
          flex-basis:61px;
          gap:5px;
          padding:5px 3px;
        }

        .rigo-studio-sidebar-icon{
          width:29px;
          height:29px;
          min-width:29px;
          min-height:29px;
        }

        .rigo-studio-sidebar-icon svg{
          width:25px;
          height:25px;
        }

        .rigo-studio-sidebar-label{
          font-size:10px;
        }

        .rigo-studio-sidebar-separator{
          margin:3px 0;
        }

      }

      @media(max-width:760px){

        .rigo-studio-sidebar-shell{
          padding:6px;
          border-radius:12px;
        }

        .rigo-studio-sidebar-button{
          min-height:58px;
          flex-basis:58px;
          gap:4px;
          padding:5px 2px;
        }

        .rigo-studio-sidebar-button[data-active="true"]::before{
          left:-7px;
          top:10px;
          bottom:10px;
        }

        .rigo-studio-sidebar-icon{
          width:27px;
          height:27px;
          min-width:27px;
          min-height:27px;
        }

        .rigo-studio-sidebar-icon svg{
          width:23px;
          height:23px;
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

  button.style.setProperty(
    "--sidebar-item-color",
    item.color
  );

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

  SIDEBAR_ICONS,

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
