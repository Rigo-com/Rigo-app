// =====================================
// RIGO AI
// STUDIO LAYOUT
// UI V2
// =====================================

import {
  applyStudioTheme
}
from "./studio-theme.js";



// =====================================
// TOPBAR
// =====================================

function createTopbar(){

  return `
    <div class="rigo-studio-topbar-inner">

      <div class="rigo-studio-brand">

        <div
          class="rigo-studio-brand-logo"
          aria-hidden="true"
        >
          <span>R</span>
        </div>

        <strong class="rigo-studio-brand-name">
          RIGO STUDIO
        </strong>

      </div>

      <div class="rigo-studio-topbar-actions">

        <div
          class="rigo-studio-online-status"
          title="Studio runtime status"
        >
          <span
            class="rigo-studio-online-dot"
            aria-hidden="true"
          ></span>

          <strong>
            Studio Online
          </strong>
        </div>

        <button
          type="button"
          id="rigo-studio-menu-button"
          class="rigo-studio-menu-button"
          aria-label="Open Studio menu"
          title="Studio menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>

    </div>
  `;

}



// =====================================
// LEGACY STATUSBAR
// =====================================

function createStatusbar(){

  return "";

}



// =====================================
// GLOBAL STYLES
// =====================================

function createStudioStyles(){

  return `
    <style id="rigo-studio-global-styles">

      html,
      body{
        width:100%;
        height:100%;
        margin:0;
        overflow:hidden;
        background:var(--rigo-background);
      }

      #rigo-studio-root,
      #rigo-studio-root *{
        box-sizing:border-box;
      }

      #rigo-studio-root{
        color:var(--rigo-text);
        font-family:var(--rigo-font);
        font-synthesis:none;
        text-rendering:optimizeLegibility;
      }

      /* =================================
         TOPBAR
      ================================= */

      #rigo-studio-topbar{
        min-width:0;
        min-height:0;
      }

      .rigo-studio-topbar-inner{
        width:100%;
        height:100%;
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:0 16px 0 30px;
        border-bottom:1px solid rgba(94,126,163,.12);
        background:
          linear-gradient(
            180deg,
            rgba(2,10,22,.99),
            rgba(2,8,18,.99)
          );
      }

      .rigo-studio-brand{
        min-width:0;
        display:flex;
        align-items:center;
        gap:11px;
      }

      .rigo-studio-brand-logo{
        position:relative;
        width:32px;
        height:32px;
        flex:0 0 32px;
        display:flex;
        align-items:center;
        justify-content:center;
        overflow:hidden;
        border-radius:50%;
        color:#031319;
        background:
          linear-gradient(
            145deg,
            #15f3a2,
            #00b975
          );
        box-shadow:
          0 0 16px rgba(0,230,157,.20);
      }

      .rigo-studio-brand-logo::before{
        content:"";
        position:absolute;
        width:15px;
        height:3px;
        top:7px;
        left:9px;
        border-radius:999px;
        background:#031319;
        transform:rotate(-3deg);
      }

      .rigo-studio-brand-logo::after{
        content:"";
        position:absolute;
        width:17px;
        height:3px;
        right:4px;
        bottom:8px;
        border-radius:999px;
        background:#031319;
        transform:rotate(7deg);
      }

      .rigo-studio-brand-logo span{
        position:relative;
        z-index:1;
        font-size:19px;
        line-height:1;
        font-weight:950;
        letter-spacing:-2px;
      }

      .rigo-studio-brand-name{
        overflow:hidden;
        color:#f8fafc;
        font-size:17px;
        line-height:1;
        font-weight:800;
        letter-spacing:.3px;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .rigo-studio-topbar-actions{
        display:flex;
        align-items:center;
        gap:18px;
      }

      .rigo-studio-online-status{
        height:32px;
        display:flex;
        align-items:center;
        justify-content:center;
        gap:8px;
        padding:0 13px;
        border:1px solid rgba(94,126,163,.12);
        border-radius:999px;
        color:var(--rigo-text-secondary);
        background:
          linear-gradient(
            180deg,
            rgba(10,24,42,.90),
            rgba(6,17,32,.90)
          );
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.02);
        font-size:11px;
        line-height:1;
        white-space:nowrap;
      }

      .rigo-studio-online-status strong{
        font-weight:600;
      }

      .rigo-studio-online-dot{
        width:8px;
        height:8px;
        flex:0 0 8px;
        border-radius:50%;
        background:var(--rigo-primary);
        box-shadow:
          0 0 5px var(--rigo-primary),
          0 0 12px var(--rigo-primary-glow);
      }

      .rigo-studio-menu-button{
        width:43px;
        height:43px;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:4px;
        padding:0;
        border:1px solid rgba(94,126,163,.18);
        border-radius:10px;
        color:var(--rigo-text);
        background:
          linear-gradient(
            180deg,
            rgba(10,24,42,.90),
            rgba(6,17,32,.90)
          );
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.025),
          0 7px 18px rgba(0,0,0,.15);
        cursor:pointer;
        transition:
          background var(--rigo-transition-normal),
          border-color var(--rigo-transition-normal);
      }

      .rigo-studio-menu-button span{
        width:17px;
        height:2px;
        display:block;
        border-radius:999px;
        background:#d7dee8;
      }

      .rigo-studio-menu-button:hover{
        border-color:var(--rigo-border-strong);
        background:var(--rigo-surface-hover);
      }

      .rigo-studio-menu-button:focus-visible{
        outline:none;
        border-color:rgba(0,230,157,.48);
        box-shadow:
          0 0 0 2px rgba(0,230,157,.10);
      }

      /* =================================
         SIDEBAR
      ================================= */

      #rigo-studio-sidebar{
        min-width:0;
        min-height:0;
        overflow:hidden;
      }

      /* =================================
         WORKSPACE
      ================================= */

      #rigo-studio-workspace{
        min-width:0;
        min-height:0;
        overflow:hidden;
      }

      /* =================================
         RESPONSIVE
      ================================= */

      @media(max-width:760px){

        #rigo-studio-root{
          grid-template-columns:
            92px
            minmax(0,1fr) !important;
        }

        .rigo-studio-topbar-inner{
          padding:
            0
            10px
            0
            14px;
        }

        .rigo-studio-brand{
          gap:8px;
        }

        .rigo-studio-brand-logo{
          width:29px;
          height:29px;
          flex-basis:29px;
        }

        .rigo-studio-brand-name{
          font-size:14px;
        }

        .rigo-studio-topbar-actions{
          gap:8px;
        }

        .rigo-studio-online-status{
          width:31px;
          height:31px;
          padding:0;
        }

        .rigo-studio-online-status strong{
          display:none;
        }

        .rigo-studio-menu-button{
          width:36px;
          height:36px;
        }

      }

    </style>
  `;

}



