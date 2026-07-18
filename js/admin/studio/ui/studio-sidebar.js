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
  variant = "outline"
){

  return `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      data-variant="${variant}"
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
  createIcon(
    `
      <path
        fill-rule="evenodd"
        d="
          M11.47 3.84
          a.75.75 0 0 1 1.06 0
          l8.25 8.25
          a.75.75 0 1 1-1.06 1.06
          l-.97-.97
          v7.07
          A1.75 1.75 0 0 1 17 21
          h-3.25
          a.75.75 0 0 1-.75-.75
          v-4.5
          h-2
          v4.5
          a.75.75 0 0 1-.75.75
          H7
          a1.75 1.75 0 0 1-1.75-1.75
          v-7.07
          l-.97.97
          a.75.75 0 1 1-1.06-1.06
          l8.25-8.25
          Z
        "
        clip-rule="evenodd"
      ></path>
    `,
    "solid"
  ),

  project:
  createIcon(`
    <path
      d="
        M2.75 7.75
        A2.25 2.25 0 0 1 5 5.5
        h3.25
        c.5 0 .97.2 1.32.55
        l1.13 1.13
        c.35.35.82.55 1.32.55
        H19
        a2.25 2.25 0 0 1 2.25 2.25
        v7.75
        A2.25 2.25 0 0 1 19 19.5
        H5
        a2.25 2.25 0 0 1-2.25-2.25
        v-9.5
        Z
      "
    ></path>

    <path d="M2.75 9.5h18.5"></path>
  `),

  system:
  createIcon(`
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
  createIcon(`
    <rect
      x="5"
      y="7"
      width="14"
      height="11"
      rx="3"
    ></rect>

    <path d="M12 3v4"></path>
    <path d="M9 12h.01"></path>
    <path d="M15 12h.01"></path>
    <path d="M9.5 15h5"></path>
    <path d="M3 11v3"></path>
    <path d="M21 11v3"></path>
  `),

  architecture:
  createIcon(`
    <path d="m8.5 4.5-6 7.5 6 7.5"></path>
    <path d="m15.5 4.5 6 7.5-6 7.5"></path>
    <path d="m14.5 3-5 18"></path>
  `),

  memory:
  createIcon(`
    <ellipse
      cx="12"
      cy="5.5"
      rx="7"
      ry="2.5"
    ></ellipse>

    <path
      d="
        M5 5.5
        v6
        c0 1.38 3.13 2.5 7 2.5
        s7-1.12 7-2.5
        v-6
      "
    ></path>

    <path
      d="
        M5 11.5
        v6
        c0 1.38 3.13 2.5 7 2.5
        s7-1.12 7-2.5
        v-6
      "
    ></path>
  `),

  debug:
  createIcon(`
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
  createIcon(`
    <path
      d="
        M8.25 3
        H5.5
        A2.5 2.5 0 0 0 3 5.5
        v3.25
        h1
        a2.25 2.25 0 1 1 0 4.5
        H3
        v3.25
        A2.5 2.5 0 0 0 5.5 19
        h3.25
        v-1
        a2.25 2.25 0 1 1 4.5 0
        v1
        h3.25
        a2.5 2.5 0 0 0 2.5-2.5
        v-3.25
        h1
        a2.25 2.25 0 1 0 0-4.5
        h-1
        V5.5
        A2.5 2.5 0 0 0 16.5 3
        h-3.25
        v1
        a2.25 2.25 0 1 1-4.5 0
        V3
        Z
      "
    ></path>
  `),

  settings:
  createIcon(`
    <path
      d="
        M9.59 3.17
        A1.5 1.5 0 0 1 11.06 2
        h1.88
        a1.5 1.5 0 0 1 1.47 1.17
        l.2.88
        c.09.4.35.73.7.93
        l.22.13
        c.35.2.77.24 1.15.11
        l.86-.3
        a1.5 1.5 0 0 1 1.77.62
        l.94 1.62
        a1.5 1.5 0 0 1-.3 1.86
        l-.67.59
        c-.31.27-.47.67-.47 1.08
        v.26
        c0 .41.16.81.47 1.08
        l.67.59
        a1.5 1.5 0 0 1 .3 1.86
        l-.94 1.62
        a1.5 1.5 0 0 1-1.77.62
        l-.86-.3
        c-.38-.13-.8-.09-1.15.11
        l-.22.13
        c-.35.2-.61.53-.7.93
        l-.2.88
        A1.5 1.5 0 0 1 12.94 22
        h-1.88
        a1.5 1.5 0 0 1-1.47-1.17
        l-.2-.88
        a1.42 1.42 0 0 0-.7-.93
        l-.22-.13
        a1.42 1.42 0 0 0-1.15-.11
        l-.86.3
        a1.5 1.5 0 0 1-1.77-.62
        l-.94-1.62
        a1.5 1.5 0 0 1 .3-1.86
        l.67-.59
        c.31-.27.47-.67.47-1.08
        v-.26
        c0-.41-.16-.81-.47-1.08
        l-.67-.59
        a1.5 1.5 0 0 1-.3-1.86
        l.94-1.62
        a1.5 1.5 0 0 1 1.77-.62
        l.86.3
        c.38.13.8.09 1.15-.11
        l.22-.13
        c.35-.2.61-.53.7-.93
        l.2-.88
        Z
      "
    ></path>

    <circle
      cx="12"
      cy="12"
      r="3"
    ></circle>
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
    color:"#aebbd0",
    placement:"bottom"
  }

]);



