// =====================================
// RIGO AI
// STUDIO SIDEBAR
// UI V2
// =====================================

import StudioPages
from "./studio-pages.js";



// =====================================
// ICON HELPERS
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



function createPathIcon(
  paths,
  variant = "outline"
){

  const content =
  paths
  .map(
    function(path){

      return `
        <path d="${path}"></path>
      `;

    }
  )
  .join("");

  return createIcon(
    content,
    variant
  );

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
        clip-rule="evenodd"
        d="
          M3.25 11.35
          12 3.5
          l8.75 7.85
          v8.15
          a1.5 1.5 0 0 1-1.5 1.5
          H14.5
          v-6
          h-5
          v6
          H4.75
          a1.5 1.5 0 0 1-1.5-1.5
          v-8.15
          Z
        "
      ></path>
    `,
    "solid"
  ),

  project:
  createPathIcon([
    "M3 8.5V7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.5Z",
    "M3 9h18"
  ]),

  system:
  createPathIcon([
    "M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
    "M8 22h8",
    "M12 18v4"
  ]),

  agents:
  createPathIcon([
    "M7 8h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Z",
    "M12 4v4",
    "M9 13h.01",
    "M15 13h.01",
    "M9.5 16h5",
    "M2 12v4",
    "M22 12v4"
  ]),

  architecture:
  createPathIcon([
    "m8 5-6 7 6 7",
    "m16 5 6 7-6 7",
    "m14.5 3-5 18"
  ]),

  memory:
  createIcon(`
    <path
      d="
        M12 3
        a7 7 0 0 0-7 7
        v4
        a7 7 0 0 0 7 7
        h1
        a3 3 0 0 0 3-3
        4 4 0 0 0 3-3.87
        A6 6 0 0 0 12 3
        Z
      "
    ></path>

    <path d="M8 8.5a2.5 2.5 0 0 1 4-2"></path>
    <path d="M7.5 13a3 3 0 0 0 4.5 2.6"></path>
    <path d="M12 6v12"></path>
    <path d="M12 9a3 3 0 0 0 4.5 2.6"></path>
    <path d="M12 14a3 3 0 0 1 4 3"></path>
  `),

  debug:
  createPathIcon([
    "M8 9h8v7a4 4 0 0 1-8 0V9Z",
    "M9 9V7.5a3 3 0 0 1 6 0V9",
    "M4 12h4",
    "M16 12h4",
    "m5 7 3 2",
    "m19 7-3 2",
    "m5 19 3-2",
    "m19 19-3-2",
    "M12 9v11"
  ]),

  extensions:
  createPathIcon([
    "M8 3v3a2 2 0 1 0 4 0V3h4a2 2 0 0 1 2 2v4h1a2 2 0 1 1 0 4h-1v4a2 2 0 0 1-2 2h-4v-1a2 2 0 1 0-4 0v1H4a2 2 0 0 1-2-2v-4h1a2 2 0 1 0 0-4H2V5a2 2 0 0 1 2-2h4Z"
  ]),

  settings:
  createIcon(`
    <path
      d="
        M10.33 3.23
        a1.75 1.75 0 0 1 3.34 0
        l.2.7
        a1.75 1.75 0 0 0 2.45 1.06
        l.66-.34
        a1.75 1.75 0 0 1 2.29.7
        l.4.69
        a1.75 1.75 0 0 1-.4 2.24
        l-.57.48
        a1.75 1.75 0 0 0 0 2.68
        l.57.48
        a1.75 1.75 0 0 1 .4 2.24
        l-.4.69
        a1.75 1.75 0 0 1-2.29.7
        l-.66-.34
        a1.75 1.75 0 0 0-2.45 1.06
        l-.2.7
        a1.75 1.75 0 0 1-3.34 0
        l-.2-.7
        a1.75 1.75 0 0 0-2.45-1.06
        l-.66.34
        a1.75 1.75 0 0 1-2.29-.7
        l-.4-.69
        a1.75 1.75 0 0 1 .4-2.24
        l.57-.48
        a1.75 1.75 0 0 0 0-2.68
        l-.57-.48
        a1.75 1.75 0 0 1-.4-2.24
        l.4-.69
        a1.75 1.75 0 0 1 2.29-.7
        l.66.34
        a1.75 1.75 0 0 0 2.45-1.06
        l.2-.7
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
// SIDEBAR CONFIGURATION
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
    color:"var(--rigo-yellow)"
  },

  {
    id:"memory",
    label:"Memory",
    icon:ICONS.memory,
    color:"var(--rigo-purple)"
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
    bottom:true
  }

]);



