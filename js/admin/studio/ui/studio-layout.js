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
        height:72px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:0 28px;
        border-bottom:1px solid rgba(148,163,184,.12);
      "
    >
      <div
        style="
          display:flex;
          align-items:center;
          gap:10px;
          font-size:22px;
          font-weight:800;
          letter-spacing:.3px;
          color:#f8fafc;
        "
      >
        <span
          style="
            width:32px;
            height:32px;
            border-radius:50%;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            background:linear-gradient(135deg,#22c55e,#06b6d4);
            color:#02111f;
            font-weight:900;
          "
        >
          R
        </span>

        <span>RIGO STUDIO</span>
      </div>

      <div
        style="
          display:flex;
          align-items:center;
          gap:14px;
        "
      >
        <div
          style="
            display:flex;
            align-items:center;
            gap:8px;
            padding:9px 14px;
            border-radius:999px;
            background:rgba(15,23,42,.9);
            border:1px solid rgba(148,163,184,.12);
            color:#f8fafc;
            font-size:13px;
            font-weight:700;
          "
        >
          <span
            style="
              width:10px;
              height:10px;
              border-radius:50%;
              background:#22c55e;
              box-shadow:0 0 12px rgba(34,197,94,.9);
            "
          ></span>
          Studio Online
        </div>

        <button
          type="button"
          id="rigo-studio-menu-button"
          style="
            width:48px;
            height:48px;
            border-radius:14px;
            border:1px solid rgba(148,163,184,.16);
            background:rgba(15,23,42,.85);
            color:#f8fafc;
            font-size:24px;
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
    min-height:100vh;
    background:
      radial-gradient(circle at top left, rgba(34,197,94,.10), transparent 28%),
      radial-gradient(circle at top right, rgba(59,130,246,.10), transparent 30%),
      #020817;
    color:${StudioTheme.colors.text};
    display:grid;
    grid-template-columns:150px 1fr;
    grid-template-rows:72px 1fr 40px;
    font-family:Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    overflow:hidden;
  `;

  root.innerHTML =
  `
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
      "
    ></aside>

    <main
      id="rigo-studio-workspace"
      style="
        grid-column:2;
        grid-row:2;
        min-width:0;
        min-height:0;
        overflow:auto;
      "
    ></main>

    <footer
      id="rigo-studio-statusbar"
      style="
        grid-column:1 / 3;
        grid-row:3;
        display:flex;
        align-items:center;
        justify-content:center;
        color:#cbd5e1;
        font-size:14px;
        border-top:1px solid rgba(148,163,184,.10);
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
