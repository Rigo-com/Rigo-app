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
// CONFIG
// =====================================

const ADMIN_AI_CHAT_ENDPOINT =
"/api/admin-ai-chat";



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
// MESSAGE SEQUENCE
// =====================================

let messageSequence =
0;



// =====================================
// CREATE MESSAGE ID
// =====================================

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
// UPDATE ADMIN STATUS
// =====================================

function updateAdminStatus(){

  try{

    adminAgentPageState.admin =
    getAdminStatus() || {

      available:
      false,

      status:
      "unknown"

    };

    return true;

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

    return false;

  }

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
// NORMALIZE RESPONSE BODY
// =====================================

async function readResponseBody(
  response
){

  const rawBody =
  await response.text();

  if(
    !rawBody
  ){

    return {};

  }

  try{

    return JSON.parse(
      rawBody
    );

  }
  catch{

    return {

      ok:
      false,

      error:
      rawBody

    };

  }

}



// =====================================
// UNMATCHED ROUTE CHECK
// =====================================

function isUnmatchedAdminRoute(
  result
){

  if(
    !result ||
    typeof result !==
    "object"
  ){

    return false;

  }

  if(
    result.mode ===
    "admin-agent-router"
  ){

    return true;

  }

  return (
    result.message ===
    "Admin Agent command received. No matching route found."
  );

}



// =====================================
// CHAT HISTORY
// =====================================

function createChatHistory(){

  return adminAgentPageState
  .messages
  .filter(
    function(message){

      return (

        (
          message.role ===
          "user"
        )

        ||

        (
          message.role ===
          "assistant" &&

          typeof message.content ===
          "string"
        )

      );

    }
  )
  .slice(
    -20
  )
  .map(
    function(message){

      return {

        role:
        message.role,

        content:
        String(
          message.content || ""
        )

      };

    }
  );

}


function createProjectContext(){

  return `
Project: RIGO AI

Architecture:

Bootstrap
Core
Container
Systems
Agents
AI
Memory
Communication
UI
Extensions

Rules:

- Container-first architecture.
- Modular JavaScript project.
- Admin Agent has project administration responsibilities.
- Never claim code execution unless confirmed.
- Prefer existing modules over creating new ones.
- Preserve current architecture.

`.trim();

}



// =====================================
// ADMIN AI CHAT
// =====================================

async function requestAdminAI(
  input
){

  const response =
  await fetch(
    ADMIN_AI_CHAT_ENDPOINT,
    {

      method:
      "POST",

      credentials:
      "same-origin",

      headers:{

        "Content-Type":
        "application/json"

      },

      body:
JSON.stringify({

  message:
  input,

  messages:
  createChatHistory(),

  context:
  createProjectContext()

})

    }
  );

  const result =
  await readResponseBody(
    response
  );

  if(
    !response.ok ||
    result?.ok === false
  ){

    const error =
    new Error(

      result?.error ||

      `ADMIN_AI_CHAT_FAILED:${response.status}`

    );

    error.status =
    response.status;

    error.details =
    result?.details ||
    null;

    throw error;

  }

  if(
    typeof result?.message !==
    "string" ||
    !result.message.trim()
  ){

    throw new Error(
      "ADMIN_AI_CHAT_EMPTY_RESPONSE"
    );

  }

  return result.message.trim();

}



// =====================================
// PROCESS COMMAND
// =====================================

async function processCommand(
  input
){

  const adminResult =
  await executeAdminCommand(
    input
  );

  if(
    !isUnmatchedAdminRoute(
      adminResult
    )
  ){

    return adminResult;

  }

  return requestAdminAI(
    input
  );

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

  updateAdminStatus();

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

  render();

  AdminAgentActions.mount(
    container,
    {

      onCommand:
      runCommand

    }
  );

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
    !input ||
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
    await processCommand(
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

  AdminAgentActions.unmount();

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

    },

    actions:
    AdminAgentActions.snapshot()

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