// =====================================
// CREATE ROOT
// =====================================

function createStudioRoot(){

  const root =
  document.createElement(
    "div"
  );

  root.id =
  "rigo-studio-root";

  applyStudioTheme(
    root
  );

  root.style.cssText +=
  `
    width:100%;
    height:100vh;
    min-height:100vh;
    display:grid;
    grid-template-columns:
      var(--rigo-sidebar-column)
      minmax(0,1fr);
    grid-template-rows:
      var(--rigo-topbar-height)
      minmax(0,1fr);
    overflow:hidden;
    background:
      radial-gradient(
        circle at 0% 0%,
        rgba(0,230,157,.035),
        transparent 22%
      ),
      radial-gradient(
        circle at 100% 0%,
        rgba(0,156,255,.025),
        transparent 23%
      ),
      var(--rigo-background);
  `;

  root.innerHTML =
  `
    ${createStudioStyles()}

    <header
      id="rigo-studio-topbar"
      style="
        grid-column:1 / 3;
        grid-row:1;
      "
    >
      ${createTopbar()}
    </header>

    <aside
      id="rigo-studio-sidebar"
      style="
        grid-column:1;
        grid-row:2;
        padding:
          8px
          6px
          10px
          14px;
      "
    ></aside>

    <main
      id="rigo-studio-workspace"
      style="
        grid-column:2;
        grid-row:2;
        padding:
          8px
          14px
          10px
          4px;
      "
    ></main>
  `;

  return root;

}



// =====================================
// MOUNT
// =====================================

function mountStudioLayout(
  container
){

  let root =
  document.getElementById(
    "rigo-studio-root"
  );

  if(
    root
  ){

    return root;

  }

  root =
  createStudioRoot();

  (
    container ||
    document.body
  )
  .appendChild(
    root
  );

  return root;

}



// =====================================
// UNMOUNT
// =====================================

function unmountStudioLayout(){

  const root =
  document.getElementById(
    "rigo-studio-root"
  );

  if(
    root
  ){

    root.remove();

  }

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  createTopbar,

  createStatusbar,

  createStudioStyles,

  createStudioRoot,

  mountStudioLayout,

  unmountStudioLayout

};

export default {

  createTopbar,

  createStatusbar,

  createStudioStyles,

  createStudioRoot,

  mountStudioLayout,

  unmountStudioLayout

};
