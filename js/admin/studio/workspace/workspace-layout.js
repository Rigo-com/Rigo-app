// =====================================
// RIGO AI
// STUDIO WORKSPACE LAYOUT
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
    display:grid;
    grid-template-rows:48px 1fr;
    width:100%;
    height:100%;
    overflow:hidden;
    background:#020817;
  `;

  root.innerHTML =
  `
    <div
      id="rigo-workspace-tabs"
      style="
        display:flex;
        align-items:center;
        gap:2px;
        padding:0 8px;
        background:#0f172a;
        border-bottom:1px solid rgba(148,163,184,.12);
        overflow-x:auto;
      "
    >
    </div>

    <div
      id="rigo-workspace-content"
      style="
        position:relative;
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

  return document.getElementById(
    "rigo-workspace"
  );

}



function getWorkspaceTabs(){

  return document.getElementById(
    "rigo-workspace-tabs"
  );

}



function getWorkspaceContent(){

  return document.getElementById(
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
