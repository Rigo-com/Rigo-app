// =====================================
// RIGO AI
// STUDIO ADMIN AGENT ACTIONS
// =====================================

const adminAgentActionsState =
Object.seal({

  mounted:false,

  root:null,

  handlers:null

});



function handleSubmit(
  event
){

  const form =
  event
  .target
  ?.closest(
    "[data-admin-agent-form]"
  );

  if(
    !form
  ){

    return false;

  }

  event.preventDefault();

  const input =
  form.querySelector(
    "[data-admin-agent-input]"
  );

  const value =
  input?.value?.trim() || "";

  if(
    value &&
    typeof adminAgentActionsState.handlers?.onCommand === "function"
  ){

    adminAgentActionsState.handlers.onCommand(
      value
    );

  }

  return true;

}



function handleClick(
  event
){

  const button =
  event
  .target
  ?.closest(
    "[data-admin-command]"
  );

  if(
    !button
  ){

    return false;

  }

  const command =
  button.getAttribute(
    "data-admin-command"
  );

  if(
    command &&
    typeof adminAgentActionsState.handlers?.onCommand === "function"
  ){

    adminAgentActionsState.handlers.onCommand(
      command
    );

    return true;

  }

  return false;

}



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

  adminAgentActionsState.root =
  root;

  adminAgentActionsState.handlers =
  handlers;

  root.addEventListener(
    "submit",
    handleSubmit
  );

  root.addEventListener(
    "click",
    handleClick
  );

  adminAgentActionsState.mounted =
  true;

  return true;

}



function unmountActions(){

  if(
    adminAgentActionsState.root
  ){

    adminAgentActionsState.root.removeEventListener(
      "submit",
      handleSubmit
    );

    adminAgentActionsState.root.removeEventListener(
      "click",
      handleClick
    );

  }

  adminAgentActionsState.root =
  null;

  adminAgentActionsState.handlers =
  null;

  adminAgentActionsState.mounted =
  false;

  return true;

}



function snapshot(){

  return {
    mounted:adminAgentActionsState.mounted
  };

}



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
