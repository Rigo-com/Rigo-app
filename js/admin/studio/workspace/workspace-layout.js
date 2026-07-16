// =====================================
// RIGO AI
// STUDIO WORKSPACE LAYOUT
// UI V2
// =====================================



// =====================================
// STYLES
// =====================================

function createWorkspaceStyles(){

  return `
    <style id="rigo-workspace-styles">

      #rigo-workspace{
        width:100%;
        height:100%;
        min-width:0;
        min-height:0;
        display:grid;
        grid-template-rows:
          var(--rigo-workspace-tabs-height)
          minmax(0,1fr);
        overflow:hidden;
        border:1px solid var(--rigo-border);
        border-radius:
          var(--rigo-radius-xl)
          var(--rigo-radius-xl)
          0
          0;
        background:var(--rigo-workspace);
        box-shadow:var(--rigo-shadow-small);
      }

      #rigo-workspace-tabs{
        min-width:0;
        min-height:0;
        display:flex;
        align-items:flex-end;
        gap:3px;
        padding:0 7px;
        overflow-x:auto;
        overflow-y:hidden;
        border-bottom:1px solid var(--rigo-border);
        background:
          linear-gradient(
            180deg,
            rgba(11,22,40,.94),
            rgba(6,16,31,.94)
          );
        scrollbar-width:thin;
        scrollbar-color:
          rgba(148,163,184,.18)
          transparent;
      }

      #rigo-workspace-tabs::-webkit-scrollbar{
        height:4px;
      }

      #rigo-workspace-tabs::-webkit-scrollbar-track{
        background:transparent;
      }

      #rigo-workspace-tabs::-webkit-scrollbar-thumb{
        border-radius:999px;
        background:rgba(148,163,184,.18);
      }

      #rigo-workspace-content{
        position:relative;
        min-width:0;
        min-height:0;
        overflow:auto;
        background:
          radial-gradient(
            circle at 10% 0%,
            rgba(34,197,94,.025),
            transparent 24%
          ),
          var(--rigo-workspace);
        scrollbar-width:thin;
        scrollbar-color:
          rgba(148,163,184,.18)
          transparent;
      }

      #rigo-workspace-content::-webkit-scrollbar{
        width:6px;
        height:6px;
      }

      #rigo-workspace-content::-webkit-scrollbar-track{
        background:transparent;
      }

      #rigo-workspace-content::-webkit-scrollbar-thumb{
        border-radius:999px;
        background:rgba(148,163,184,.18);
      }

      .rigo-workspace-empty{
        width:100%;
        height:100%;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:24px;
        color:var(--rigo-muted);
        font-size:12px;
        text-align:center;
      }

      @media(max-width:760px){

        #rigo-workspace{
          border-radius:
            var(--rigo-radius-lg)
            var(--rigo-radius-lg)
            0
            0;
        }

        #rigo-workspace-tabs{
          padding:0 5px;
          gap:2px;
        }

      }

    </style>
  `;

}



// =====================================
// CREATE
// =====================================

function createWorkspaceLayout(){

  const root =
  document.createElement(
    "div"
  );

  root.id =
  "rigo-workspace";

  root.innerHTML =
  `
    ${createWorkspaceStyles()}

    <div
      id="rigo-workspace-tabs"
      role="tablist"
      aria-label="Workspace tabs"
    ></div>

    <div
      id="rigo-workspace-content"
      role="tabpanel"
    >
      <div class="rigo-workspace-empty">
        No view is currently open.
      </div>
    </div>
  `;

  return root;

}



// =====================================
// MOUNT
// =====================================

function mountWorkspaceLayout(
  container
){

  if(
    !container
  ){

    return null;

  }

  const existingRoot =
  getWorkspaceRoot();

  if(
    existingRoot
  ){

    return existingRoot;

  }

  const root =
  createWorkspaceLayout();

  container.innerHTML =
  "";

  container.appendChild(
    root
  );

  return root;

}



// =====================================
// GETTERS
// =====================================

function getWorkspaceRoot(){

  return document
  .getElementById(
    "rigo-workspace"
  );

}



function getWorkspaceTabs(){

  return document
  .getElementById(
    "rigo-workspace-tabs"
  );

}



function getWorkspaceContent(){

  return document
  .getElementById(
    "rigo-workspace-content"
  );

}



// =====================================
// CLEAR CONTENT
// =====================================

function clearWorkspaceContent(){

  const content =
  getWorkspaceContent();

  if(
    !content
  ){

    return false;

  }

  content.innerHTML =
  "";

  return true;

}



// =====================================
// RENDER EMPTY
// =====================================

function renderWorkspaceEmpty(
  message = "No view is currently open."
){

  const content =
  getWorkspaceContent();

  if(
    !content
  ){

    return false;

  }

  content.innerHTML =
  `
    <div class="rigo-workspace-empty">
      ${String(message)}
    </div>
  `;

  return true;

}



// =====================================
// UNMOUNT
// =====================================

function unmountWorkspaceLayout(){

  const root =
  getWorkspaceRoot();

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

  createWorkspaceStyles,

  createWorkspaceLayout,

  mountWorkspaceLayout,

  unmountWorkspaceLayout,

  getWorkspaceRoot,

  getWorkspaceTabs,

  getWorkspaceContent,

  clearWorkspaceContent,

  renderWorkspaceEmpty

};

export default {

  createWorkspaceStyles,

  createWorkspaceLayout,

  mountWorkspaceLayout,

  unmountWorkspaceLayout,

  getWorkspaceRoot,

  getWorkspaceTabs,

  getWorkspaceContent,

  clearWorkspaceContent,

  renderWorkspaceEmpty

};
