// =====================================
// RIGO AI
// CHAT MODULE INDEX
// CENTRAL EXPORT HUB
// =====================================

export * from "./chat-config.js";
export * from "./chat-state/index.js";
export * from "./chat-events/index.js";
export * from "./chat-runtime/index.js";
export * from "./chat-services/index.js";
export * from "./chat-actions/index.js";
export * from "./chat-ui/index.js";

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

function mountMemoryShortcut(){
  if(typeof document === "undefined") return false;

  const sidebar = document.getElementById("sidebar");
  if(!sidebar) return false;

  let memoryButton =
    document.getElementById("memory") ||
    document.getElementById("memory-manager");

  if(!memoryButton){
    const adminButton = document.getElementById("admin");
    memoryButton = document.createElement("button");
    memoryButton.id = "memory-manager";
    memoryButton.type = "button";
    memoryButton.className = "side-btn";
    memoryButton.textContent = "Memory";

    if(adminButton && adminButton.parentNode === sidebar){
      sidebar.insertBefore(memoryButton,adminButton);
    }
    else{
      sidebar.appendChild(memoryButton);
    }
  }

  memoryButton.onclick = () => {
    window.location.href = "./memory.html";
  };

  return true;
}

function bindChatElements(){
  if(typeof document === "undefined") return false;

  const root = document.querySelector(".chat");
  const messages = document.getElementById("conversation");
  const input = document.getElementById("input");
  const sendButton = document.getElementById("send");
  const scrollContainer = document.getElementById("messages");

  if(!root && !messages && !input && !sendButton && !scrollContainer){
    return false;
  }

  ChatUI.ChatElements.registerElements({
    root,
    messages,
    input,
    sendButton,
    scrollContainer
  });

  return true;
}

function mountChatBindings(){
  mountMemoryShortcut();
  bindChatElements();
  return true;
}

if(typeof document !== "undefined"){
  if(document.readyState === "loading"){
    document.addEventListener(
      "DOMContentLoaded",
      mountChatBindings,
      {once:true}
    );
  }
  else{
    mountChatBindings();
  }
}

const Chat = Object.freeze({
  State:ChatStates,
  Events:ChatEvents,
  Runtime:ChatRuntime,
  Services:ChatServices,
  Actions:ChatActions,
  UI:ChatUI,
  bindUI:bindChatElements,
  mount:mountChatBindings
});

export {
  Chat,
  mountMemoryShortcut,
  bindChatElements,
  mountChatBindings
};

export default Chat;
