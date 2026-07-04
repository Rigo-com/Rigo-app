// =====================================
// RIGO AI
// STUDIO LAYOUT
// =====================================

import StudioTheme
from "./studio-theme.js";

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
    background:${StudioTheme.colors.background};
    color:${StudioTheme.colors.text};
    display:grid;
    grid-template-columns:72px 1fr;
    grid-template-rows:48px 1fr 180px 28px;
    font-family:system-ui,sans-serif;
  `;

  root.innerHTML =
  `
    <header id="rigo-studio-topbar" style="grid-column:1 / 3;"></header>
    <aside id="rigo-studio-sidebar"></aside>
    <main id="rigo-studio-workspace"></main>
    <section id="rigo-studio-terminal" style="grid-column:1 / 3;"></section>
    <footer id="rigo-studio-statusbar" style="grid-column:1 / 3;"></footer>
  `;

  return root;

}



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



export {

  createStudioRoot,

  mountStudioLayout,

  unmountStudioLayout

};

export default {

  createStudioRoot,

  mountStudioLayout,

  unmountStudioLayout

};
