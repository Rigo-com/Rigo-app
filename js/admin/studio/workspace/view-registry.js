// =====================================
// RIGO AI
// STUDIO VIEW REGISTRY
// =====================================

const ViewRegistryState =
Object.seal({

  views:{}

});



function registerView(
  view
){

  if(
    !view ||
    !view.id
  ){

    return false;

  }

  ViewRegistryState.views[view.id] =
  view;

  return true;

}



function unregisterView(
  viewId
){

  if(
    !viewId ||
    !ViewRegistryState.views[viewId]
  ){

    return false;

  }

  delete ViewRegistryState.views[viewId];

  return true;

}



function getView(
  viewId
){

  return ViewRegistryState.views[viewId] || null;

}



function hasView(
  viewId
){

  return Boolean(
    ViewRegistryState.views[viewId]
  );

}



function listViews(){

  return Object.values(
    ViewRegistryState.views
  );

}



function reset(){

  ViewRegistryState.views = {};

  return true;

}



function snapshot(){

  return {
    views:Object.keys(ViewRegistryState.views)
  };

}



export {

  registerView,

  unregisterView,

  getView,

  hasView,

  listViews,

  reset,

  snapshot

};

export default {
  register:registerView,
  unregister:unregisterView,
  get:getView,
  has:hasView,
  list:listViews,
  reset,
  snapshot
};
