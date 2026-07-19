// =====================================
// RIGO AI
// STUDIO ADMIN AGENT ACTIONS
// =====================================

const AdminAgentActionsState =
Object.seal({

  mounted:
  false,

  root:
  null,

  handlers:
  null

});



// =====================================
// HELPERS
// =====================================

function getHandler(
  name
){

  return
  AdminAgentActionsState
  .handlers?.[
    name
  ];

}



function executeCommand(
  command
){

  if(
    !command
  ){

    return false;

  }

  const handler =
  getHandler(
    "onCommand"
  );

  if(
    typeof handler !==
    "function"
  ){

    return false;

  }

  handler(
    command
  );

  return true;

}



// =====================================
// INPUT SUBMIT
// =====================================

function handleSubmit(
  event
){

  const form =
  event.target.closest(
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

  return executeCommand(

    input?.value
    ?.trim()

  );

}



// =====================================
// QUICK ACTION
// =====================================

function handleClick(
  event
){

  const button =
  event.target.closest(
    "[data-admin-command]"
  );

  if(
    !button
  ){

    return false;

  }

  return executeCommand(

    button.dataset
    .adminCommand

  );

}



// =====================================
// MOUNT
// =====================================

function mount(
  root,
  handlers = {}
){

  if(
    !root
  ){

    return false;

  }

  unmount();

  AdminAgentActionsState.root =
  root;

  AdminAgentActionsState.handlers =
  handlers;

  root.addEventListener(
    "submit",
    handleSubmit
  );

  root.addEventListener(
    "click",
    handleClick
  );

  AdminAgentActionsState.mounted =
  true;

  return true;

}



// =====================================
// UNMOUNT
// =====================================

function unmount(){

  const root =
  AdminAgentActionsState
  .root;

  if(
    root
  ){

    root.removeEventListener(
      "submit",
      handleSubmit
    );

    root.removeEventListener(
      "click",
      handleClick
    );

  }

  AdminAgentActionsState.root =
  null;

  AdminAgentActionsState.handlers =
  null;

  AdminAgentActionsState.mounted =
  false;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    mounted:
    AdminAgentActionsState
    .mounted

  };

}



// =====================================
// API
// =====================================

const AdminAgentActions =
Object.freeze({

  mount,

  unmount,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  mount,

  unmount,

  snapshot,

  AdminAgentActions

};

export default
AdminAgentActions;
