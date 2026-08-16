import ModuleRegistry from "./module-registry.js";
import Shared from "../../shared/index.js";
import Security from "../../security/index.js";
import Debug from "../../debug/index.js";
import Storage from "../../storage/index.js";
import Auth from "../../auth/index.js";
import Settings from "../../settings/index.js";
import Memory from "../../memory/index.js";
import Search from "../../search/index.js";
import Communication from "../../communication/index.js";
import API from "../../api/index.js";
import Services from "../../services/index.js";
import UI from "../../ui/index.js";
import Voice from "../../voice/index.js";
import ServiceManager from "../../services/service-manager.js";

const SearchModule = Object.freeze({
  ...Search,
  initialize:async() => Search.initialize(),
  shutdown:async() => Search.shutdown(),
  snapshot:() => Search.snapshot()
});

const CommunicationModule = Object.freeze({
  ...Communication,
  initialize:async() => Communication.core.initialize(),
  shutdown:async() => Communication.core.destroy(),
  snapshot:() => Communication.health.getHealthReport()
});

const MemoryModule = Object.freeze({
  ...Memory,
  initialize:async() => {
    await Memory.initialize();
    if(!ServiceManager.has("memory")) await ServiceManager.register("memory", async() => Memory);
    return true;
  },
  shutdown:async() => Memory.shutdown(),
  snapshot:() => Memory.health()
});

function registerModule(name, instance, options = {}){
  return ModuleRegistry.registerModuleDefinition(name, async() => instance, options);
}

function registerCoreModules(){
  registerModule("shared", Shared, { priority:0 });
  registerModule("security", Security, { priority:5, dependencies:["shared"] });
  registerModule("debug", Debug, { priority:8, dependencies:["security"] });
  registerModule("storage", Storage, { priority:10, dependencies:["shared"] });
  registerModule("auth", Auth, { priority:15, dependencies:["storage", "security"] });
  registerModule("settings", Settings, { priority:20, dependencies:["storage"] });
  registerModule("memory", MemoryModule, { priority:30, dependencies:["storage"] });
  registerModule("search", SearchModule, { priority:40, dependencies:["memory"] });
  registerModule("communication", CommunicationModule, { priority:50, dependencies:["security"] });
  registerModule("api", API, { priority:55, dependencies:["communication", "auth", "security"] });
  registerModule("services", Services, { priority:60, dependencies:["communication", "api"] });
  registerModule("ui", UI, { priority:70, dependencies:["settings", "auth", "services"] });
  registerModule("voice", Voice, { priority:80, dependencies:["ui", "services"] });
  return true;
}

export { SearchModule, CommunicationModule, MemoryModule, registerCoreModules };
export default registerCoreModules;
