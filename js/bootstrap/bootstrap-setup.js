// =====================================
// RIGO AI
// BOOTSTRAP SETUP
// SYSTEM REGISTRATION
// =====================================

import Core
from "../core/index.js";

import ChatRuntime
from "../chat/chat-runtime/chat-runtime.js";

import Debug
from "../debug/index.js";

import Memory
from "../memory/index.js";

import Admin
from "../admin/index.js";

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

function registerDebugSystem(){

  return registerBootstrapSystem({

    id:
    "debug",

    priority:
    20,

    initialize:
    Debug.initialize,

    shutdown:
    Debug.stop

  });

}

function registerMemorySystem(){

  return registerBootstrapSystem({

    id:
    "memory",

    priority:
    20,

    initialize:
    Memory.initialize,

    shutdown:
    Memory.shutdown

  });

}

function registerAdminSystem(){

  return registerBootstrapSystem({

    id:
    "admin",

    priority:
    30,

    initialize:
    Admin.initialize,

    boot:
    Admin.boot,

    shutdown:
    Admin.shutdown

  });

}



// =====================================
// REGISTER ALL
// =====================================

function registerBootstrapSystems(){

  registerCoreSystem();

  registerChatSystem();

  registerMemorySystem();

  registerDebugSystem();

  registerAdminSystem();

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  registerCoreSystem,

  registerChatSystem,

  registerDebugSystem,

  registerMemorySystem,

  registerAdminSystem,

  registerBootstrapSystems

};

export default
registerBootstrapSystems;
