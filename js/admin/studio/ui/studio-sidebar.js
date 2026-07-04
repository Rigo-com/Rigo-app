// =====================================
// RIGO AI
// STUDIO SIDEBAR
// =====================================

const SIDEBAR_ITEMS = [

  {
    id:"dashboard",
    icon:"🏠"
  },

  {
    id:"project",
    icon:"📁"
  },

  {
    id:"code",
    icon:"💻"
  },

  {
    id:"debug",
    icon:"🐞"
  },

  {
    id:"architecture",
    icon:"🏗️"
  },

  {
    id:"git",
    icon:"🌿"
  },

  {
    id:"memory",
    icon:"🧠"
  },

  {
    id:"settings",
    icon:"⚙️"
  }

];



function renderSidebar(){

  const sidebar =
  document.getElementById(
    "rigo-studio-sidebar"
  );

  if(
    !sidebar
  ){

    return false;

  }

  sidebar.innerHTML = "";

  sidebar.style.cssText = `
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:10px;
    padding:10px;
    background:#0f172a;
    border-right:1px solid #1f2937;
  `;

  for(
    const item
    of SIDEBAR_ITEMS
  ){

    const button =
    document.createElement(
      "button"
    );

    button.dataset.page =
    item.id;

    button.textContent =
    item.icon;

    button.style.cssText = `
      width:48px;
      height:48px;
      border:none;
      border-radius:12px;
      background:#111827;
      color:white;
      cursor:pointer;
      font-size:22px;
    `;

    sidebar.appendChild(
      button
    );

  }

  return true;

}



export {

  renderSidebar

};

export default
renderSidebar;
