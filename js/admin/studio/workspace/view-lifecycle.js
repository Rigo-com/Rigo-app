// =====================================
// RIGO AI
// STUDIO VIEW LIFECYCLE
// =====================================

async function initializeView(
  view
){

  if(
    view &&
    typeof view.initialize === "function"
  ){

    return view.initialize();

  }

  return true;

}



async function mountView(
  view,
  container,
  payload = null
){

  if(
    view &&
    typeof view.mount === "function"
  ){

    return view.mount(
      container,
      payload
    );

  }

  if(
    container
  ){

    container.innerHTML =
    `
      <div style="padding:24px;color:#e5e7eb;">
        View has no mount handler.
      </div>
    `;

  }

  return false;

}



async function refreshView(
  view
){

  if(
    view &&
    typeof view.refresh === "function"
  ){

    return view.refresh();

  }

  return true;

}



async function unmountView(
  view
){

  if(
    view &&
    typeof view.unmount === "function"
  ){

    return view.unmount();

  }

  return true;

}



async function resetView(
  view
){

  if(
    view &&
    typeof view.reset === "function"
  ){

    return view.reset();

  }

  return true;

}



function snapshotView(
  view
){

  if(
    view &&
    typeof view.snapshot === "function"
  ){

    return view.snapshot();

  }

  return {
    id:view?.id || null,
    title:view?.title || null
  };

}



export {

  initializeView,

  mountView,

  refreshView,

  unmountView,

  resetView,

  snapshotView

};

export default {
  initialize:initializeView,
  mount:mountView,
  refresh:refreshView,
  unmount:unmountView,
  reset:resetView,
  snapshot:snapshotView
};
