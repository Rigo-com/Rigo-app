// =====================================
// RIGO AI
// STUDIO DASHBOARD ACTIONS
// =====================================

const dashboardActionsState =
Object.seal({

  mounted:
  false,

  root:
  null,

  handlers:
  null

});



// =====================================
// ACTION HANDLER
// =====================================

function handleClick(
  event
){

  const button =
  event
  .target
  ?.closest(
    "[data-dashboard-action]"
  );

  if(
    !button
  ){

    return false;

  }

  const action =
  button
  .getAttribute(
    "data-dashboard-action"
  );

  if(
    !action
  ){

    return false;

  }

  if(
    action === "refresh" &&
    typeof dashboardActionsState.handlers?.onRefresh === "function"
  ){

    dashboardActionsState.handlers
    .onRefresh();

    return true;

  }

  if(
    action === "scan-project" &&
    typeof dashboardActionsState.handlers?.onScanProject === "function"
  ){

    dashboardActionsState.handlers
    .onScanProject();

    return true;

  }

  return false;

}



// =====================================
// MOUNT
// =====================================

function mountActions(
  root,
  handlers = {}
){

  if(
    !root
  ){

    return false;

  }

  unmountActions();

  dashboardActionsState.root =
  root;

  dashboardActionsState.handlers =
  handlers;

  root.addEventListener(
    "click",
    handleClick
  );

  dashboardActionsState.mounted =
  true;

  return true;

}



// =====================================
// UNMOUNT
// =====================================

function unmountActions(){

  if(
    dashboardActionsState.root
  ){

    dashboardActionsState.root
    .removeEventListener(
      "click",
      handleClick
    );

  }

  dashboardActionsState.root =
  null;

  dashboardActionsState.handlers =
  null;

  dashboardActionsState.mounted =
  false;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    mounted:
    dashboardActionsState.mounted

  };

}



// =====================================
// EXPORTS
// =====================================

export {

  mountActions,

  unmountActions,

  snapshot

};

export default {
  mount:mountActions,
  unmount:unmountActions,
  snapshot
};
