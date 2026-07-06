// =====================================
// RIGO AI
// STUDIO VIEW MANAGER
// =====================================

import ViewRegistry
from "./view-registry.js";

import ViewLifecycle
from "./view-lifecycle.js";



// =====================================
// REGISTER
// =====================================

async function register(
  view
){

  if(
    !view ||
    !view.id
  ){

    return false;

  }

  await ViewLifecycle
  .initialize(
    view
  );

  return ViewRegistry
  .register(
    view
  );

}



// =====================================
// UNREGISTER
// =====================================

function unregister(
  viewId
){

  return ViewRegistry
  .unregister(
    viewId
  );

}



// =====================================
// GET
// =====================================

function get(
  viewId
){

  return ViewRegistry
  .get(
    viewId
  );

}



// =====================================
// HAS
// =====================================

function has(
  viewId
){

  return ViewRegistry
  .has(
    viewId
  );

}



// =====================================
// LIST
// =====================================

function list(){

  return ViewRegistry
  .list();

}



// =====================================
// MOUNT
// =====================================

async function mount(
  viewId,
  container,
  payload = null
){

  const view =
  get(
    viewId
  );

  if(
    !view
  ){

    if(
      container
    ){

      container.innerHTML =
      `
        <div style="padding:24px;color:#e5e7eb;">
          View not registered: ${String(viewId)}
        </div>
      `;

    }

    return false;

  }

  return ViewLifecycle
  .mount(
    view,
    container,
    payload
  );

}



// =====================================
// REFRESH
// =====================================

async function refresh(
  viewId
){

  const view =
  get(
    viewId
  );

  return ViewLifecycle
  .refresh(
    view
  );

}



// =====================================
// UNMOUNT
// =====================================

async function unmount(
  viewId
){

  const view =
  get(
    viewId
  );

  return ViewLifecycle
  .unmount(
    view
  );

}



// =====================================
// RESET
// =====================================

async function reset(
  viewId
){

  const view =
  get(
    viewId
  );

  return ViewLifecycle
  .reset(
    view
  );

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {
    registry:
    ViewRegistry.snapshot(),

    views:
    list().map(
      function(view){

        return ViewLifecycle
        .snapshot(
          view
        );

      }
    )
  };

}



// =====================================
// API
// =====================================

const ViewManager =
Object.freeze({

  register,

  unregister,

  get,

  has,

  list,

  mount,

  refresh,

  unmount,

  reset,

  snapshot

});



export {

  register,

  unregister,

  get,

  has,

  list,

  mount,

  refresh,

  unmount,

  reset,

  snapshot,

  ViewManager

};

export default
ViewManager;
