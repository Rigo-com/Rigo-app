// =====================================
// RIGO AI
// CHAT MODULE INDEX
// CENTRAL EXPORT HUB
// =====================================



// =====================================
// CONFIG
// =====================================

export * from "./chat-config.js";



// =====================================
// STATE
// =====================================

export * from "./chat-state/index.js";



// =====================================
// EVENTS
// =====================================

export * from "./chat-events/index.js";



// =====================================
// RUNTIME
// =====================================

export * from "./chat-runtime/index.js";



// =====================================
// SERVICES
// =====================================

export * from "./chat-services/index.js";



// =====================================
// ACTIONS
// =====================================

export * from "./chat-actions/index.js";



// =====================================
// UI
// =====================================

export * from "./chat-ui/index.js";



// =====================================
// IMPORTS
// =====================================

import ChatStates
from "./chat-state/index.js";

import ChatEvents
from "./chat-events/index.js";

import ChatRuntime
from "./chat-runtime/index.js";

import ChatServices
from "./chat-services/index.js";

import ChatActions
from "./chat-actions/index.js";

import ChatUI
from "./chat-ui/index.js";



// =====================================
// MEMORY SHORTCUT
// =====================================

function mountMemoryShortcut(){

  if(
    typeof document === "undefined"
  ){
    return false;
  }

  const sidebar =
  document.getElementById(
    "sidebar"
  );

  if(
    !sidebar
    ||
    document.getElementById(
      "memory-manager"
    )
  ){
    return false;
  }

  const adminButton =
  document.getElementById(
    "admin"
  );

  const memoryButton =
  document.createElement(
    "button"
  );

  memoryButton.id =
  "memory-manager";

  memoryButton.type =
  "button";

  memoryButton.className =
  "side-btn";

  memoryButton.textContent =
  "Memory";

  memoryButton.onclick =
  () => {

    window.location.href =
    "./memory.html";

  };

  if(
    adminButton
    &&
    adminButton.parentNode === sidebar
  ){

    sidebar.insertBefore(
      memoryButton,
      adminButton
    );

  }
  else{

    sidebar.appendChild(
      memoryButton
    );

  }

  return true;

}

if(
  typeof document !== "undefined"
){

  if(
    document.readyState ===
    "loading"
  ){

    document.addEventListener(
      "DOMContentLoaded",
      mountMemoryShortcut,
      {once:true}
    );

  }
  else{

    mountMemoryShortcut();

  }

}



// =====================================
// CHAT MODULE
// =====================================

const Chat =
Object.freeze({

  State:
  ChatStates,

  Events:
  ChatEvents,

  Runtime:
  ChatRuntime,

  Services:
  ChatServices,

  Actions:
  ChatActions,

  UI:
  ChatUI

});



// =====================================
// EXPORTS
// =====================================

export {

  Chat,

  mountMemoryShortcut

};

export default
Chat;
