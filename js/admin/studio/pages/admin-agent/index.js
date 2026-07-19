// =====================================
// RIGO AI
// STUDIO ADMIN AGENT PAGE
// =====================================

import {

  getAdminStatus,

  executeAdminCommand

}
from "./admin-agent-loader.js";

import {

  renderLayout

}
from "./admin-agent-layout.js";



// =====================================
// STATE
// =====================================

const adminAgentPageState =
Object.seal({

  initialized:
  false,

  mounted:
  false,

  loading:
  false,

  error:
  null,

  input:
  "",

  container:
  null,

  messages:
  [],

  admin:{

    available:
    false,

    status:
    "unknown"

  }

});



// =====================================
// MESSAGE ID
// =====================================

let messageSequence =
0;



function createMessageId(){

  messageSequence +=
  1;

  return [
    "admin-agent-message",
    Date.now(),
    messageSequence
  ]
  .join("-");

}



// =====================================
// ADD MESSAGE
// =====================================

function addMessage(
  role,
  content
){

  adminAgentPageState
  .messages
  .push({

    id:
    createMessageId(),

    role,

    content,

    timestamp:
    Date.now()

  });

  return true;

}



// =====================================
// SCROLL CONSOLE
// =====================================

function scrollConsoleToBottom(){

  const container =
  adminAgentPageState.container;

  if(
    !container
  ){

    return false;

  }

  const consoleElement =
  container.querySelector(
    "[data-admin-agent-console]"
  );

  if(
    !consoleElement
  ){

    return false;

  }

  consoleElement.scrollTop =
  consoleElement.scrollHeight;

  return true;

}



// =====================================
// RENDER
// =====================================

function render(){

  const container =
  adminAgentPageState.container;

  if(
    !container
  ){

    return false;

  }

  try{

    adminAgentPageState.admin =
    getAdminStatus() || {

      available:
      false,

      status:
      "unknown"

    };

  }
  catch(error){

    adminAgentPageState.admin = {

      available:
      false,

      status:
      "error"

    };

    adminAgentPageState.error =
    error;

  }

  container.innerHTML =
  renderLayout(
    adminAgentPageState
  );

  requestAnimationFrame(
    scrollConsoleToBottom
  );

  return true;

}



// =====================================
// INPUT EVENT
// =====================================

function handleInput(
  event
){

  const input =
  event.target.closest(
    "[data-admin-agent-input]"
  );

  if(
    !input
  ){

    return false;

  }

  adminAgentPageState.input =
  input.value;

  return true;

}



// =====================================
// CLICK EVENT
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
    ||
    !adminAgentPageState.container
    ||
    !adminAgentPageState.container.contains(
      button
    )
  ){

    return false;

  }

  event.preventDefault();

  const command =
  button.dataset.adminCommand;

  runCommand(
    command
  );

  return true;

}



// =====================================
// SUBMIT EVENT
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
    ||
    !adminAgentPageState.container
    ||
    !adminAgentPageState.container.contains(
      form
    )
  ){

    return false;

  }

  event.preventDefault();

  const input =
  form.querySelector(
    "[data-admin-agent-input]"
  );

  const command =
  input?.value ||
  adminAgentPageState.input;

  runCommand(
    command
  );

  return true;

}



// =====================================
// BIND EVENTS
// =====================================

function bindEvents(){

  const container =
  adminAgentPageState.container;

  if(
    !container
  ){

    return false;

  }

  container.addEventListener(
    "click",
    handleClick
  );

  container.addEventListener(
    "submit",
    handleSubmit
  );

  container.addEventListener(
    "input",
    handleInput
  );

  return true;

}



// =====================================
// UNBIND EVENTS
// =====================================

function unbindEvents(){

  const container =
  adminAgentPageState.container;

  if(
    !container
  ){

    return false;

  }

  container.removeEventListener(
    "click",
    handleClick
  );

  container.removeEventListener(
    "submit",
    handleSubmit
  );

  container.removeEventListener(
    "input",
    handleInput
  );

  return true;

}



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  if(
    adminAgentPageState.initialized
  ){

    return true;

  }

  adminAgentPageState.initialized =
  true;

  return true;

}



// =====================================
// MOUNT
// =====================================

async function mount(
  container
){

  if(
    !container
  ){

    return false;

  }

  if(
    adminAgentPageState.mounted
  ){

    unmount();

  }

  initialize();

  adminAgentPageState.container =
  container;

  adminAgentPageState.mounted =
  true;

  container.style.height =
  "100%";

  container.style.overflow =
  "auto";

  container.style.background =
  "#020817";

  bindEvents();

  render();

  return true;

}



// =====================================
// RUN COMMAND
// =====================================

async function runCommand(
  command
){

  const input =
  String(
    command || ""
  )
  .trim();

  if(
    !input
    ||
    adminAgentPageState.loading
  ){

    return false;

  }

  adminAgentPageState.loading =
  true;

  adminAgentPageState.input =
  "";

  adminAgentPageState.error =
  null;

  addMessage(
    "user",
    input
  );

  render();

  try{

    const result =
    await executeAdminCommand(
      input
    );

    addMessage(
      "assistant",
      result
    );

  }
  catch(error){

    adminAgentPageState.error =
    error;

    addMessage(
      "error",
      error?.message ||
      String(
        error
      )
    );

  }
  finally{

    adminAgentPageState.loading =
    false;

    render();

  }

  return true;

}



// =====================================
// REFRESH
// =====================================

async function refresh(){

  if(
    !adminAgentPageState.mounted
  ){

    return false;

  }

  return render();

}



// =====================================
// UNMOUNT
// =====================================

function unmount(){

  unbindEvents();

  const container =
  adminAgentPageState.container;

  if(
    container
  ){

    container.innerHTML =
    "";

    container.style.height =
    "";

    container.style.overflow =
    "";

    container.style.background =
    "";

  }

  adminAgentPageState.container =
  null;

  adminAgentPageState.mounted =
  false;

  return true;

}



// =====================================
// RESET
// =====================================

function reset(){

  unmount();

  adminAgentPageState.initialized =
  false;

  adminAgentPageState.loading =
  false;

  adminAgentPageState.error =
  null;

  adminAgentPageState.input =
  "";

  adminAgentPageState.messages =
  [];

  adminAgentPageState.admin = {

    available:
    false,

    status:
    "unknown"

  };

  messageSequence =
  0;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    id:
    "admin-agent",

    initialized:
    adminAgentPageState.initialized,

    mounted:
    adminAgentPageState.mounted,

    loading:
    adminAgentPageState.loading,

    error:
    adminAgentPageState.error
    ? {

        name:
        adminAgentPageState.error.name,

        message:
        adminAgentPageState.error.message

      }
    : null,

    input:
    adminAgentPageState.input,

    messages:
    adminAgentPageState.messages.length,

    admin:{

      ...adminAgentPageState.admin

    }

  };

}



// =====================================
// API
// =====================================

const AdminAgentPage =
Object.freeze({

  id:
  "admin-agent",

  title:
  "Admin Agent",

  initialize,

  mount,

  refresh,

  runCommand,

  unmount,

  reset,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  mount,

  refresh,

  runCommand,

  unmount,

  reset,

  snapshot,

  AdminAgentPage

};

export default
AdminAgentPage;
