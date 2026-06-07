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

  Chat

};

export default
Chat;
