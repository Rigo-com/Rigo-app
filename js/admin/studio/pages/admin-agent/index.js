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

import AdminAgentActions
from "./admin-agent-actions.js";



// =====================================
// STATE
// =====================================

const adminAgentPageState =
Object.seal({

  initialized:false,

  mounted:false,

  loading:false,

  error:null,

  input:"",

  container:null,

  messages:[],

  admin:{
    available:false,
    status:"unknown"
  }

});



// =====================================
// MESSAGES
// =====================================

function addMessage(
  role,
  content
){

  adminAgentPageState.messages.push({

    id:
    "admin-agent-message-" + Date.now(),

    role,

    content,

    timestamp:
    Date.now()

  });

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

  adminAgentPageState.admin =
  getAdminStatus();

  container.innerHTML =
  renderLayout(
    adminAgentPageState
  );

  AdminAgentActions.mount(
    container,
    {
      onCommand:runCommand
    }
  );

  const consoleElement =
  container.querySelector(
    ".rigo-admin-agent-console"
  );

  if(
    consoleElement
  ){

    consoleElement.scrollTop =
    consoleElement.scrollHeight;

  }

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

  initialize();

  adminAgentPageState.container =
  container;

  adminAgentPageState.mounted =
  true;

  container.style.cssText =
  `
    height:100%;
    overflow:auto;
    background:#020817;
  `;

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
  String(command || "").trim();

  if(
    !input ||
    adminAgentPageState.loading
  ){

    return false;

  }

  adminAgentPageState.loading =
  true;

  adminAgentPageState.input =
  "";

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
      "admin-agent",
      result
    );

    adminAgentPageState.error =
    null;

  }
  catch(error){

    adminAgentPageState.error =
    error;

    addMessage(
      "error",
      error?.message || String(error)
    );

  }

  adminAgentPageState.loading =
  false;

  render();

  return true;

}



// =====================================
// REFRESH
// =====================================

async function refresh(){

  render();

  return true;

}



// =====================================
// UNMOUNT
// =====================================

function unmount(){

  AdminAgentActions.unmount();

  if(
    adminAgentPageState.container
  ){

    adminAgentPageState.container.innerHTML =
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
    available:false,
    status:"unknown"
  };

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {
    id:"admin-agent",
    initialized:adminAgentPageState.initialized,
    mounted:adminAgentPageState.mounted,
    loading:adminAgentPageState.loading,
    messages:adminAgentPageState.messages.length,
    admin:adminAgentPageState.admin,
    actions:AdminAgentActions.snapshot()
  };

}



// =====================================
// API
// =====================================

const AdminAgentPage =
Object.freeze({

  id:"admin-agent",

  title:"Admin Agent",

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
