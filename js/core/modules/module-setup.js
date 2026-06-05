// =====================================
// RIGO AI
// MODULE SETUP
// SYSTEM REGISTRATION
// =====================================



// =====================================
// IMPORTS
// =====================================

import ModuleRegistry
from "./module-registry.js";

import Memory
from "../../memory/index.js";

import Storage
from "../../storage/index.js";

import Settings
from "../../settings/index.js";

import Search
from "../../search/index.js";

import Communication
from "../../communication/index.js";

import Services
from "../../services/index.js";

import UI
from "../../ui/index.js";

import Voice
from "../../voice/index.js";



// =====================================
// HELPERS
// =====================================

function registerModule(
  name,
  instance,
  options = {}
){

  return ModuleRegistry
  .registerModuleDefinition(

    name,

    async () => instance,

    options

  );

}



// =====================================
// REGISTRATION
// =====================================

function registerCoreModules(){

  registerModule(

    "storage",

    Storage,

    {
      priority:10
    }

  );



  registerModule(

    "settings",

    Settings,

    {
      priority:20,
      dependencies:[
        "storage"
      ]
    }

  );



  registerModule(

    "memory",

    Memory,

    {
      priority:30,
      dependencies:[
        "storage"
      ]
    }

  );



  registerModule(

    "search",

    Search,

    {
      priority:40,
      dependencies:[
        "memory"
      ]
    }

  );



  registerModule(

    "communication",

    Communication,

    {
      priority:50
    }

  );



  registerModule(

    "services",

    Services,

    {
      priority:60,
      dependencies:[
        "communication"
      ]
    }

  );



  registerModule(

    "ui",

    UI,

    {
      priority:70
    }

  );



  registerModule(

    "voice",

    Voice,

    {
      priority:80,
      dependencies:[
        "ui"
      ]
    }

  );

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  registerCoreModules

};

export default
registerCoreModules;
