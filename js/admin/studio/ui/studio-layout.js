// =====================================
// RIGO AI
// STUDIO LAYOUT
// =====================================

import StudioTheme
from "./studio-theme.js";



// =====================================
// CREATE TOPBAR
// =====================================

function createTopbar(){

  return `
    <div
      style="
        width:100%;
        height:68px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:0 18px 0 20px;
        border-bottom:1px solid rgba(148,163,184,.11);
        background:rgba(2,8,23,.68);
      "
    >
      <div
        style="
          display:flex;
          align-items:center;
          gap:9px;
          color:#f8fafc;
          font-size:18px;
          line-height:1;
          font-weight:800;
          letter-spacing:.2px;
          white-space:nowrap;
        "
      >
        <span
          style="
            width:30px;
            height:30px;
            flex:0 0 30px;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            border-radius:50%;
            background:linear-gradient(135deg,#34d399,#06b6d4);
            color:#02111f;
            font-size:17px;
            font-weight:900;
            box-shadow:0 0 20px rgba(16,185,129,.14);
          "
        >
          R
        </span>

        <span>
          RIGO STUDIO
        </span>
      </div>

      <div
        style="
          display:flex;
          align-items:center;
          gap:12px;
        "
      >
        <div
          style="
            height:34px;
            display:flex;
            align-items:center;
            gap:8px;
            padding:0 13px;
            border:1px solid rgba(148,163,184,.12);
            border-radius:999px;
            background:rgba(15,23,42,.72);
            color:#f8fafc;
            font-size:12px;
            line-height:1;
            font-weight:700;
            white-space:nowrap;
          "
        >
          <span
            style="
              width:9px;
              height:9px;
              border-radius:50%;
              background:#22c55e;
              box-shadow:0 0 10px rgba(34,197,94,.85);
            "
          ></span>

          <span>
            Studio Online
          </span>
        </div>

        <button
          type="button"
          id="rigo-studio-menu-button"
          aria-label="Open Studio menu"
          style="
            width:42px;
            height:42px;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:0;
            border:1px solid rgba(148,163,184,.15);
            border-radius:12px;
            background:rgba(15,23,42,.76);
            color:#f8fafc;
            font-size:21px;
            line-height:1;
            cursor:pointer;
          "
        >
          ☰
        </button>
      </div>
    </div>
  `;

}



// =====================================
// CREATE STUDIO ROOT
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
    grid-template-columns:142px minmax(0,1fr);
    grid-template-rows:68px minmax(0,1fr) 30px;
    overflow:hidden;
    background:
      radial-gradient(
        circle at 0% 0%,
        rgba(16,185,129,.055),
        transparent 24%
      ),
      radial-gradient(
        circle at 100% 0%,
        rgba(14,165,233,.045),
        transparent 26%
      ),
      #020817;
    color:${StudioTheme.colors.text};
    font-family:
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  `;

  root.innerHTML =
  `
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
        min-width:0;
        min-height:0;
      "
    ></aside>

    <main
      id="rigo-studio-workspace"
      style="
        grid-column:2;
        grid-row:2;
        min-width:0;
        min-height:0;
        overflow:hidden;
        padding:8px 14px 0 8px;
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
        justify-content:center;
        padding:0 16px;
        border-top:1px solid rgba(148,163,184,.09);
        background:rgba(2,8,23,.78);
        color:#94a3b8;
        font-size:11px;
        line-height:1;
      "
    >
      RIGO AI Studio • All systems ready.
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

  createStudioRoot,

  mountStudioLayout,

  unmountStudioLayout

};

export default {

  createTopbar,

  createStudioRoot,

  mountStudioLayout,

  unmountStudioLayout

};
