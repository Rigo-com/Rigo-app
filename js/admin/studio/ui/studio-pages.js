// =====================================
// RIGO AI
// STUDIO PAGES
// =====================================

function renderPage(
  page = "dashboard"
){

  const workspace =
  document.getElementById(
    "rigo-studio-workspace"
  );

  if(
    !workspace
  ){

    return false;

  }

  workspace.style.cssText =
  `
    padding:16px;
    overflow:auto;
    background:#0b1220;
  `;

  workspace.innerHTML =
  `
    <h1 style="margin:0 0 12px;">RIGO Studio</h1>
    <p style="color:#94a3b8;">Active page: ${page}</p>
  `;

  return true;

}

export {
  renderPage
};

export default
renderPage;
