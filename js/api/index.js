// =====================================
// RIGO AI
// API INDEX
// ENTRY POINT
// =====================================

import {
  API_CONFIG
}
from "./api-config.js";

import {
  apiState
}
from "./api-state.js";

import APIRuntime
from "./api-runtime.js";

import APIManager
from "./api-manager.js";

async function initializeAPI(){
  return APIManager.initialize();
}

async function bootAPI(){
  return APIManager.start();
}

async function startAPI(){
  return bootAPI();
}

async function shutdownAPI(){
  return APIManager.shutdown();
}

async function resetAPI(){
  return APIManager.reset();
}

function createAPISnapshot(){
  return Object.freeze({
    manager:APIManager.snapshot(),
    runtime:APIRuntime.snapshot(),
    timestamp:Date.now()
  });
}

const API = Object.freeze({
  config:API_CONFIG,
  state:apiState,
  runtime:APIRuntime,
  manager:APIManager,
  initialize:initializeAPI,
  boot:bootAPI,
  start:startAPI,
  shutdown:shutdownAPI,
  reset:resetAPI,
  snapshot:createAPISnapshot
});

export {
  API_CONFIG,
  apiState,
  APIRuntime,
  APIManager,
  initializeAPI,
  bootAPI,
  startAPI,
  shutdownAPI,
  resetAPI,
  createAPISnapshot,
  API
};

export default API;
