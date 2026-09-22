import { RIGOContainer } from "../core/container/index.js";
import { SERVICE_LIFECYCLES, isValidServiceLifecycle } from "./service-types.js";

function validateServiceRegistration(serviceName, factory, options = {}){
  const name = String(serviceName ?? "").trim();
  if(!name) throw new Error("INVALID_SERVICE_NAME");
  if(typeof factory !== "function") throw new Error("INVALID_SERVICE_FACTORY");

  if(!options || typeof options !== "object" || Array.isArray(options)){
    throw new Error("INVALID_SERVICE_OPTIONS");
  }

  const dependencies = options.dependencies ?? [];
  if(!Array.isArray(dependencies) || dependencies.some(dep => typeof dep !== "string" || !dep.trim())){
    throw new Error("INVALID_SERVICE_DEPENDENCIES");
  }

  const lifecycle = options.lifecycle ?? SERVICE_LIFECYCLES.SINGLETON;
  if(!isValidServiceLifecycle(lifecycle)){
    throw new Error("INVALID_SERVICE_LIFECYCLE");
  }

  return { name, dependencies:[...dependencies], lifecycle };
}

async function registerService(serviceName, factory, options = {}){
  const definition = validateServiceRegistration(serviceName, factory, options);

  await RIGOContainer.register({
    name:definition.name,
    factory,
    dependencies:definition.dependencies,
    lifecycle:definition.lifecycle
  });

  return true;
}

function unregisterService(serviceName){
  return RIGOContainer.remove(serviceName);
}

function hasRegisteredService(serviceName){
  return RIGOContainer.has(serviceName);
}

function getRegisteredServices(){
  return RIGOContainer.services();
}

function getServiceRegistrationDiagnostics(){
  return Object.freeze({
    registered:RIGOContainer.services().length,
    services:Object.freeze([...RIGOContainer.services()]),
    timestamp:Date.now()
  });
}

export {
  validateServiceRegistration,
  registerService,
  unregisterService,
  hasRegisteredService,
  getRegisteredServices,
  getServiceRegistrationDiagnostics
};
