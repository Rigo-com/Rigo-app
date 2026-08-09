// =====================================
// RIGO AI
// MODULE SETUP
// SYSTEM REGISTRATION
// =====================================

import ModuleRegistry
from "./module-registry.js";

import Shared
from "../../shared/index.js";

import Security
from "../../security/index.js";

import Storage
from "../../storage/index.js";

import Auth
from "../../auth/index.js";

import Settings
from "../../settings/index.js";

import Memory
from "../../memory/index.js";

import Search
from "../../search/index.js";

import Communication
from "../../communication/index.js";

import API
from "../../api/index.js";

import Services
from "../../services/index.js";

import UI
from "../../ui/index.js";

import Voice
from "../../voice/index.js";


// =====================================
// LIFECYCLE ADAPTERS
// =====================================

const SearchModule =
Object.freeze({
  ...Search,

  initialize:
  async() => Search.core.initialize(),

  shutdown:
  async() => Search.core.destroy(),

  snapshot:
  () => Search.health.getHealthReport()
});


const CommunicationModule =
Object.freeze({
  ...Communication,

  initialize:
  async() => Communication.core.initialize(),

  shutdown:
  async() => Communication.core.destroy(),

  snapshot:
  () => Communication.health.getHealthReport()
});


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
    "shared",
    Shared,
    {
      priority:0
    }
  );

  registerModule(
    "security",
    Security,
    {
      priority:5,
      dependencies:[
        "shared"
      ]
    }
  );

  registerModule(
    "storage",
    Storage,
    {
      priority:10,
      dependencies:[
        "shared"
      ]
    }
  );

  registerModule(
    "auth",
    Auth,
    {
      priority:15,
      dependencies:[
        "storage",
        "security"
      ]
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
    SearchModule,
    {
      priority:40,
      dependencies:[
        "memory"
      ]
    }
  );

  registerModule(
    "communication",
    CommunicationModule,
    {
      priority:50,
      dependencies:[
        "security"
      ]
    }
  );

  registerModule(
    "api",
    API,
    {
      priority:55,
      dependencies:[
        "communication",
        "auth",
        "security"
      ]
    }
  );

  registerModule(
    "services",
    Services,
    {
      priority:60,
      dependencies:[
        "communication",
        "api"
      ]
    }
  );

  registerModule(
    "ui",
    UI,
    {
      priority:70,
      dependencies:[
        "settings",
        "auth",
        "services"
      ]
    }
  );

  registerModule(
    "voice",
    Voice,
    {
      priority:80,
      dependencies:[
        "ui",
        "services"
      ]
    }
  );

  return true;
}


// =====================================
// EXPORTS
// =====================================

export {
  SearchModule,
  CommunicationModule,
  registerCoreModules
};

export default
registerCoreModules;
