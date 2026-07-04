// =====================================
// RIGO AI
// STUDIO UI
// =====================================

import renderPage
from "./studio-pages.js";

import {
  mountStudioLayout,
  unmountStudioLayout
}
from "./studio-layout.js";

import renderSidebar
from "./studio-sidebar.js";



// =====================================
// MOUNT
// =====================================

function mount(){

  mountStudioLayout();

  renderSidebar();

  return true;

}



// =====================================
// UNMOUNT
// =====================================

function unmount(){

  unmountStudioLayout();

  return true;

}



// =====================================
// API
// =====================================

const StudioUI =
Object.freeze({

  mount,

  unmount

});



// =====================================
// EXPORTS
// =====================================

export {

  mount,

  unmount,

  StudioUI

};

export default
StudioUI;
