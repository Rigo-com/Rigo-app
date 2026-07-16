// =====================================
// RIGO AI
// STUDIO WORKSPACE LAYOUT
// =====================================



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

  root.style.cssText =
  `
    width:100%;
    height:100%;
    min-width:0;
    min-height:0;
    display:grid;
    grid-template-rows:40px minmax(0,1fr);
    overflow:hidden;
    border:1px solid rgba(148,163,184,.12);
    border-radius:14px 14px 0 0;
    background:#020817;
    box-shadow:
      0 14px 36px
      rgba(0,0,0,.16);
  `;

  root.innerHTML =
  `
    <div
      id="rigo-workspace-tabs"
      style="
        min-width:0;
        min-height:0;
        display:flex;
        align-items:flex-end;
        gap:4px;
        padding:0 10px;
        overflow-x:auto;
        overflow-y:hidden;
        border-bottom:1px solid rgba(148,163,184,.11);
        background:rgba(15,23,42,.78);
        scrollbar-width:thin;
      "
    >
    </div>

    <div
      id="rigo-workspace-content"
      style="
        position:relative;
        min-width:0;
        min-height:0;
        overflow:auto;
        background:#020817;
      "
    >
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

  createWorkspaceLayout,

  mountWorkspaceLayout,

  unmountWorkspaceLayout,

  getWorkspaceRoot,

  getWorkspaceTabs,

  getWorkspaceContent

};

export default {

  createWorkspaceLayout,

  mountWorkspaceLayout,

  unmountWorkspaceLayout,

  getWorkspaceRoot,

  getWorkspaceTabs,

  getWorkspaceContent

};
