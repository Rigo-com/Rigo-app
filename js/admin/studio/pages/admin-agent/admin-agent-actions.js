// =====================================
// RIGO AI
// STUDIO ADMIN AGENT ACTIONS
// CHAT CONTROLLER
// =====================================



// =====================================
// STATE
// =====================================

const adminAgentActionsState =
Object.seal({

  mounted:
  false,

  root:
  null,

  handlers:
  null

});



// =====================================
// GET COMMAND HANDLER
// =====================================

function getCommandHandler(){

  const handler =
  adminAgentActionsState
  .handlers
  ?.onCommand;

  if(
    typeof handler !==
    "function"
  ){

    return null;

  }

  return handler;

}



// =====================================
// GET FORM INPUT
// =====================================

function getFormInput(
  form
){

  if(
    !form
  ){

    return null;

  }

  return form.querySelector(
    "[data-admin-agent-input]"
  );

}



// =====================================
// HANDLE SUBMIT
// =====================================

async function handleSubmit(
  event
){

  const form =
  event.target
  ?.closest(
    "[data-admin-agent-form]"
  );

  if(
    !form
    ||
    !adminAgentActionsState.root
    ||
    !adminAgentActionsState.root.contains(
      form
    )
  ){

    return false;

  }

  event.preventDefault();

  const input =
  getFormInput(
    form
  );

  const command =
  String(
    input?.value || ""
  )
  .trim();

  if(
    !command
  ){

    input?.focus();

    return false;

  }

  const handler =
  getCommandHandler();

  if(
    !handler
  ){

    return false;

  }

  await handler(
    command
  );

  return true;

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

  adminAgentActionsState.root =
  root;

  adminAgentActionsState.handlers =
  handlers;

  root.addEventListener(
    "submit",
    handleSubmit
  );

  adminAgentActionsState.mounted =
  true;

  const input =
  root.querySelector(
    "[data-admin-agent-input]"
  );

  input?.focus();

  return true;

}



// =====================================
// UNMOUNT
// =====================================

function unmount(){

  const root =
  adminAgentActionsState.root;

  if(
    root
  ){

    root.removeEventListener(
      "submit",
      handleSubmit
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



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    mounted:
    adminAgentActionsState.mounted,

    hasRoot:
    Boolean(
      adminAgentActionsState.root
    ),

    hasCommandHandler:
    Boolean(
      getCommandHandler()
    )

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
