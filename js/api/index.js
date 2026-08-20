import { API_CONFIG } from "./api-config.js";
import { apiState } from "./api-state.js";
import APIRuntime from "./api-runtime.js";
import APIManager from "./api-manager.js";
import APIEvents from "./api-events.js";

const initializeAPI = () => APIManager.initialize();
const bootAPI = () => APIManager.start();
const startAPI = bootAPI;
const shutdownAPI = () => APIManager.shutdown();
const resetAPI = () => APIManager.reset();
const createAPISnapshot = () => Object.freeze({ manager:APIManager.snapshot(), runtime:APIRuntime.snapshot(), timestamp:Date.now() });

const API = Object.freeze({
  id:"api", priority:55,
  config:API_CONFIG, state:apiState, runtime:APIRuntime, manager:APIManager, events:APIEvents,
  initialize:initializeAPI, boot:bootAPI, start:startAPI,
  shutdown:shutdownAPI, reset:resetAPI, snapshot:createAPISnapshot
});

export { API_CONFIG, apiState, APIRuntime, APIManager, APIEvents, initializeAPI, bootAPI, startAPI, shutdownAPI, resetAPI, createAPISnapshot, API };
export default API;
