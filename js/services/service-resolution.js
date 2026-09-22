import { RIGOContainer } from "../core/container/index.js";

function resolveService(container, serviceName, scope = "global"){
  const target = container && typeof container.resolve === "function"
    ? container
    : RIGOContainer;
  return target.resolve(serviceName, scope);
}

function resolveServices(container, serviceNames = [], scope = "global"){
  const target = container && typeof container.resolveMany === "function"
    ? container
    : RIGOContainer;
  return target.resolveMany(serviceNames, scope);
}

export { resolveService, resolveServices };
