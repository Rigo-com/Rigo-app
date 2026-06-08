// =====================================
// RIGO AI
// BOOTSTRAP SETUP
// SYSTEM REGISTRATION
// =====================================

import Core
from "../core/index.js";

import ChatRuntime
from "../chat/chat-runtime/chat-runtime.js";

import {
  registerBootstrapSystem
}
from "./bootstrap-registry.js";



// =====================================
// REGISTER CORE
// =====================================

function registerCoreSystem(){

  return registerBootstrapSystem({

    id:
    "core",

    priority:
    0,

    initialize:
    Core.initialize,

    boot:
    Core.boot,

    shutdown:
    Core.shutdown

  });

}

function registerChatSystem(){

  return registerBootstrapSystem({

    id:
    "chat",

    priority:
    10,

    initialize:
    ChatRuntime.initialize,

    shutdown:
    ChatRuntime.destroy

  });

}



// =====================================
// REGISTER ALL
// =====================================

function registerBootstrapSystems(){

  registerCoreSystem();

  registerChatSystem();

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  registerCoreSystem,

  registerBootstrapSystems

};

export default
registerBootstrapSystems;
