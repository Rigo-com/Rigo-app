// =====================================
// RIGO AI
// STUDIO LAYOUT
// UI V2
// =====================================

import StudioTheme, {
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

        <div class="rigo-studio-brand-logo">
          R
        </div>

        <div class="rigo-studio-brand-copy">

          <strong>
            RIGO STUDIO
          </strong>

          <span>
            Admin development environment
          </span>

        </div>

      </div>

      <div class="rigo-studio-topbar-actions">

        <div
          class="rigo-studio-online-status"
          title="Studio runtime status"
        >
          <span></span>

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
          ☰
        </button>

      </div>

    </div>
  `;

}



// =====================================
// STATUSBAR
// =====================================

function createStatusbar(){

  return `
    <div class="rigo-studio-statusbar-left">

      <span class="rigo-studio-status-item">
        <span class="rigo-studio-status-dot success"></span>
        RIGO Ready
      </span>

      <span class="rigo-studio-status-item">
        Main
      </span>

    </div>

    <div class="rigo-studio-statusbar-right">

      <span class="rigo-studio-status-item">
        UTF-8
      </span>

      <span class="rigo-studio-status-item">
        JavaScript
      </span>

      <span class="rigo-studio-status-item">
        Admin Mode
      </span>

    </div>
  `;

}



// =====================================
// GLOBAL STYLES
// =====================================

function createStudioStyles(){

  return `
    <style id="rigo-studio-global-styles">

      #rigo-studio-root,
      #rigo-studio-root *{
        box-sizing:border-box;
      }

      #rigo-studio-root{
        color:var(--rigo-text);
        font-family:var(--rigo-font);
      }

      .rigo-studio-topbar-inner{
        width:100%;
        height:100%;
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:0 16px 0 18px;
        background:
          linear-gradient(
            180deg,
            rgba(6,16,31,.97),
            rgba(2,8,23,.97)
          );
        border-bottom:1px solid var(--rigo-border);
      }

      .rigo-studio-brand{
        min-width:0;
        display:flex;
        align-items:center;
        gap:10px;
      }

      .rigo-studio-brand-logo{
        width:30px;
        height:30px;
        flex:0 0 30px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:50%;
        color:#02111f;
        background:
          linear-gradient(
            135deg,
            var(--rigo-primary),
            var(--rigo-cyan)
          );
        font-size:16px;
        line-height:1;
        font-weight:900;
        box-shadow:
          0 0 18px
          rgba(34,197,94,.17);
      }

      .rigo-studio-brand-copy{
        min-width:0;
        display:flex;
        flex-direction:column;
        gap:3px;
      }

      .rigo-studio-brand-copy strong{
        overflow:hidden;
        color:var(--rigo-text);
        font-size:17px;
        line-height:1;
        font-weight:800;
        letter-spacing:.2px;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .rigo-studio-brand-copy span{
        overflow:hidden;
        color:var(--rigo-muted);
        font-size:10px;
        line-height:1;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .rigo-studio-topbar-actions{
        display:flex;
        align-items:center;
        gap:10px;
      }

      .rigo-studio-online-status{
        height:32px;
        display:flex;
        align-items:center;
        gap:8px;
        padding:0 12px;
        border:1px solid var(--rigo-border);
        border-radius:999px;
        color:var(--rigo-text-secondary);
        background:rgba(15,23,42,.64);
        font-size:11px;
        line-height:1;
        white-space:nowrap;
      }

      .rigo-studio-online-status > span{
        width:8px;
        height:8px;
        flex:0 0 8px;
        border-radius:50%;
        background:var(--rigo-primary);
        box-shadow:
          0 0 10px
          var(--rigo-primary-glow);
      }

      .rigo-studio-online-status strong{
        font-weight:700;
      }

      .rigo-studio-menu-button{
        width:38px;
        height:38px;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:0;
        border:1px solid var(--rigo-border);
        border-radius:var(--rigo-radius-md);
        color:var(--rigo-text);
        background:rgba(15,23,42,.66);
        font-size:20px;
        line-height:1;
        cursor:pointer;
        transition:
          background var(--rigo-transition-normal),
          border-color var(--rigo-transition-normal);
      }

      .rigo-studio-menu-button:hover{
        background:var(--rigo-surface-hover);
        border-color:var(--rigo-border-strong);
      }

      .rigo-studio-statusbar-left,
      .rigo-studio-statusbar-right{
        display:flex;
        align-items:center;
        gap:14px;
      }

      .rigo-studio-status-item{
        display:inline-flex;
        align-items:center;
        gap:6px;
        color:var(--rigo-muted);
        font-size:10px;
        line-height:1;
        white-space:nowrap;
      }

      .rigo-studio-status-dot{
        width:6px;
        height:6px;
        display:inline-block;
        border-radius:50%;
      }

      .rigo-studio-status-dot.success{
        background:var(--rigo-primary);
        box-shadow:
          0 0 8px
          var(--rigo-primary-glow);
      }

      #rigo-studio-sidebar,
      #rigo-studio-workspace{
        min-width:0;
        min-height:0;
      }

      #rigo-studio-workspace{
        overflow:hidden;
      }

      @media(max-width:760px){

        #rigo-studio-root{
          grid-template-columns:
            92px
            minmax(0,1fr) !important;
        }

        .rigo-studio-brand-copy span{
          display:none;
        }

        .rigo-studio-online-status strong{
          display:none;
        }

        .rigo-studio-online-status{
          width:32px;
          padding:0;
          justify-content:center;
        }

        #rigo-studio-statusbar{
          padding:0 8px !important;
        }

        .rigo-studio-statusbar-left,
        .rigo-studio-statusbar-right{
          gap:8px;
        }

        .rigo-studio-status-item:nth-child(n+2){
          display:none;
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

  root.style.cssText =
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
      minmax(0,1fr)
      var(--rigo-statusbar-height);
    overflow:hidden;
    background:
      radial-gradient(
        circle at 0% 0%,
        rgba(34,197,94,.05),
        transparent 25%
      ),
      radial-gradient(
        circle at 100% 0%,
        rgba(56,189,248,.04),
        transparent 25%
      ),
      var(--rigo-background);
  `;

  applyStudioTheme(
    root
  );

  root.innerHTML =
  `
    ${createStudioStyles()}

    <header
      id="rigo-studio-topbar"
      style="
        grid-column:1 / 3;
        grid-row:1;
        min-width:0;
        min-height:0;
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
          8px
          10px;
      "
    ></aside>

    <main
      id="rigo-studio-workspace"
      style="
        grid-column:2;
        grid-row:2;
        padding:
          8px
          10px
          0
          4px;
      "
    ></main>

    <footer
      id="rigo-studio-statusbar"
      style="
        grid-column:1 / 3;
        grid-row:3;
        min-width:0;
        min-height:0;
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:0 14px;
        border-top:1px solid var(--rigo-border);
        background:rgba(2,8,23,.94);
      "
    >
      ${createStatusbar()}
    </footer>
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