// =====================================
// STATE
// =====================================

const sidebarState =
Object.seal({

  root:null,

  listening:false

});



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
        display:flex;
        flex-direction:column;
        padding:5px;
        overflow:hidden;
        border:1px solid rgba(94,126,163,.2);
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
        display:flex;
        flex-direction:column;
      }

      .rigo-studio-sidebar-group[data-placement="bottom"]{
        margin-top:auto;
        padding-bottom:16px;
      }

      .rigo-studio-sidebar-button{
        --sidebar-color:
        var(--rigo-text-secondary);

        position:relative;
        width:100%;
        height:58px;
        min-height:58px;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:5px;
        padding:4px 2px;
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
        color:var(--rigo-primary);
        border-color:rgba(0,230,157,.16);
        background:
          linear-gradient(
            180deg,
            rgba(0,230,157,.105),
            rgba(0,230,157,.055)
          );
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
        width:26px;
        height:26px;
        flex:0 0 26px;
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
        width:26px;
        height:26px;
        display:block;
        overflow:visible;
      }

      .rigo-studio-sidebar-icon
      svg[data-variant="outline"]{
        fill:none;
        stroke:currentColor;
        stroke-width:1.9;
        stroke-linecap:round;
        stroke-linejoin:round;
      }

      .rigo-studio-sidebar-icon
      svg[data-variant="solid"]{
        fill:currentColor;
        stroke:none;
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
          height:52px;
          min-height:52px;
          gap:3px;
        }

        .rigo-studio-sidebar-button[data-active="true"]{
          height:59px;
          min-height:59px;
        }

        .rigo-studio-sidebar-icon,
        .rigo-studio-sidebar-icon svg{
          width:23px;
          height:23px;
        }

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

      StudioPages.navigate(
        item.id
      );

    }
  );

  return button;

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

function updateActiveSidebarItem(){

  if(
    !sidebarState.root
  ){

    return false;

  }

  const activePage =
  StudioPages.getPageFromHash();

  sidebarState.root
  .querySelectorAll(
    ".rigo-studio-sidebar-button"
  )
  .forEach(
    function(button){

      const isActive =
      button.dataset.page ===
      activePage;

      button.dataset.active =
      String(isActive);

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

    }
  );

  return true;

}



// =====================================
// LISTENERS
// =====================================

function attachHashListener(){

  if(
    sidebarState.listening
  ){

    return;

  }

  window.addEventListener(
    "hashchange",
    updateActiveSidebarItem
  );

  sidebarState.listening =
  true;

}



function detachHashListener(){

  if(
    !sidebarState.listening
  ){

    return;

  }

  window.removeEventListener(
    "hashchange",
    updateActiveSidebarItem
  );

  sidebarState.listening =
  false;

}



// =====================================
// RENDER
// =====================================

function renderSidebar(){

  const root =
  document.getElementById(
    "rigo-studio-sidebar"
  );

  if(
    !root
  ){

    return false;

  }

  root.innerHTML =
  `
    ${createSidebarStyles()}

    <nav
      class="rigo-studio-sidebar-shell"
      aria-label="Studio navigation"
    ></nav>
  `;

  const navigation =
  root.querySelector(
    ".rigo-studio-sidebar-shell"
  );

  const topGroup =
  createSidebarGroup(
    "top"
  );

  const bottomGroup =
  createSidebarGroup(
    "bottom"
  );

  SIDEBAR_ITEMS.forEach(
    function(item){

      const group =
      item.placement === "bottom"
      ? bottomGroup
      : topGroup;

      group.appendChild(
        createSidebarButton(
          item
        )
      );

      if(
        item.separatorAfter
      ){

        group.appendChild(
          createSeparator()
        );

      }

    }
  );

  navigation.append(
    topGroup,
    bottomGroup
  );

  sidebarState.root =
  root;

  attachHashListener();

  updateActiveSidebarItem();

  return true;

}



// =====================================
// UNMOUNT
// =====================================

function unmountSidebar(){

  detachHashListener();

  if(
    sidebarState.root
  ){

    sidebarState.root
    .replaceChildren();

  }

  sidebarState.root =
  null;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    mounted:
    Boolean(
      sidebarState.root
    ),

    activePage:
    StudioPages.getPageFromHash(),

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
// EXPORTS
// =====================================

export {

  ICONS,

  SIDEBAR_ITEMS,

  createSidebarStyles,

  createSidebarButton,

  updateActiveSidebarItem,

  renderSidebar,

  unmountSidebar,

  snapshot

};

export default
renderSidebar;