// =====================================
// STATE
// =====================================

const sidebarState =
Object.seal({

  root:null,

  navigation:null,

  mobileNavigation:null,

  mobileSheet:null,

  menuButton:null,

  globalDrawer:null,

  globalBackdrop:null,

  topbarMenu:null,

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

      .rigo-studio-sidebar{
        width:100%;
        height:100%;
        display:flex;
        flex-direction:column;
        padding:6px;
        overflow:hidden;
        border:1px solid rgba(94,126,163,.2);
        border-radius:14px;
        background:
          radial-gradient(
            circle at 50% 0%,
            rgba(25,46,68,.18),
            transparent 42%
          ),
          linear-gradient(
            180deg,
            #071426,
            #051020
          );
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.018),
          0 10px 26px rgba(0,0,0,.18);
      }

      .rigo-studio-sidebar-list{
        width:100%;
        display:flex;
        flex-direction:column;
        gap:1px;
      }

      .rigo-studio-sidebar-list[data-position="bottom"]{
        margin-top:auto;
        padding-bottom:14px;
      }

      .rigo-studio-sidebar-item{
        --sidebar-color:
        var(--rigo-text-secondary);

        position:relative;
        width:100%;
        min-height:58px;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:5px;
        padding:5px 2px;
        border:1px solid transparent;
        border-radius:10px;
        color:var(--rigo-text-secondary);
        background:transparent;
        font-family:var(--rigo-font);
        cursor:pointer;
        transition:
          color var(--rigo-transition-normal),
          background var(--rigo-transition-normal),
          border-color var(--rigo-transition-normal),
          transform var(--rigo-transition-normal);
      }

      .rigo-studio-sidebar-item:hover{
        color:var(--rigo-text);
        border-color:rgba(148,163,184,.08);
        background:rgba(15,35,55,.56);
        transform:translateY(-1px);
      }

      .rigo-studio-sidebar-item:focus-visible{
        outline:none;
        border-color:rgba(0,230,157,.38);
        box-shadow:
          0 0 0 2px rgba(0,230,157,.08);
      }

      .rigo-studio-sidebar-item[data-active="true"]{
        min-height:66px;
        color:var(--rigo-primary);
        border-color:rgba(0,230,157,.16);
        background:
          linear-gradient(
            145deg,
            rgba(8,40,43,.94),
            rgba(8,31,39,.88)
          );
      }

      .rigo-studio-sidebar-item[data-active="true"]::before{
        content:"";
        position:absolute;
        top:13px;
        bottom:13px;
        left:-7px;
        width:4px;
        border-radius:0 8px 8px 0;
        background:var(--rigo-primary);
        box-shadow:
          0 0 10px
          var(--rigo-primary-glow);
      }

      .rigo-studio-sidebar-icon{
        width:28px;
        height:28px;
        flex:0 0 28px;
        display:grid;
        place-items:center;
        color:var(--sidebar-color);
        filter:
          drop-shadow(
            0 3px 4px
            rgba(0,0,0,.32)
          );
      }

      .rigo-studio-sidebar-icon svg{
        width:100%;
        height:100%;
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
        overflow:hidden;
        color:var(--rigo-text-secondary);
        font-size:10px;
        line-height:1.25;
        font-weight:600;
        text-align:center;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .rigo-studio-sidebar-item:hover
      .rigo-studio-sidebar-label{
        color:var(--rigo-text);
      }

      .rigo-studio-sidebar-item[data-active="true"]
      .rigo-studio-sidebar-icon,
      .rigo-studio-sidebar-item[data-active="true"]
      .rigo-studio-sidebar-label{
        color:var(--rigo-primary);
      }

      .rigo-studio-mobile-nav,
      .rigo-studio-mobile-sheet,
      .rigo-global-drawer,
      .rigo-global-drawer-backdrop{
        display:none;
      }

      .rigo-global-drawer-backdrop{
        position:fixed;
        z-index:110;
        inset:0;
        display:block;
        border:0;
        background:rgba(0,0,0,.62);
        opacity:0;
        visibility:hidden;
        transition:opacity 180ms ease,visibility 180ms ease;
      }

      .rigo-global-drawer-backdrop[data-open="true"]{
        opacity:1;
        visibility:visible;
      }

      .rigo-global-drawer{
        position:fixed;
        z-index:120;
        inset:0 auto 0 0;
        width:min(86vw,340px);
        display:flex;
        flex-direction:column;
        gap:6px;
        padding:max(18px,env(safe-area-inset-top)) 14px max(18px,env(safe-area-inset-bottom));
        border-right:1px solid rgba(94,126,163,.28);
        background:linear-gradient(180deg,#0a1423,#060d18);
        box-shadow:24px 0 70px rgba(0,0,0,.5);
        transform:translateX(-104%);
        visibility:hidden;
        transition:transform 200ms ease,visibility 200ms ease;
      }

      .rigo-global-drawer[data-open="true"]{
        transform:translateX(0);
        visibility:visible;
      }

      .rigo-global-drawer-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        margin-bottom:10px;
        padding:2px 2px 12px;
        border-bottom:1px solid rgba(94,126,163,.16);
      }

      .rigo-global-drawer-brand{
        display:flex;
        align-items:center;
        gap:10px;
        color:#f8fafc;
        font-size:16px;
        font-weight:800;
      }

      .rigo-global-drawer-brand span:first-child{
        width:34px;
        height:34px;
        display:grid;
        place-items:center;
        border-radius:50%;
        color:#031319;
        background:linear-gradient(145deg,#15f3a2,#00b975);
        font-weight:950;
      }

      .rigo-global-drawer-close{
        width:42px;
        height:42px;
        border:0;
        border-radius:12px;
        color:#e2e8f0;
        background:rgba(21,34,51,.8);
        font-size:25px;
      }

      .rigo-global-drawer-link{
        min-height:50px;
        display:flex;
        align-items:center;
        gap:12px;
        padding:0 14px;
        border:1px solid transparent;
        border-radius:12px;
        color:#e2e8f0;
        background:transparent;
        font-size:14px;
        font-weight:650;
        text-decoration:none;
      }

      .rigo-global-drawer-link:hover,
      .rigo-global-drawer-link[aria-current="page"]{
        border-color:rgba(0,230,157,.16);
        background:rgba(0,230,157,.08);
      }

      .rigo-global-drawer-link span{
        width:25px;
        color:var(--rigo-primary);
        font-size:20px;
        text-align:center;
      }

      .rigo-global-drawer-note{
        margin-top:auto;
        padding:12px;
        color:#75869b;
        font-size:11px;
      }

      @media(max-width:760px){

        .rigo-studio-sidebar{
          display:none;
        }

        .rigo-studio-mobile-nav{
          position:relative;
          z-index:40;
          width:100%;
          height:70px;
          display:grid;
          grid-template-columns:repeat(5,minmax(0,1fr));
          align-items:stretch;
          padding:5px max(6px,env(safe-area-inset-right)) max(5px,env(safe-area-inset-bottom)) max(6px,env(safe-area-inset-left));
          border-top:1px solid rgba(94,126,163,.24);
          background:rgba(3,11,22,.98);
          box-shadow:0 -12px 30px rgba(0,0,0,.28);
        }

        .rigo-studio-mobile-nav .rigo-studio-sidebar-item{
          min-height:56px;
          gap:3px;
          padding:4px 2px;
          border:0;
          border-radius:9px;
        }

        .rigo-studio-mobile-nav .rigo-studio-sidebar-item[data-active="true"]{
          min-height:56px;
          background:rgba(0,230,157,.08);
        }

        .rigo-studio-mobile-nav .rigo-studio-sidebar-item[data-active="true"]::before{
          top:auto;
          right:20%;
          bottom:-5px;
          left:20%;
          width:auto;
          height:3px;
          border-radius:8px 8px 0 0;
        }

        .rigo-studio-mobile-nav .rigo-studio-sidebar-icon{
          width:23px;
          height:23px;
          flex-basis:23px;
        }

        .rigo-studio-mobile-nav .rigo-studio-sidebar-label{
          font-size:9px;
        }

        .rigo-studio-mobile-more-button .rigo-studio-sidebar-icon{
          color:#cbd5e1;
          font-size:24px;
          line-height:1;
        }

        .rigo-studio-mobile-sheet{
          position:fixed;
          z-index:90;
          right:12px;
          bottom:78px;
          left:12px;
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:8px;
          padding:14px;
          border:1px solid rgba(94,126,163,.28);
          border-radius:18px;
          background:linear-gradient(180deg,#0a1728,#06101e);
          box-shadow:0 24px 70px rgba(0,0,0,.56);
          opacity:0;
          visibility:hidden;
          transform:translateY(14px) scale(.98);
          transition:opacity 160ms ease,transform 160ms ease,visibility 160ms ease;
        }

        .rigo-studio-mobile-sheet[data-open="true"]{
          opacity:1;
          visibility:visible;
          transform:translateY(0) scale(1);
        }

        .rigo-studio-mobile-sheet .rigo-studio-sidebar-item{
          min-height:76px;
          border-color:rgba(94,126,163,.12);
          background:rgba(8,22,38,.76);
        }

      }

      @media(max-height:760px){

        .rigo-studio-sidebar{
          padding:4px;
        }

        .rigo-studio-sidebar-item{
          min-height:52px;
          gap:3px;
        }

        .rigo-studio-sidebar-item[data-active="true"]{
          min-height:58px;
        }

        .rigo-studio-sidebar-icon{
          width:24px;
          height:24px;
          flex-basis:24px;
        }

        .rigo-studio-sidebar-label{
          font-size:9px;
        }

        .rigo-studio-sidebar-list[data-position="bottom"]{
          padding-bottom:8px;
        }

      }

    </style>
  `;

}



// =====================================
// CREATE SIDEBAR BUTTON
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
  "rigo-studio-sidebar-item";

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
    <span
      class="rigo-studio-sidebar-icon"
      aria-hidden="true"
    >
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
// CREATE LIST
// =====================================

function createSidebarList(
  position
){

  const list =
  document.createElement(
    "div"
  );

  list.className =
  "rigo-studio-sidebar-list";

  list.dataset.position =
  position;

  return list;

}



function closeMobileSheet(){

  if(sidebarState.mobileSheet){
    sidebarState.mobileSheet.dataset.open = "false";
  }

  sidebarState.menuButton?.setAttribute("aria-expanded","false");
  return true;

}



function toggleMobileSheet(){

  if(!sidebarState.mobileSheet){
    return false;
  }

  const open = sidebarState.mobileSheet.dataset.open !== "true";
  sidebarState.mobileSheet.dataset.open = String(open);
  sidebarState.menuButton?.setAttribute("aria-expanded",String(open));
  return open;

}



function closeGlobalDrawer(){

  sidebarState.globalDrawer?.setAttribute("data-open","false");
  sidebarState.globalBackdrop?.setAttribute("data-open","false");
  sidebarState.topbarMenu?.setAttribute("aria-expanded","false");
  return true;

}



function openGlobalDrawer(){

  closeMobileSheet();
  sidebarState.globalDrawer?.setAttribute("data-open","true");
  sidebarState.globalBackdrop?.setAttribute("data-open","true");
  sidebarState.topbarMenu?.setAttribute("aria-expanded","true");
  return true;

}



function createGlobalDrawer(){

  const backdrop = document.createElement("button");
  backdrop.type = "button";
  backdrop.className = "rigo-global-drawer-backdrop";
  backdrop.dataset.open = "false";
  backdrop.setAttribute("aria-label","Close main navigation");
  backdrop.addEventListener("click",closeGlobalDrawer);

  const drawer = document.createElement("aside");
  drawer.className = "rigo-global-drawer";
  drawer.dataset.open = "false";
  drawer.setAttribute("aria-label","RIGO main navigation");
  drawer.innerHTML = `
    <div class="rigo-global-drawer-head">
      <div class="rigo-global-drawer-brand"><span>R</span><span>RIGO AI</span></div>
      <button type="button" class="rigo-global-drawer-close" aria-label="Close main navigation">×</button>
    </div>
    <a class="rigo-global-drawer-link" href="./home.html?new=1"><span>＋</span>New Chat</a>
    <a class="rigo-global-drawer-link" href="./memory.html"><span>◉</span>Memory</a>
    <a class="rigo-global-drawer-link" href="./admin.html" aria-current="page"><span>✦</span>Admin Studio</a>
    <a class="rigo-global-drawer-link" href="./debug.html"><span>⌁</span>Debug Center</a>
    <div class="rigo-global-drawer-note">RIGO AI · Main navigation</div>
  `;
  drawer.querySelector(".rigo-global-drawer-close")?.addEventListener("click",closeGlobalDrawer);

  return {drawer,backdrop};

}



function createMobileNavigation(){

  const navigation = document.createElement("nav");
  navigation.className = "rigo-studio-mobile-nav";
  navigation.setAttribute("aria-label","Mobile Studio navigation");

  ["dashboard","project","admin-agent","debug"]
  .forEach(function(id){
    const item = SIDEBAR_ITEMS.find(candidate => candidate.id === id);
    if(item) navigation.appendChild(createSidebarButton(item));
  });

  const more = document.createElement("button");
  more.type = "button";
  more.className = "rigo-studio-sidebar-item rigo-studio-mobile-more-button";
  more.setAttribute("aria-label","More Studio pages");
  more.setAttribute("aria-expanded","false");
  more.innerHTML = `<span class="rigo-studio-sidebar-icon" aria-hidden="true">•••</span><span class="rigo-studio-sidebar-label">More</span>`;
  more.addEventListener("click",toggleMobileSheet);
  navigation.appendChild(more);

  const sheet = document.createElement("div");
  sheet.className = "rigo-studio-mobile-sheet";
  sheet.dataset.open = "false";
  ["code","architecture","memory","git","settings"]
  .forEach(function(id){
    const item = SIDEBAR_ITEMS.find(candidate => candidate.id === id);
    if(!item) return;
    const button = createSidebarButton(item);
    button.addEventListener("click",closeMobileSheet);
    sheet.appendChild(button);
  });

  return {navigation,sheet,more};

}



// =====================================
// ACTIVE PAGE
// =====================================

function updateActiveSidebarItem(){

  if(
    !sidebarState.navigation
  ){

    return false;

  }

  const activePage =
  StudioPages.getPageFromHash();

  const buttons =
  sidebarState.navigation
  .querySelectorAll(
    ".rigo-studio-sidebar-item"
  );

  buttons.forEach(
    function(button){

      const isActive =
      button.dataset.page ===
      activePage;

      button.dataset.active =
      String(isActive);

      button.toggleAttribute(
        "aria-current",
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

    }
  );

  return true;

}



// =====================================
// HASH LISTENER
// =====================================

function attachHashListener(){

  if(
    sidebarState.listening
  ){

    return false;

  }

  window.addEventListener(
    "hashchange",
    updateActiveSidebarItem
  );

  sidebarState.listening =
  true;

  return true;

}



function detachHashListener(){

  if(
    !sidebarState.listening
  ){

    return false;

  }

  window.removeEventListener(
    "hashchange",
    updateActiveSidebarItem
  );

  sidebarState.listening =
  false;

  return true;

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

  unmountSidebar();

  root.innerHTML =
  `
    ${createSidebarStyles()}

    <nav
      class="rigo-studio-sidebar"
      aria-label="Studio navigation"
    ></nav>
  `;

  const navigation =
  root.querySelector(
    ".rigo-studio-sidebar"
  );

  const topList =
  createSidebarList(
    "top"
  );

  const bottomList =
  createSidebarList(
    "bottom"
  );

  SIDEBAR_ITEMS.forEach(
    function(item){

      const targetList =
      item.bottom
      ? bottomList
      : topList;

      targetList.appendChild(
        createSidebarButton(
          item
        )
      );

    }
  );

  navigation.append(
    topList,
    bottomList
  );

  const mobile = createMobileNavigation();

  const global = createGlobalDrawer();

  root.append(
    mobile.navigation,
    mobile.sheet,
    global.backdrop,
    global.drawer
  );

  sidebarState.root =
  root;

  sidebarState.navigation =
  root;

  sidebarState.mobileNavigation = mobile.navigation;
  sidebarState.mobileSheet = mobile.sheet;
  sidebarState.menuButton = mobile.more;
  sidebarState.globalDrawer = global.drawer;
  sidebarState.globalBackdrop = global.backdrop;

  const topbarMenu = document.getElementById("rigo-studio-menu-button");
  if(topbarMenu){
    topbarMenu.setAttribute("aria-expanded","false");
    topbarMenu.addEventListener("click",openGlobalDrawer);
    sidebarState.topbarMenu = topbarMenu;
  }

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

  sidebarState.navigation =
  null;

  sidebarState.mobileNavigation = null;
  sidebarState.mobileSheet = null;
  sidebarState.menuButton = null;
  sidebarState.globalDrawer = null;
  sidebarState.globalBackdrop = null;
  sidebarState.topbarMenu = null;

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

    listening:
    sidebarState.listening,

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

          position:
          item.bottom
          ? "bottom"
          : "top"

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
